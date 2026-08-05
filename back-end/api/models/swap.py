from enum import Enum
from pydantic import BaseModel
from typing import Optional, List


class SwapStatusEnum(str, Enum):
    OPEN = "OPEN"
    ACCEPTED = "ACCEPTED"
    CANCELLED = "CANCELLED"


class SwapRequestCreate(BaseModel):
    task_id: str
    reason: str


class ShiftSwapResponse(BaseModel):
    swap_id: str
    task_id: str
    requestor_id: str
    requestor_name: str
    target_role: str = "STUDENT"
    reason: str
    status: SwapStatusEnum = SwapStatusEnum.OPEN
    acceptor_id: Optional[str] = None
    acceptor_name: Optional[str] = None
    created_at: str


class AuditLogEntry(BaseModel):
    id: str
    event_type: str  # SWAP_CREATED, SWAP_ACCEPTED, SWAP_CANCELLED
    swap_id: str
    task_id: str
    performed_by: str
    details: str
    timestamp: str
