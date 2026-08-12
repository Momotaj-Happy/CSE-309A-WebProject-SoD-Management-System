from fastapi import APIRouter, Depends, HTTPException, status
from api.models.schedule import (
    ScheduleRequest,
    SaveScheduleRequest,
    CourseItem,
    CourseUpdate,
    UnavailableSlotCreate,
    UnavailableSlotResponse,
    ScheduleResponse
)
from api.services.parser_service import ParserService
from api.services.schedule_service import ScheduleService
from api.services.auth_service import get_current_token_payload
from api.models.user import UserRole

router = APIRouter(prefix="/schedule", tags=["Schedule Engine & Availability"])


@router.post("/parse", response_model=ScheduleResponse)
async def parse_schedule(payload: ScheduleRequest):
    """Parses raw IRAS academic schedule text into structured course slots."""
    if not payload.raw_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Raw text cannot be empty")

    courses = ParserService.parse_raw_text(payload.raw_text)
    return ScheduleResponse(success=True, courses=courses, unavailable_slots=[])


@router.post("/save", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
def save_student_schedule(
    payload: SaveScheduleRequest,
    token_payload: dict = Depends(get_current_token_payload)
):
    """Saves parsed academic schedule for the authenticated student."""
    student_id = token_payload.get("sub")
    if not student_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

    return ScheduleService.save_schedule(student_id, payload.courses)


@router.get("/me", response_model=ScheduleResponse)
def get_my_schedule(token_payload: dict = Depends(get_current_token_payload)):
    """Retrieves the academic schedule and unavailable slots of the logged-in student."""
    student_id = token_payload.get("sub")
    if not student_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

    return ScheduleService.get_schedule(student_id)


@router.get("/student/{student_id}", response_model=ScheduleResponse)
def get_student_schedule_by_id(
    student_id: str,
    token_payload: dict = Depends(get_current_token_payload)
):
    """Retrieves a specific student's schedule. Restricted to Faculty and Manager roles."""
    current_role = token_payload.get("role")
    if current_role not in [UserRole.FACULTY, UserRole.LAB_MGR, UserRole.DEPT_MGR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Faculty and Managers can inspect student schedules."
        )

    return ScheduleService.get_schedule(student_id)


@router.put("/courses/{course_id}", response_model=CourseItem)
def update_course(
    course_id: str,
    payload: CourseUpdate,
    token_payload: dict = Depends(get_current_token_payload)
):
    """Updates specific attributes of an enrolled course."""
    student_id = token_payload.get("sub")
    if not student_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

    updated = ScheduleService.update_course(student_id, course_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found in schedule")
    return updated


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: str,
    token_payload: dict = Depends(get_current_token_payload)
):
    """Deletes a course from the student's academic schedule."""
    student_id = token_payload.get("sub")
    if not student_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

    success = ScheduleService.delete_course(student_id, course_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found in schedule")
    return None


@router.post("/unavailable", response_model=UnavailableSlotResponse, status_code=status.HTTP_201_CREATED)
def add_unavailable_slot(
    payload: UnavailableSlotCreate,
    token_payload: dict = Depends(get_current_token_payload)
):
    """Creates a custom unavailable time slot for the authenticated student."""
    student_id = token_payload.get("sub")
    if not student_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

    return ScheduleService.add_unavailable_slot(student_id, payload)


@router.delete("/unavailable/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unavailable_slot(
    slot_id: str,
    token_payload: dict = Depends(get_current_token_payload)
):
    """Deletes a custom unavailable time slot."""
    student_id = token_payload.get("sub")
    if not student_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

    success = ScheduleService.delete_unavailable_slot(student_id, slot_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unavailable slot not found")
    return None