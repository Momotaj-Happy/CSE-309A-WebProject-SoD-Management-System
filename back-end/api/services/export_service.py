import csv
import io
from typing import Optional
from api.services.task_service import TaskService


class ExportService:
    @staticmethod
    def generate_duty_report_csv(status: Optional[str] = None, task_type: Optional[str] = None) -> str:
        tasks = TaskService.get_all_tasks(status=status)
        if task_type:
            tasks = [t for t in tasks if t.task_type.value == task_type or t.task_type == task_type]

        output = io.StringIO()
        writer = csv.writer(output)

        # CSV Header
        writer.writerow([
            "Task ID",
            "Title",
            "Task Type",
            "Location",
            "Scheduled Date",
            "Start Time",
            "End Time",
            "Hourly Rate",
            "Student ID",
            "Assigned By",
            "Status",
            "Log Notes"
        ])

        for t in tasks:
            writer.writerow([
                t.id,
                t.title,
                t.task_type.value if hasattr(t.task_type, "value") else str(t.task_type),
                t.location,
                t.scheduled_date,
                t.start_time,
                t.end_time,
                t.hourly_rate,
                t.student_id or "",
                t.assigned_by,
                t.status.value if hasattr(t.status, "value") else str(t.status),
                t.log_notes or ""
            ])

        return output.getvalue()
