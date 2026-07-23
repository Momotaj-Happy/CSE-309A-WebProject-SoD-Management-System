export type TaskType = 'LAB' | 'EXAM' | 'FACULTY';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SWAPPED' | 'CANCELLED';

export interface DutyTask {
  id: string;
  title: string;
  task_type: TaskType;
  location: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  student_id?: string;
  assigned_by: string;
  status: TaskStatus;
  log_notes?: string;
  created_at: string;
}

export interface ShiftSwap {
  swap_id: string;
  task_id: string;
  requestor_id: string;
  requestor_name: string;
  target_role: string;
  reason: string;
  status: 'OPEN' | 'ACCEPTED' | 'CANCELLED';
  created_at: string;
}
