import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from api.models.task import DutyTaskCreate, DutyTaskResponse, TaskStatus, TaskType, ShiftSwapResponse

# Pre-seeded demo duty tasks
_TASKS_DB: Dict[str, dict] = {}
_SWAPS_DB: Dict[str, dict] = {}


def _init_demo_tasks():
    if _TASKS_DB:
        return

    demo_tasks = [
        {
            "title": "Physics 101 Mechanics Lab Prep",
            "task_type": TaskType.LAB,
            "location": "Science Bldg Lab 201",
            "scheduled_date": "2026-07-24",
            "start_time": "09:00",
            "end_time": "12:00",
            "hourly_rate": 18.50,
            "student_id": "mock-1",  # Momotaj Happy
            "assigned_by": "Dr. Zaid Fahad",
            "status": TaskStatus.PENDING,
            "log_notes": "Calibrate oscilloscopes and set up optics apparatus."
        },
        {
            "title": "Chemistry Midterm Exam Invigilation",
            "task_type": TaskType.EXAM,
            "location": "Auditorium Hall B",
            "scheduled_date": "2026-07-25",
            "start_time": "14:00",
            "end_time": "17:00",
            "hourly_rate": 20.00,
            "student_id": "mock-1",
            "assigned_by": "Prof. Charles Xavier",
            "status": TaskStatus.PENDING,
            "log_notes": "Distribute exam booklets and verify student ID cards."
        },
        {
            "title": "Quantum Research Data Analysis",
            "task_type": TaskType.FACULTY,
            "location": "Faculty Office 405",
            "scheduled_date": "2026-07-26",
            "start_time": "10:00",
            "end_time": "13:00",
            "hourly_rate": 22.00,
            "student_id": "mock-1",
            "assigned_by": "Dr. Zaid Fahad",
            "status": TaskStatus.COMPLETED,
            "log_notes": "Processed Python spectra dataset cleanly."
        },
        {
            "title": "Electronics Circuit Lab Supervision",
            "task_type": TaskType.LAB,
            "location": "Engineering Lab 104",
            "scheduled_date": "2026-07-27",
            "start_time": "13:00",
            "end_time": "16:00",
            "hourly_rate": 18.50,
            "student_id": "mock-1",
            "assigned_by": "Sarah Connor",
            "status": TaskStatus.PENDING,
            "log_notes": "Assist sophomore students with breadboard soldering."
        }
    ]

    for t in demo_tasks:
        task_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        _TASKS_DB[task_id] = {
            "id": task_id,
            **t,
            "created_at": created_at
        }

    # Demo swap request
    swap_id = str(uuid.uuid4())
    first_task_id = list(_TASKS_DB.keys())[0]
    _SWAPS_DB[swap_id] = {
        "swap_id": swap_id,
        "task_id": first_task_id,
        "requestor_id": "mock-1",
        "requestor_name": "Momotaj Happy",
        "target_role": "STUDENT",
        "reason": "Class schedule overlap with PHY202 lecture at 09:00 AM.",
        "status": "OPEN",
        "created_at": datetime.now(timezone.utc).isoformat()
    }


_init_demo_tasks()


