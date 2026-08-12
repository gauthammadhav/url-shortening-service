from fastapi import FastAPI, status, Request
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid
import os
import time
from app.logging_config import logger 
from dotenv import load_dotenv
load_dotenv()


BASE_URL = os.getenv("BASE_URL")

if BASE_URL is None:
    raise ValueError("BASE_URL environment variable is not set.")
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.router import router as auth_router
from app.models import URL, User
from app.schemas import URLResponse, URLRequest
from fastapi.middleware.cors import CORSMiddleware
"""
docker
.env vars
middleware
code linting : ruff / auto-pep8 / black / isort
package manager: poetry / astral UV
python generators (yield vs return)
module / package : init.py
duner methods / data model methods
def __new__():...
from typing import List
JWT internals
"""

app = FastAPI()
@app.middleware("http")
async def log_requests(request:Request,call_next):
    start_time=time.perf_counter()

    response = await call_next(request)
    process_time = (time.perf_counter()-start_time)*1000

    logger.info(
        f"Request {request.method} {request.url.path} - {response.status_code} - {process_time:.2f} ms"
    )

    return response
    
app.include_router(auth_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the URL Shortener API!"}
@app.get("/health")
def health():
    return {"status": "healthy"}
@app.get("/about")
def about():
    return {"project": "URL Shortener",
            "version": "1.0"}
@app.get("/hello")
def hello(name:str):
    return {
        "message":f"Hello, {name}!"
    }
@app.post("/hello")
def hello_post():
    return {
        "message":"Hello from POST request!"
    }

    
def generate_short_code():
    return uuid.uuid4().hex[:8]


def build_short_url(short_code: str) -> str:
    return f"{BASE_URL}/{short_code}"

@app.post("/urls", response_model=URLResponse, status_code=status.HTTP_201_CREATED)
def create_url(
    request: URLRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    while True:
        short_code = generate_short_code()
        stmt = select(URL).where(URL.short_code == short_code)
        existing_url = db.scalar(stmt)
        if existing_url is None:
            break
    url = URL(
        original_url=str(request.url),
        short_code=short_code,
        user_id=current_user.id,
    )
    db.add(url)
    db.commit()
    db.refresh(url)

    logger.info(
        f"URL created - user_id={current_user.id} - short_code={url.short_code}"
    )
    
    shortened_url = build_short_url(url.short_code)

    return URLResponse(
        original_url=url.original_url,
        short_code=url.short_code,
        click_count=url.click_count,
        shortened_url=shortened_url
    )
    # short_code = generate_short_code()
    # url_db[short_code] = request.url
    # print(url_db)
    # return {
    #     "url":request.url,
    #     "short_code":short_code
    # }
    
@app.get("/urls/{short_code}", response_model=URLResponse)
def get_url_info(
    short_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(URL).where(
        URL.short_code == short_code,
        URL.user_id == current_user.id,
    )
    url=db.scalar(stmt)
    if url is None:
        raise HTTPException(status_code=404, detail="Short code not found")
    shortened_url = build_short_url(url.short_code)
    return URLResponse(
        original_url=url.original_url,
        short_code=url.short_code,
        click_count=url.click_count,
        shortened_url=shortened_url
        )

@app.get("/urls", response_model=list[URLResponse])
def get_all_urls(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(URL).where(URL.user_id == current_user.id)
    urls=db.scalars(stmt).all()
    return [URLResponse(original_url=url.original_url, short_code=url.short_code, click_count=url.click_count, shortened_url=build_short_url(url.short_code)) for url in urls]


@app.delete("/urls/{short_code}")
def delete_url(
    short_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(URL).where(
        URL.short_code == short_code,
        URL.user_id == current_user.id,
    )
    url=db.scalar(stmt)
    if url is None:
        raise HTTPException(status_code=404, detail="short code not found")
    db.delete(url)
    db.commit()
    return {"message": f"Short code {short_code} deleted successfully."}


@app.put("/urls/{short_code}", response_model=URLResponse)
def update_url(
    short_code: str,
    request: URLRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(URL).where(
        URL.short_code == short_code,
        URL.user_id == current_user.id,
    )
    url=db.scalar(stmt)
    if url is None:
        raise HTTPException(status_code=404, detail="Short code not found")
    url.original_url=str(request.url)
    db.commit()
    db.refresh(url)
    shortened_url = build_short_url(url.short_code)
    return URLResponse(
        original_url=url.original_url,
        short_code=url.short_code,
        click_count=url.click_count,
        shortened_url=shortened_url
    )
    
@app.get("/{short_code}")
def redirect_url(short_code:str,db:Session=Depends(get_db)):
    stmt = select(URL).where(URL.short_code == short_code)
    url = db.scalar(stmt)
   #old sqlalchemdy format 
    # url = db.query(URL).filter(URL.short_code == short_code).first()
    if url is None:
        raise HTTPException(status_code=404, detail="Short code not found")
    url.click_count += 1
    db.commit()
    return RedirectResponse(url=url.original_url)
    

    
