from fastapi import APIRouter, HTTPException
from models.schedule import ScheduleRequest, ScheduleResponse
from services.parser_service import ParserService

router = APIRouter(prefix="/api/schedule", tags=["Schedule"])

@router.post("/parse", response_model=ScheduleResponse)
async def parse_schedule(payload: ScheduleRequest):
    if not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Raw text cannot be empty")
    
    courses = ParserService.parse_raw_text(payload.raw_text)
    return ScheduleResponse(success=True, courses=courses)