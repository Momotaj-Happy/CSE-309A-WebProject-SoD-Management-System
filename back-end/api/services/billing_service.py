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
from api.services.task_service import TaskService

_BILLS_DB: Dict[str, dict] = {}


def _init_demo_bills():
    if _BILLS_DB:
        return

    demo_bill = {
        "bill_id": "bill-2026-07-mock1",
        "student_id": "mock-1",
        "student_name": "Momotaj Happy",
        "dept_id": "SOD-2024-001",
        "month_year": "2026-07",
        "total_hours": 6.0,
        "total_amount": 120.0,
        "status": BillStatusEnum.DRAFT.value,
        "items": [
            {
                "task_id": "task-3",
                "title": "Quantum Research Data Analysis",
                "scheduled_date": "2026-07-26",
                "hours": 3.0,
                "hourly_rate": 22.00,
                "subtotal": 66.00
            },
            {
                "task_id": "task-demo-completed",
                "title": "Physics 101 Lab Assistant Duty",
                "scheduled_date": "2026-07-20",
                "hours": 3.0,
                "hourly_rate": 18.00,
                "subtotal": 54.00
            }
        ],
        "submitted_at": None,
        "verified_at": None,
        "approved_at": None,
        "rejection_reason": None,
        "notes": None
    }
    _BILLS_DB[demo_bill["bill_id"]] = demo_bill


_init_demo_bills()


class BillingService:
    @staticmethod
    def get_or_create_current_bill(student_id: str, student_name: str, dept_id: str = "SOD-2024-001", month_year: str = "2026-07") -> MonthlyBillResponse:
        bill_id = f"bill-{month_year}-{student_id}"

        # If bill exists, return existing
        if bill_id in _BILLS_DB:
            return MonthlyBillResponse(**_BILLS_DB[bill_id])

        # Calculate completed task hours for student
        completed_tasks = TaskService.get_all_tasks(student_id=student_id, status="COMPLETED")
        items = []
        total_hrs = 0.0
        total_amt = 0.0

        for t in completed_tasks:
            hrs = 3.0
            subtotal = hrs * t.hourly_rate
            total_hrs += hrs
            total_amt += subtotal
            items.append(
                BillItem(
                    task_id=t.id,
                    title=t.title,
                    scheduled_date=t.scheduled_date,
                    hours=hrs,
                    hourly_rate=t.hourly_rate,
                    subtotal=subtotal
                )
            )

        bill_data = {
            "bill_id": bill_id,
            "student_id": student_id,
            "student_name": student_name,
            "dept_id": dept_id,
            "month_year": month_year,
            "total_hours": total_hrs,
            "total_amount": round(total_amt, 2),
            "status": BillStatusEnum.DRAFT.value,
            "items": [item.model_dump() for item in items],
            "submitted_at": None,
            "verified_at": None,
            "approved_at": None,
            "rejection_reason": None,
            "notes": None
        }

        _BILLS_DB[bill_id] = bill_data
        return MonthlyBillResponse(**bill_data)

    @staticmethod
    def submit_bill(student_id: str, student_name: str, dept_id: str = "SOD-2024-001", month_year: str = "2026-07") -> MonthlyBillResponse:
        bill = BillingService.get_or_create_current_bill(student_id, student_name, dept_id, month_year)

        bill_id = bill.bill_id
        now_iso = datetime.now(timezone.utc).isoformat()

        _BILLS_DB[bill_id]["status"] = BillStatusEnum.SUBMITTED.value
        _BILLS_DB[bill_id]["submitted_at"] = now_iso

        return MonthlyBillResponse(**_BILLS_DB[bill_id])

    @staticmethod
    def get_student_bill_history(student_id: str) -> List[MonthlyBillResponse]:
        results = []
        for b in _BILLS_DB.values():
            if b.get("student_id") == student_id:
                results.append(MonthlyBillResponse(**b))
        return results

    @staticmethod
    def get_bills_by_status(status: BillStatusEnum) -> List[MonthlyBillResponse]:
        results = []
        for b in _BILLS_DB.values():
            status_val = status.value if isinstance(status, BillStatusEnum) else status
            if b.get("status") == status_val:
                results.append(MonthlyBillResponse(**b))
        return results

    @staticmethod
    def get_pending_bills(role: str) -> List[MonthlyBillResponse]:
        results = []
        role_upper = role.upper()

        for b in _BILLS_DB.values():
            if role_upper == "FACULTY" and b.get("status") in [BillStatusEnum.SUBMITTED.value, BillStatusEnum.SUBMITTED]:
                results.append(MonthlyBillResponse(**b))
            elif role_upper in ["DEPT_MGR", "LAB_MGR", "MANAGER", "ADMIN"] and b.get("status") in [BillStatusEnum.SUBMITTED.value, BillStatusEnum.VERIFIED.value, BillStatusEnum.SUBMITTED, BillStatusEnum.VERIFIED]:
                results.append(MonthlyBillResponse(**b))

        return results

    @staticmethod
    def verify_bill(bill_id: str, notes: Optional[str] = None) -> Optional[MonthlyBillResponse]:
        if bill_id not in _BILLS_DB:
            return None

        _BILLS_DB[bill_id]["status"] = BillStatusEnum.VERIFIED.value
        _BILLS_DB[bill_id]["verified_at"] = datetime.now(timezone.utc).isoformat()
        if notes:
            _BILLS_DB[bill_id]["notes"] = notes

        return MonthlyBillResponse(**_BILLS_DB[bill_id])

    @staticmethod
    def approve_bill(bill_id: str, notes: Optional[str] = None) -> Optional[MonthlyBillResponse]:
        if bill_id not in _BILLS_DB:
            return None

        _BILLS_DB[bill_id]["status"] = BillStatusEnum.APPROVED.value
        _BILLS_DB[bill_id]["approved_at"] = datetime.now(timezone.utc).isoformat()
        if notes:
            _BILLS_DB[bill_id]["notes"] = notes

        return MonthlyBillResponse(**_BILLS_DB[bill_id])

    @staticmethod
    def reject_bill(bill_id: str, notes: Optional[str] = None) -> Optional[MonthlyBillResponse]:
        if bill_id not in _BILLS_DB:
            return None

        _BILLS_DB[bill_id]["status"] = BillStatusEnum.REJECTED.value
        if notes:
            _BILLS_DB[bill_id]["notes"] = notes
            _BILLS_DB[bill_id]["rejection_reason"] = notes

        return MonthlyBillResponse(**_BILLS_DB[bill_id])
