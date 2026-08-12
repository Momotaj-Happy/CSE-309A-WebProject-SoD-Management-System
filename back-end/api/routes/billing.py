from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from api.models.billing import MonthlyBillResponse, BillSubmitPayload, BillStatusEnum
from api.services.billing_service import BillingService
from api.services.auth_service import get_current_token_payload

router = APIRouter(prefix="/bills", tags=["Student Monthly Billing"])


@router.get("/my-current", response_model=MonthlyBillResponse)
def get_current_bill(
    month_year: str = Query("2026-07", description="Month and year (e.g. 2026-07)"),
    payload: dict = Depends(get_current_token_payload)
):
    """Retrieves current student's calculated monthly bill draft or active submission."""
    student_id = payload.get("sub", "mock-1")
    student_name = payload.get("full_name", "Momotaj Happy")
    dept_id = payload.get("dept_id", "SOD-2024-001")

    return BillingService.get_or_create_current_bill(
        student_id=student_id,
        student_name=student_name,
        dept_id=dept_id,
        month_year=month_year
    )


@router.post("/submit", response_model=MonthlyBillResponse, status_code=status.HTTP_201_CREATED)
def submit_monthly_bill(
    submit_payload: BillSubmitPayload,
    payload: dict = Depends(get_current_token_payload)
):
    """Submits draft monthly bill for faculty verification."""
    student_id = payload.get("sub", "mock-1")
    student_name = payload.get("full_name", "Momotaj Happy")
    dept_id = payload.get("dept_id", "SOD-2024-001")

    return BillingService.submit_bill(
        student_id=student_id,
        student_name=student_name,
        dept_id=dept_id,
        month_year=submit_payload.month_year
    )


@router.get("/student/{student_id}", response_model=List[MonthlyBillResponse])
def get_student_bill_history(
    student_id: str,
    payload: dict = Depends(get_current_token_payload)
):
    """Reads bill history for a specific student."""
    return BillingService.get_student_bill_history(student_id)


@router.get("/pending-verification", response_model=List[MonthlyBillResponse])
def get_pending_verification_bills(payload: dict = Depends(get_current_token_payload)):
    """Lists submitted bills pending faculty verification."""
    return BillingService.get_bills_by_status(BillStatusEnum.SUBMITTED)


@router.get("/pending-approval", response_model=List[MonthlyBillResponse])
def get_pending_approval_bills(payload: dict = Depends(get_current_token_payload)):
    """Lists verified bills pending department manager approval."""
    return BillingService.get_bills_by_status(BillStatusEnum.VERIFIED)
