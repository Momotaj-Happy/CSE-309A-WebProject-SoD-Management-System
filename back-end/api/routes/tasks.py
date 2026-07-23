from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from api.models.task import DutyTaskCreate, DutyTaskResponse, TaskStatusUpdate, ShiftSwapRequest, ShiftSwapResponse
from api.services.task_service import TaskService
from api.services.auth_service import get_current_token_payload

router = APIRouter(prefix="/tasks", tags=["Duty Tasks & Dashboard"])


@router.get("", response_model=List[DutyTaskResponse])
def list_tasks(
    student_id: Optional[str] = Query(None, description="Filter by assigned student ID"),
    status: Optional[str] = Query(None, description="Filter by task status"),
    payload: dict = Depends(get_current_token_payload)
):
    """Lists duty tasks with optional filtering."""
    return TaskService.get_all_tasks(student_id=student_id, status=status)


@router.post("", response_model=DutyTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: DutyTaskCreate,
    payload: dict = Depends(get_current_token_payload)
):
    """Creates a new duty task assignment."""
    return TaskService.create_task(task_in)


@router.patch("/{task_id}/status", response_model=DutyTaskResponse)
def update_task_status(
    task_id: str,
    update_in: TaskStatusUpdate,
    payload: dict = Depends(get_current_token_payload)
):
    """Updates status and completion log notes for a duty task."""
    updated = TaskService.update_task_status(task_id, update_in.status, update_in.log_notes)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return updated


@router.get("/swaps", response_model=List[ShiftSwapResponse])
def list_swaps(payload: dict = Depends(get_current_token_payload)):
    """Lists open shift swap requests."""
    return TaskService.get_swaps()


@router.post("/swaps", response_model=ShiftSwapResponse)
def create_swap(
    swap_in: ShiftSwapRequest,
    payload: dict = Depends(get_current_token_payload)
):
    """Broadcasting a shift swap request for a duty task."""
    user_id = payload.get("sub", "unknown")
    swap = TaskService.create_swap(swap_in.task_id, user_id, "User", swap_in.reason)
    if not swap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return swap


@router.post("/swaps/{swap_id}/accept")
def accept_swap(
    swap_id: str,
    payload: dict = Depends(get_current_token_payload)
):
    """Accepts an open shift swap request."""
    accepting_user = payload.get("sub", "unknown")
    success = TaskService.accept_swap(swap_id, accepting_user)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Swap request not found")
    return {"message": "Shift swap accepted successfully"}
