from pydantic import BaseModel
class URLResponse(BaseModel):
    original_url:str
    short_code:str
    click_count:int
    shortened_url:str|None=None