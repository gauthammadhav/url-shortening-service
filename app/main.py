from fastapi import FastAPI
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