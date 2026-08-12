from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from api.models.task import DutyTaskCreate, DutyTaskResponse, TaskStatusUpdate
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


@router.get("/{task_id}", response_model=DutyTaskResponse)
def get_task(
    task_id: str,
    payload: dict = Depends(get_current_token_payload)
):
    """Fetches details for a single duty task."""
    task = TaskService.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    payload: dict = Depends(get_current_token_payload)
):
    """Deletes or cancels an assigned duty task."""
    success = TaskService.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return None


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
