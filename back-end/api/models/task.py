from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class TaskType(str, Enum):
    LAB = "LAB"
    EXAM = "EXAM"
    FACULTY = "FACULTY"


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    SWAPPED = "SWAPPED"
    CANCELLED = "CANCELLED"


class DutyTaskBase(BaseModel):
    title: str = Field(..., description="Duty title, e.g. Physics Lab Prep")
    task_type: TaskType = Field(default=TaskType.LAB, description="Task Type")
    location: str = Field(..., description="Duty location, e.g. Physics Lab 302")
    scheduled_date: str = Field(..., description="Date YYYY-MM-DD")
    start_time: str = Field(..., description="Start Time HH:MM")
    end_time: str = Field(..., description="End Time HH:MM")
    hourly_rate: float = Field(default=15.0, description="Hourly rate in USD")
    student_id: Optional[str] = Field(None, description="Assigned Student User ID")
    assigned_by: str = Field(..., description="Assignor User ID / Name")


class DutyTaskCreate(DutyTaskBase):
    pass


class DutyTaskResponse(DutyTaskBase):
    id: str
    status: TaskStatus
    log_notes: Optional[str] = None
    created_at: str


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
    log_notes: Optional[str] = None


class ShiftSwapRequest(BaseModel):
    task_id: str
    reason: str


class ShiftSwapResponse(BaseModel):
    swap_id: str
    task_id: str
    requestor_id: str
    requestor_name: str
    target_role: str
    reason: str
    status: str
    created_at: str
