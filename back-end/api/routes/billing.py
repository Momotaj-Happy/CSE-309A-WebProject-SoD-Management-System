from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from api.models.billing import (
    MonthlyBillResponse,
    BillSubmitPayload,
    BillActionPayload,
    BillStatusEnum
)
from api.services.billing_service import BillingService
from api.services.auth_service import get_current_token_payload, get_current_user

router = APIRouter(prefix="/bills", tags=["Monthly Financial Billing & Approval Pipeline"])


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


@router.get("/pending", response_model=List[MonthlyBillResponse])
def get_pending_bills(
    user: dict = Depends(get_current_user)
):
    """Retrieves pending bills awaiting verification or approval based on caller's role."""
    return BillingService.get_pending_bills(role=user.get("role", "STUDENT"))


@router.patch("/{bill_id}/verify", response_model=MonthlyBillResponse)
def verify_student_bill(
    bill_id: str,
    payload: Optional[BillActionPayload] = None,
    user: dict = Depends(get_current_user)
):
    """Faculty action: Verifies a student's submitted monthly bill (SUBMITTED -> VERIFIED)."""
    notes = payload.notes if payload else None
    verified = BillingService.verify_bill(bill_id, notes=notes)
    if not verified:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return verified


@router.patch("/{bill_id}/approve", response_model=MonthlyBillResponse)
def approve_student_bill(
    bill_id: str,
    payload: Optional[BillActionPayload] = None,
    user: dict = Depends(get_current_user)
):
    """Department Manager action: Grants final financial approval for a verified bill (VERIFIED -> APPROVED)."""
    notes = payload.notes if payload else None
    approved = BillingService.approve_bill(bill_id, notes=notes)
    if not approved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return approved


@router.patch("/{bill_id}/reject", response_model=MonthlyBillResponse)
def reject_student_bill(
    bill_id: str,
    payload: Optional[BillActionPayload] = None,
    user: dict = Depends(get_current_user)
):
    """Rejects/sends back a student bill submission with review feedback notes."""
    notes = payload.notes if payload else None
    rejected = BillingService.reject_bill(bill_id, notes=notes)
    if not rejected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return rejected
