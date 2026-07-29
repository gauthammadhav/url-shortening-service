from fastapi import FastAPI, status
from pydantic import BaseModel,HttpUrl
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from app.database import Base, engine
from app import models
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid
from app.database import get_db
from app.models import URL
from app.schemas import URLResponse, URLRequest
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
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
    return f"http://localhost:8000/{short_code}"

@app.post("/urls", response_model=URLResponse, status_code=status.HTTP_201_CREATED)
def create_url(request:URLRequest, db:Session=Depends(get_db)):
    while True:
        short_code = generate_short_code()
        stmt = select(URL).where(URL.short_code == short_code)
        existing_url = db.scalar(stmt)
        if existing_url is None:
            break
    url = URL(original_url=str(request.url), short_code=short_code)
    db.add(url)
    db.commit()
    db.refresh(url)
    
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
def get_url_info(short_code:str, db:Session=Depends(get_db)):
    stmt=select(URL).where(URL.short_code == short_code)
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
def get_all_urls(db:Session=Depends(get_db)):
    print("GET /urls endpoint called")
    stmt=select(URL)
    urls=db.scalars(stmt).all()
    return [URLResponse(original_url=url.original_url, short_code=url.short_code, click_count=url.click_count, shortened_url=build_short_url(url.short_code)) for url in urls]


@app.delete("/urls/{short_code}")
def delete_url(short_code:str, db:Session=Depends(get_db)):
    stmt=select(URL).where(URL.short_code == short_code)
    url=db.scalar(stmt)
    if url is None:
        raise HTTPException(status_code=404, detail="short code not found")
    db.delete(url)
    db.commit()
    return {"message": f"Short code {short_code} deleted successfully."}


@app.put("/urls/{short_code}", response_model=URLResponse)
def update_url(short_code:str, request:URLRequest, db:Session=Depends(get_db)):
    stmt=select(URL).where(URL.short_code==short_code)
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
    

    
