from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class DreamSchema(BaseModel):
    name: str
    description: str
    dream_date: date
    lucidity: bool
    sleep_duration: Optional[int]
    recurring: Optional[bool] = False
    room_temp: Optional[int]
    stress_before_sleep: Optional[int]
    emotions: List[str] = []