class TaskService:
    @staticmethod
    def _parse_time_minutes(t_str: str) -> int:
        parts = t_str.strip().split(":")
        return int(parts[0]) * 60 + int(parts[1])

    @staticmethod
    def check_schedule_conflict(student_id: Optional[str], scheduled_date: str, start_time: str, end_time: str) -> Optional[str]:
        if not student_id:
            return None

        from api.services.schedule_service import ScheduleService
        schedule = ScheduleService.get_schedule(student_id)

        try:
            dt = datetime.strptime(scheduled_date, "%Y-%m-%d")
            day_map = {0: "MON", 1: "TUE", 2: "WED", 3: "THU", 4: "FRI", 5: "SAT", 6: "SUN"}
            task_day = day_map.get(dt.weekday(), "")
        except Exception:
            task_day = ""

        task_start_m = TaskService._parse_time_minutes(start_time)
        task_end_m = TaskService._parse_time_minutes(end_time)

        # Check course schedule overlap
        for course in schedule.courses:
            course_days = [d.strip().upper() for d in course.days.split(",")]
            if task_day in course_days:
                if "-" in course.time:
                    c_start_str, c_end_str = course.time.split("-")
                    c_start_m = TaskService._parse_time_minutes(c_start_str)
                    c_end_m = TaskService._parse_time_minutes(c_end_str)
                    if (task_start_m < c_end_m) and (task_end_m > c_start_m):
                        return f"Schedule Conflict: Task time ({start_time}-{end_time}) overlaps with student lecture '{course.name}' ({course.time}) on {task_day}."

        # Check custom unavailable slots overlap
        if schedule.unavailable_slots:
            for slot in schedule.unavailable_slots:
                if slot.day.upper().strip() == task_day:
                    u_start_m = TaskService._parse_time_minutes(slot.start_time)
                    u_end_m = TaskService._parse_time_minutes(slot.end_time)
                    if (task_start_m < u_end_m) and (task_end_m > u_start_m):
                        return f"Schedule Conflict: Task time ({start_time}-{end_time}) overlaps with custom marked unavailable window '{slot.note}' ({slot.start_time}-{slot.end_time}) on {task_day}."

        return None

    @staticmethod
    def get_all_tasks(student_id: Optional[str] = None, status: Optional[str] = None) -> List[DutyTaskResponse]:
        results = []
        for t in _TASKS_DB.values():
            if student_id and t["student_id"] != student_id:
                continue
            if status and t["status"] != status:
                continue
            results.append(DutyTaskResponse(**t))
        return results

    @staticmethod
    def get_task_by_id(task_id: str) -> Optional[DutyTaskResponse]:
        if task_id in _TASKS_DB:
            return DutyTaskResponse(**_TASKS_DB[task_id])
        return None

    @staticmethod
    def create_task(task_in: DutyTaskCreate) -> DutyTaskResponse:
        conflict_msg = TaskService.check_schedule_conflict(
            task_in.student_id,
            task_in.scheduled_date,
            task_in.start_time,
            task_in.end_time
        )
        if conflict_msg:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=conflict_msg)

        task_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        task_entry = {
            "id": task_id,
            **task_in.model_dump(),
            "status": TaskStatus.PENDING,
            "log_notes": None,
            "created_at": created_at
        }
        _TASKS_DB[task_id] = task_entry
        return DutyTaskResponse(**task_entry)

    @staticmethod
    def delete_task(task_id: str) -> bool:
        if task_id in _TASKS_DB:
            del _TASKS_DB[task_id]
            return True
        return False

    @staticmethod
    def update_task_status(task_id: str, new_status: TaskStatus, notes: Optional[str] = None) -> Optional[DutyTaskResponse]:
        if task_id not in _TASKS_DB:
            return None
        _TASKS_DB[task_id]["status"] = new_status
        if notes:
            _TASKS_DB[task_id]["log_notes"] = notes
        return DutyTaskResponse(**_TASKS_DB[task_id])

    @staticmethod
    def get_swaps() -> List[ShiftSwapResponse]:
        return [ShiftSwapResponse(**s) for s in _SWAPS_DB.values()]

    @staticmethod
    def create_swap(task_id: str, requestor_id: str, requestor_name: str, reason: str) -> Optional[ShiftSwapResponse]:
        if task_id not in _TASKS_DB:
            return None
        _TASKS_DB[task_id]["status"] = TaskStatus.SWAPPED
        swap_id = str(uuid.uuid4())
        swap_entry = {
            "swap_id": swap_id,
            "task_id": task_id,
            "requestor_id": requestor_id,
            "requestor_name": requestor_name,
            "target_role": "STUDENT",
            "reason": reason,
            "status": "OPEN",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        _SWAPS_DB[swap_id] = swap_entry
        return ShiftSwapResponse(**swap_entry)

    @staticmethod
    def accept_swap(swap_id: str, accepting_student_id: str) -> bool:
        if swap_id not in _SWAPS_DB:
            return False
        swap = _SWAPS_DB[swap_id]
        task_id = swap["task_id"]
        if task_id in _TASKS_DB:
            _TASKS_DB[task_id]["student_id"] = accepting_student_id
            _TASKS_DB[task_id]["status"] = TaskStatus.PENDING
        swap["status"] = "ACCEPTED"
        return True
