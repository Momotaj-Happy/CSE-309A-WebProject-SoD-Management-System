import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from api.models.billing import (
    MonthlyBillResponse,
    BillItem,
    BillStatusEnum,
    BillSubmitPayload,
    BillActionPayload
)
from api.services.task_service import TaskService, TaskStatus

_BILLS_DB: Dict[str, dict] = {}


def _init_demo_bills():
    if _BILLS_DB:
        return

    demo_items = [
        BillItem(
            task_id="task-3",
            title="Quantum Research Data Analysis",
            date="2026-07-26",
            hours=3.0,
            hourly_rate=22.00,
            subtotal=66.00
        )
    ]

    bill1_id = "bill-demo-1"
    _BILLS_DB[bill1_id] = {
        "bill_id": bill1_id,
        "student_id": "mock-1",
        "student_name": "Momotaj Happy",
        "month": "July",
        "year": 2026,
        "total_hours": 3.0,
        "total_amount": 66.00,
        "status": BillStatusEnum.SUBMITTED,
        "items": [item.model_dump() for item in demo_items],
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "verified_at": None,
        "approved_at": None,
        "notes": "Please review completed quantum research hours."
    }


_init_demo_bills()


class BillingService:
    @staticmethod
    def get_current_bill(student_id: str, student_name: str) -> MonthlyBillResponse:
        # Check if student already has a pending or submitted bill
        for b in _BILLS_DB.values():
            if b["student_id"] == student_id and b["status"] in [BillStatusEnum.DRAFT, BillStatusEnum.SUBMITTED, BillStatusEnum.VERIFIED]:
                return MonthlyBillResponse(**b)

        # Calculate completed task hours for student
        tasks = TaskService.get_all_tasks(student_id=student_id, status=TaskStatus.COMPLETED.value)
        items = []
        total_hours = 0.0
        total_amount = 0.0

        for t in tasks:
            # Calculate hours (e.g. 09:00 to 12:00 -> 3 hours)
            try:
                sh, sm = map(int, t.start_time.split(":"))
                eh, em = map(int, t.end_time.split(":"))
                hrs = max(0.0, (eh * 60 + em - (sh * 60 + sm)) / 60.0)
            except Exception:
                hrs = 2.0

            sub = hrs * t.hourly_rate
            total_hours += hrs
            total_amount += sub

            items.append(BillItem(
                task_id=t.id,
                title=t.title,
                date=t.scheduled_date,
                hours=hrs,
                hourly_rate=t.hourly_rate,
                subtotal=sub
            ))

        bill_id = f"bill-{uuid.uuid4()}"
        bill_data = {
            "bill_id": bill_id,
            "student_id": student_id,
            "student_name": student_name,
            "month": "July",
            "year": 2026,
            "total_hours": total_hours,
            "total_amount": total_amount,
            "status": BillStatusEnum.DRAFT,
            "items": [i.model_dump() for i in items],
            "submitted_at": None,
            "verified_at": None,
            "approved_at": None,
            "notes": None
        }

        _BILLS_DB[bill_id] = bill_data
        return MonthlyBillResponse(**bill_data)

    @staticmethod
    def submit_bill(student_id: str, student_name: str, payload: BillSubmitPayload) -> MonthlyBillResponse:
        current = BillingService.get_current_bill(student_id, student_name)
        bill_id = current.bill_id

        _BILLS_DB[bill_id]["status"] = BillStatusEnum.SUBMITTED
        _BILLS_DB[bill_id]["month"] = payload.month
        _BILLS_DB[bill_id]["year"] = payload.year
        _BILLS_DB[bill_id]["submitted_at"] = datetime.now(timezone.utc).isoformat()
        if payload.notes:
            _BILLS_DB[bill_id]["notes"] = payload.notes

        return MonthlyBillResponse(**_BILLS_DB[bill_id])

    @staticmethod
    def get_pending_bills(role: str) -> List[MonthlyBillResponse]:
        results = []
        role_upper = role.upper()

        for b in _BILLS_DB.values():
            if role_upper == "FACULTY" and b["status"] == BillStatusEnum.SUBMITTED:
                results.append(MonthlyBillResponse(**b))
            elif role_upper in ["DEPT_MGR", "LAB_MGR", "MANAGER", "ADMIN"] and b["status"] in [BillStatusEnum.SUBMITTED, BillStatusEnum.VERIFIED]:
                results.append(MonthlyBillResponse(**b))

        return results

    @staticmethod
    def verify_bill(bill_id: str, notes: Optional[str] = None) -> Optional[MonthlyBillResponse]:
        if bill_id not in _BILLS_DB:
            return None

        _BILLS_DB[bill_id]["status"] = BillStatusEnum.VERIFIED
        _BILLS_DB[bill_id]["verified_at"] = datetime.now(timezone.utc).isoformat()
        if notes:
            _BILLS_DB[bill_id]["notes"] = notes

        return MonthlyBillResponse(**_BILLS_DB[bill_id])

    @staticmethod
    def approve_bill(bill_id: str, notes: Optional[str] = None) -> Optional[MonthlyBillResponse]:
        if bill_id not in _BILLS_DB:
            return None

        _BILLS_DB[bill_id]["status"] = BillStatusEnum.APPROVED
        _BILLS_DB[bill_id]["approved_at"] = datetime.now(timezone.utc).isoformat()
        if notes:
            _BILLS_DB[bill_id]["notes"] = notes

        return MonthlyBillResponse(**_BILLS_DB[bill_id])

    @staticmethod
    def reject_bill(bill_id: str, notes: Optional[str] = None) -> Optional[MonthlyBillResponse]:
        if bill_id not in _BILLS_DB:
            return None

        _BILLS_DB[bill_id]["status"] = BillStatusEnum.REJECTED
        if notes:
            _BILLS_DB[bill_id]["notes"] = notes

        return MonthlyBillResponse(**_BILLS_DB[bill_id])

    @staticmethod
    def get_student_history(student_id: str) -> List[MonthlyBillResponse]:
        return [MonthlyBillResponse(**b) for b in _BILLS_DB.values() if b["student_id"] == student_id]
