from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from api.models.swap import (
    SwapRequestCreate,
    ShiftSwapResponse,
    AuditLogEntry
)
from api.services.swap_service import SwapService
from api.services.auth_service import get_current_token_payload, get_current_user

router = APIRouter(prefix="/tasks/swaps", tags=["Shift Swap Proxy & Audit Engine"])


@router.post("", response_model=ShiftSwapResponse, status_code=status.HTTP_201_CREATED)
def create_shift_swap(
    payload: SwapRequestCreate,
    user: dict = Depends(get_current_user)
):
    """Creates/broadcasts a new shift swap request for an assigned task."""
    if not payload.reason.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reason is required")

    return SwapService.create_swap(
        requestor_id=user["id"],
        requestor_name=user["full_name"],
        payload=payload
    )


@router.get("", response_model=List[ShiftSwapResponse])
def list_shift_swaps(status: Optional[str] = None):
    """Retrieves all open or filtered shift swap requests."""
    return SwapService.list_swaps(status_filter=status)


@router.get("/audit-log", response_model=List[AuditLogEntry])
def get_swap_audit_trail():
    """Retrieves immutable audit log records of shift swap transactions."""
    return SwapService.get_audit_logs()


@router.get("/{swap_id}", response_model=ShiftSwapResponse)
def get_shift_swap(swap_id: str):
    """Retrieves details of a specific shift swap request."""
    swap = SwapService.get_swap(swap_id)
    if not swap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Swap request not found")
    return swap


@router.post("/{swap_id}/accept", response_model=ShiftSwapResponse)
def accept_shift_swap(
    swap_id: str,
    user: dict = Depends(get_current_user)
):
    """Accepts an open shift swap request."""
    try:
        updated = SwapService.accept_swap(
            swap_id=swap_id,
            acceptor_id=user["id"],
            acceptor_name=user["full_name"]
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Swap request not found or no longer open")
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.delete("/{swap_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_shift_swap(
    swap_id: str,
    token_payload: dict = Depends(get_current_token_payload)
):
    """Withdraws/cancels an open shift swap request."""
    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        success = SwapService.cancel_swap(swap_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Swap request not found or cannot be cancelled")
        return None
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
