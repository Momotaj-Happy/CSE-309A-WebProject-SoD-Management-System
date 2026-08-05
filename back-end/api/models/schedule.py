from pydantic import BaseModel
from typing import List, Optional

class CourseItem(BaseModel):
    id: str
    name: str
    section: str
    room: str
    days: str
    time: str

class ScheduleRequest(BaseModel):
    raw_text: str

class SaveScheduleRequest(BaseModel):
    courses: List[CourseItem]

class UnavailableSlotCreate(BaseModel):
    day: str  # MON, TUE, WED, THU, FRI, SAT, SUN
    start_time: str  # HH:MM
    end_time: str    # HH:MM
    note: Optional[str] = "Unavailable"

class UnavailableSlotResponse(BaseModel):
    id: str
    day: str
    start_time: str
    end_time: str
    note: str
    created_at: str

class ScheduleResponse(BaseModel):
    success: bool
    courses: List[CourseItem] = []
    unavailable_slots: List[UnavailableSlotResponse] = []