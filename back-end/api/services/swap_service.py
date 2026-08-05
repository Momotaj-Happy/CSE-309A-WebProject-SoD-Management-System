import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from api.models.swap import (
    SwapRequestCreate,
    ShiftSwapResponse,
    SwapStatusEnum,
    AuditLogEntry
)
from api.services.schedule_service import ScheduleService

# In-memory stores
_SWAPS_DB: Dict[str, dict] = {}
_AUDIT_LOG_DB: List[dict] = []


def _init_demo_swaps():
    """Seeds initial demo swap and audit log data."""
    if _SWAPS_DB:
        return

    swap_id = "swap-1"
    now_str = datetime.now(timezone.utc).isoformat()

    demo_swap = ShiftSwapResponse(
        swap_id=swap_id,
        task_id="task-1",
        requestor_id="mock-1",
        requestor_name="Momotaj Happy",
        target_role="STUDENT",
        reason="Academic schedule overlap with PHY202 lecture at 09:00 AM.",
        status=SwapStatusEnum.OPEN,
        created_at=now_str
    )
    _SWAPS_DB[swap_id] = demo_swap.model_dump()

    demo_audit = AuditLogEntry(
        id=str(uuid.uuid4()),
        event_type="SWAP_CREATED",
        swap_id=swap_id,
        task_id="task-1",
        performed_by="Momotaj Happy",
        details="Shift swap requested for Physics 101 Mechanics Lab Prep",
        timestamp=now_str
    )
    _AUDIT_LOG_DB.append(demo_audit.model_dump())


_init_demo_swaps()


class SwapService:
    @staticmethod
    def create_swap(requestor_id: str, requestor_name: str, payload: SwapRequestCreate) -> ShiftSwapResponse:
        swap_id = f"swap-{uuid.uuid4().hex[:8]}"
        now_str = datetime.now(timezone.utc).isoformat()

        new_swap = ShiftSwapResponse(
            swap_id=swap_id,
            task_id=payload.task_id,
            requestor_id=requestor_id,
            requestor_name=requestor_name,
            target_role="STUDENT",
            reason=payload.reason.strip(),
            status=SwapStatusEnum.OPEN,
            created_at=now_str
        )

        _SWAPS_DB[swap_id] = new_swap.model_dump()

        # Record immutable audit log
        audit_entry = AuditLogEntry(
            id=str(uuid.uuid4()),
            event_type="SWAP_CREATED",
            swap_id=swap_id,
            task_id=payload.task_id,
            performed_by=requestor_name,
            details=f"Created shift swap request: '{payload.reason.strip()}'",
            timestamp=now_str
        )
        _AUDIT_LOG_DB.append(audit_entry.model_dump())

        return new_swap

    @staticmethod
    def list_swaps(status_filter: Optional[str] = None) -> List[ShiftSwapResponse]:
        results = []
        for s in _SWAPS_DB.values():
            if status_filter and s.get("status") != status_filter:
                continue
            results.append(ShiftSwapResponse(**s))
        return results

    @staticmethod
    def get_swap(swap_id: str) -> Optional[ShiftSwapResponse]:
        data = _SWAPS_DB.get(swap_id)
        if not data:
            return None
        return ShiftSwapResponse(**data)

    @staticmethod
    def accept_swap(swap_id: str, acceptor_id: str, acceptor_name: str) -> Optional[ShiftSwapResponse]:
        swap_data = _SWAPS_DB.get(swap_id)
        if not swap_data or swap_data["status"] != SwapStatusEnum.OPEN.value:
            return None

        if swap_data["requestor_id"] == acceptor_id:
            raise ValueError("You cannot accept your own shift swap request")

        now_str = datetime.now(timezone.utc).isoformat()
        swap_data["status"] = SwapStatusEnum.ACCEPTED.value
        swap_data["acceptor_id"] = acceptor_id
        swap_data["acceptor_name"] = acceptor_name

        # Audit log entry
        audit_entry = AuditLogEntry(
            id=str(uuid.uuid4()),
            event_type="SWAP_ACCEPTED",
            swap_id=swap_id,
            task_id=swap_data["task_id"],
            performed_by=acceptor_name,
            details=f"Accepted shift swap from {swap_data['requestor_name']}",
            timestamp=now_str
        )
        _AUDIT_LOG_DB.append(audit_entry.model_dump())

        return ShiftSwapResponse(**swap_data)

    @staticmethod
    def cancel_swap(swap_id: str, user_id: str) -> bool:
        swap_data = _SWAPS_DB.get(swap_id)
        if not swap_data or swap_data["status"] != SwapStatusEnum.OPEN.value:
            return False

        if swap_data["requestor_id"] != user_id:
            raise PermissionError("Only the swap requestor can cancel this request")

        now_str = datetime.now(timezone.utc).isoformat()
        swap_data["status"] = SwapStatusEnum.CANCELLED.value

        audit_entry = AuditLogEntry(
            id=str(uuid.uuid4()),
            event_type="SWAP_CANCELLED",
            swap_id=swap_id,
            task_id=swap_data["task_id"],
            performed_by=swap_data["requestor_name"],
            details="Shift swap request withdrawn",
            timestamp=now_str
        )
        _AUDIT_LOG_DB.append(audit_entry.model_dump())

        return True

    @staticmethod
    def get_audit_logs() -> List[AuditLogEntry]:
        return [AuditLogEntry(**entry) for entry in reversed(_AUDIT_LOG_DB)]
