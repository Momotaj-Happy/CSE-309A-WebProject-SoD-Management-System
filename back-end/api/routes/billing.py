from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from api.models.billing import (
    MonthlyBillResponse,
    BillSubmitPayload,
    BillActionPayload
)
from api.services.billing_service import BillingService
from api.services.auth_service import get_current_user, get_current_token_payload

router = APIRouter(prefix="/bills", tags=["Monthly Financial Billing & Approval Pipeline"])


@router.get("/my-current", response_model=MonthlyBillResponse)
def get_my_current_bill(
    user: dict = Depends(get_current_user)
):
    """Retrieves current student's active monthly bill summary."""
    return BillingService.get_current_bill(student_id=user["id"], student_name=user["full_name"])


@router.post("/submit", response_model=MonthlyBillResponse, status_code=status.HTTP_201_CREATED)
def submit_monthly_bill(
    payload: BillSubmitPayload,
    user: dict = Depends(get_current_user)
):
    """Submits current monthly bill for faculty verification."""
    return BillingService.submit_bill(student_id=user["id"], student_name=user["full_name"], payload=payload)


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


@router.delete("/{bill_id}", response_model=MonthlyBillResponse)
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


@router.get("/student/{student_id}", response_model=List[MonthlyBillResponse])
def get_student_billing_history(
    student_id: str,
    payload: dict = Depends(get_current_token_payload)
):
    """Retrieves billing submission history for a specific student."""
    return BillingService.get_student_history(student_id)
