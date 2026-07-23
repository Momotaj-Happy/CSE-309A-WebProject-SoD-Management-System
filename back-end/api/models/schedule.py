from pydantic import BaseModel
from typing import List

class CourseItem(BaseModel):
    id: str
    name: str
    section: str
    room: str
    days: str
    time: str

class ScheduleRequest(BaseModel):
    raw_text: str

class ScheduleResponse(BaseModel):
    success: bool
    courses: List[CourseItem]