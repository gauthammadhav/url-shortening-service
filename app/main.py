from fastapi import FastAPI
from pydantic import BaseModel,HttpUrl
import random
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
from app.schemas import URLResponse
Base.metadata.create_all(bind=engine)   
app=FastAPI()
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
class URLRequest(BaseModel):
    url:HttpUrl
    
def generate_short_code():
    return uuid.uuid4().hex[:8]

@app.post("/urls",response_model=URLResponse)
def create_url(request:URLRequest, db:Session=Depends(get_db)):
    while True:
        short_code = generate_short_code()
        stmt = select(URL).where(URL.short_code == short_code)
        existing_url = db.scalar(stmt)
        if existing_url is None:
            break
    url = URL(original_url=request.url, short_code=short_code)
    db.add(url)
    db.commit()
    db.refresh(url)
    return URLResponse(
        original_url=url.original_url,
        short_code=url.short_code
    )
    # short_code = generate_short_code()
    # url_db[short_code] = request.url
    # print(url_db)
    # return {
    #     "url":request.url,
    #     "short_code":short_code
    # }
@app.get("/{short_code}")
def get_url(short_code:str,db:Session=Depends(get_db)):
    stmt = select(URL).where(URL.short_code == short_code)
    url = db.scalars(stmt).all()
   #old sqlalchemdy format 
    # url = db.query(URL).filter(URL.short_code == short_code).first()
    if url:
        return RedirectResponse(url=url.original_url)
    else:
        raise HTTPException(status_code=404, detail="Short code not found")
app.get("/urls/{short_code}", response_model=URLResponse)
def get_url(short_code:str, db:Session=Depends(get_db)):
    stmt=select(URL).where(URL.short_code == short_code)
    url=db.scalar(stmt)
    if url is None:
        raise HTTPException(status_code=404, detail="Short code not found")
    else:
        return URLResponse(
            original_url=url.original_url,
            short_code=url.short_code
        )
app.get("/urls", response_model=list[URLResponse])
def get_all_urls(db:Session=Depends(get_db)):
    stmt=select(URL)
    urls=db.scalars(stmt).all()
    return [URLResponse(original_url=url.original_url, short_code=url.short_code) for url in urls]
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
    url.original_url=request.url
    db.commit()
    return URLResponse(
        original_url=url.original_url,
        short_code=url.short_code
    )
    
