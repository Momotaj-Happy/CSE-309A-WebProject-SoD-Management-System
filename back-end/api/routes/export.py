from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response
from api.services.export_service import ExportService
from api.services.swap_service import SwapService
from api.models.swap import AuditLogEntry
from api.services.auth_service import get_current_token_payload

router = APIRouter(prefix="/export", tags=["Reporting & Export Utilities"])


@router.get("/report/csv")
def download_duty_report_csv(
    status: Optional[str] = Query(None, description="Filter by status (PENDING, COMPLETED, SWAPPED, CANCELLED)"),
    task_type: Optional[str] = Query(None, description="Filter by task type (LAB, EXAM, FACULTY)"),
    payload: dict = Depends(get_current_token_payload)
):
    """Generates and downloads a CSV report of duty task assignments and billing metrics."""
    csv_content = ExportService.generate_duty_report_csv(status=status, task_type=task_type)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sod_duty_report.csv"}
    )


@router.get("/swaps/audit-log", response_model=List[AuditLogEntry])
def get_export_swap_audit_trail(
    payload: dict = Depends(get_current_token_payload)
):
    """Retrieves immutable audit trail logs for shift swap events."""
    return SwapService.get_audit_logs()
