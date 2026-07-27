from fastapi import FastAPI
from pydantic import BaseModel
import random
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
url_db={}
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
    url:str
    
def generate_short_code():
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    code= ""
    for _ in range(6):
        code+=random.choice(characters)
    return code

@app.post("/urls")
def create_url(request:URLRequest):
    short_code = generate_short_code()
    url_db[short_code] = request.url
    print(url_db)
    return {
        "url":request.url,
        "short_code":short_code
    }
@app.get("/{short_code}")
def get_url(short_code:str):
    if short_code in url_db:
        original_url = url_db[short_code]
        return RedirectResponse(url=original_url)
    else:
        raise HTTPException(status_code=404, detail="Short code not found")
     