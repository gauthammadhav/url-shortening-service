from pydantic import BaseModel, HttpUrl
class URLRequest(BaseModel):
    url:HttpUrl

class URLResponse(BaseModel):
    original_url:str
    short_code:str
    click_count:int
    shortened_url:str|None=None