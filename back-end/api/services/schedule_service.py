import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from api.models.schedule import (
    CourseItem,
    UnavailableSlotCreate,
    UnavailableSlotResponse,
    ScheduleResponse
)

# In-memory dictionary store: student_id -> {"courses": [...], "unavailable_slots": [...]}
_SCHEDULES_DB: Dict[str, dict] = {}


def _init_demo_schedules():
    """Seeds a default schedule for mock student 'mock-1' (Momotaj Happy)."""
    if _SCHEDULES_DB:
        return

    demo_courses = [
        CourseItem(
            id="PHY101",
            name="General Physics I",
            section="1",
            room="Lab201",
            days="MON,WED",
            time="09:00 - 11:00"
        ),
        CourseItem(
            id="MAT201",
            name="Multivariable Calculus",
            section="2",
            room="HallB",
            days="TUE,THU",
            time="11:30 - 13:00"
        ),
        CourseItem(
            id="PHY101L",
            name="Physics Lab I",
            section="1L",
            room="Lab104",
            days="FRI",
            time="14:00 - 17:00"
        )
    ]

    slot_id = str(uuid.uuid4())
    demo_unavailable = [
        UnavailableSlotResponse(
            id=slot_id,
            day="SUN",
            start_time="10:00",
            end_time="12:00",
            note="Departmental Study Circle",
            created_at=datetime.now(timezone.utc).isoformat()
        )
    ]

    _SCHEDULES_DB["mock-1"] = {
        "courses": [c.model_dump() for c in demo_courses],
        "unavailable_slots": [s.model_dump() for s in demo_unavailable]
    }


_init_demo_schedules()


class ScheduleService:
    @staticmethod
    def get_schedule(student_id: str) -> ScheduleResponse:
        student_data = _SCHEDULES_DB.get(student_id)
        if not student_data:
            return ScheduleResponse(success=True, courses=[], unavailable_slots=[])

        courses = [CourseItem(**c) for c in student_data.get("courses", [])]
        slots = [UnavailableSlotResponse(**s) for s in student_data.get("unavailable_slots", [])]
        return ScheduleResponse(success=True, courses=courses, unavailable_slots=slots)

    @staticmethod
    def save_schedule(student_id: str, courses: List[CourseItem]) -> ScheduleResponse:
        if student_id not in _SCHEDULES_DB:
            _SCHEDULES_DB[student_id] = {"courses": [], "unavailable_slots": []}

        _SCHEDULES_DB[student_id]["courses"] = [c.model_dump() for c in courses]
        return ScheduleService.get_schedule(student_id)

    @staticmethod
    def add_unavailable_slot(student_id: str, payload: UnavailableSlotCreate) -> UnavailableSlotResponse:
        if student_id not in _SCHEDULES_DB:
            _SCHEDULES_DB[student_id] = {"courses": [], "unavailable_slots": []}

        slot_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        new_slot = UnavailableSlotResponse(
            id=slot_id,
            day=payload.day.upper().strip(),
            start_time=payload.start_time.strip(),
            end_time=payload.end_time.strip(),
            note=payload.note or "Unavailable",
            created_at=created_at
        )

        _SCHEDULES_DB[student_id]["unavailable_slots"].append(new_slot.model_dump())
        return new_slot

    @staticmethod
    def delete_unavailable_slot(student_id: str, slot_id: str) -> bool:
        if student_id not in _SCHEDULES_DB:
            return False

        slots = _SCHEDULES_DB[student_id].get("unavailable_slots", [])
        initial_count = len(slots)
        _SCHEDULES_DB[student_id]["unavailable_slots"] = [s for s in slots if s["id"] != slot_id]
        return len(_SCHEDULES_DB[student_id]["unavailable_slots"]) < initial_count
