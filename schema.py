from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class DreamSchema(BaseModel):
    name: str
    description: str
    dreamdate: date
    lucidity: bool
    sleepduration: Optional[int]
    recurring: Optional[bool] = False
    roomtemp: Optional[int]
    stressbeforesleep: Optional[int]
    emotions: List[str] = []