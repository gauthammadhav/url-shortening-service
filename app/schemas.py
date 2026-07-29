from pydantic import BaseModel
class URLResponse(BaseModel):
    original_url:str
    short_code:str