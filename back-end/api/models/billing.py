from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional


class BillStatusEnum(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class BillItem(BaseModel):
    task_id: str
    title: str
    scheduled_date: str
    hours: float
    hourly_rate: float
    subtotal: float


class MonthlyBillResponse(BaseModel):
    bill_id: str
    student_id: str
    student_name: str
    dept_id: Optional[str] = "SOD-2024-001"
    month_year: str
    total_hours: float
    total_amount: float
    status: BillStatusEnum
    items: List[BillItem] = []
    submitted_at: Optional[str] = None
    verified_at: Optional[str] = None
    approved_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None


class BillSubmitPayload(BaseModel):
    month_year: str = Field("2026-07", description="Month and year, e.g. 2026-07")
    notes: Optional[str] = Field(None, description="Optional notes for faculty review")


class BillActionPayload(BaseModel):
    action: str = Field(..., description="Action: VERIFY, APPROVE, or REJECT")
    notes: Optional[str] = Field(None, description="Action feedback or signoff notes")
