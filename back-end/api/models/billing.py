from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class BillStatusEnum(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class BillItem(BaseModel):
    task_id: str
    title: str
    date: str
    hours: float
    hourly_rate: float
    subtotal: float


class MonthlyBillResponse(BaseModel):
    bill_id: str
    student_id: str
    student_name: str
    month: str
    year: int
    total_hours: float
    total_amount: float
    status: BillStatusEnum
    items: List[BillItem] = []
    submitted_at: Optional[str] = None
    verified_at: Optional[str] = None
    approved_at: Optional[str] = None
    notes: Optional[str] = None


class BillSubmitPayload(BaseModel):
    month: str = Field(..., description="Month name or number, e.g. July or 07")
    year: int = Field(..., description="Year, e.g. 2026")
    notes: Optional[str] = Field(None, description="Optional notes for faculty review")


class BillActionPayload(BaseModel):
    action: str = Field(..., description="Action: VERIFY, APPROVE, or REJECT")
    notes: Optional[str] = Field(None, description="Action feedback or signoff notes")
