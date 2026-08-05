import type { User, AuthResponse, UserLoginPayload, UserRegisterPayload, UpdateRolePayload } from '../types/user';
import type { DutyTask, ShiftSwap, TaskStatus } from '../types/task';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Interfaces for Schedule Engine
export interface Course {
  id: string;
  name: string;
  section: string;
  room: string;
  days: string;
  time: string;
}

export interface UnavailableSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  note: string;
  created_at?: string;
}

export interface ScheduleResponse {
  success: boolean;
  courses: Course[];
  unavailable_slots?: UnavailableSlot[];
}

// Initial fallback mock databases
const MOCK_USERS: User[] = [
  {
    id: 'mock-1',
    dept_id: 'SOD-2024-001',
    email: 'student@sod.edu',
    full_name: 'Momotaj Happy',
    role: 'STUDENT',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    dept_id: 'FAC-2024-101',
    email: 'faculty@sod.edu',
    full_name: 'Dr. Zaid Fahad',
    role: 'FACULTY',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    dept_id: 'LBM-2024-201',
    email: 'labmgr@sod.edu',
    full_name: 'Sarah Connor',
    role: 'LAB_MGR',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-4',
    dept_id: 'DPM-2024-301',
    email: 'deptmgr@sod.edu',
    full_name: 'Prof. Charles Xavier',
    role: 'DEPT_MGR',
    created_at: new Date().toISOString()
  }
];

const MOCK_TASKS: DutyTask[] = [
  {
    id: 'task-1',
    title: 'Physics 101 Mechanics Lab Prep',
    task_type: 'LAB',
    location: 'Science Bldg Lab 201',
    scheduled_date: '2026-07-24',
    start_time: '09:00',
    end_time: '12:00',
    hourly_rate: 18.50,
    student_id: 'mock-1',
    assigned_by: 'Dr. Zaid Fahad',
    status: 'PENDING',
    log_notes: 'Calibrate oscilloscopes and set up optics apparatus.',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Chemistry Midterm Exam Invigilation',
    task_type: 'EXAM',
    location: 'Auditorium Hall B',
    scheduled_date: '2026-07-25',
    start_time: '14:00',
    end_time: '17:00',
    hourly_rate: 20.00,
    student_id: 'mock-1',
    assigned_by: 'Prof. Charles Xavier',
    status: 'PENDING',
    log_notes: 'Distribute exam booklets and verify student ID cards.',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Quantum Research Data Analysis',
    task_type: 'FACULTY',
    location: 'Faculty Office 405',
    scheduled_date: '2026-07-26',
    start_time: '10:00',
    end_time: '13:00',
    hourly_rate: 22.00,
    student_id: 'mock-1',
    assigned_by: 'Dr. Zaid Fahad',
    status: 'COMPLETED',
    log_notes: 'Processed Python spectra dataset cleanly.',
    created_at: new Date().toISOString()
  }
];

const MOCK_SWAPS: ShiftSwap[] = [
  {
    swap_id: 'swap-1',
    task_id: 'task-1',
    requestor_id: 'mock-1',
    requestor_name: 'Momotaj Happy',
    target_role: 'STUDENT',
    reason: 'Academic schedule overlap with PHY202 lecture at 09:00 AM.',
    status: 'OPEN',
    created_at: new Date().toISOString()
  }
];

let MOCK_SAVED_SCHEDULE: ScheduleResponse = {
  success: true,
  courses: [
    {
      id: 'PHY101',
      name: 'General Physics I',
      section: '1',
      room: 'Lab201',
      days: 'MON,WED',
      time: '09:00 - 11:00'
    },
    {
      id: 'MAT201',
      name: 'Multivariable Calculus',
      section: '2',
      room: 'HallB',
      days: 'TUE,THU',
      time: '11:30 - 13:00'
    }
  ],
  unavailable_slots: [
    {
      id: 'slot-1',
      day: 'SUN',
      start_time: '10:00',
      end_time: '12:00',
      note: 'Departmental Study Circle'
    }
  ]
};

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('sod_auth_token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async login(payload: UserLoginPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      localStorage.setItem('sod_auth_token', data.access_token);
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const cleanIdent = payload.email_or_dept_id.toLowerCase().trim();
      const matched = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === cleanIdent || u.dept_id.toLowerCase() === cleanIdent
      );
      if (matched && payload.password.length >= 6) {
        const mockToken = `mock-token-${matched.id}`;
        localStorage.setItem('sod_auth_token', mockToken);
        return { access_token: mockToken, token_type: 'bearer', user: matched };
      }
      throw new Error('Invalid credentials or server unreachable.');
    }
  }

  async register(payload: UserRegisterPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      localStorage.setItem('sod_auth_token', data.access_token);
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const newUser: User = {
        id: `mock-${Date.now()}`,
        dept_id: payload.dept_id,
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role,
        created_at: new Date().toISOString()
      };
      MOCK_USERS.push(newUser);
      const mockToken = `mock-token-${newUser.id}`;
      localStorage.setItem('sod_auth_token', mockToken);
      return { access_token: mockToken, token_type: 'bearer', user: newUser };
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Session expired or invalid token');
      return await response.json();
    } catch (err: any) {
      const token = this.getToken();
      if (token && token.startsWith('mock-token-')) {
        const userId = token.replace('mock-token-', '');
        const matched = MOCK_USERS.find((u) => u.id === userId);
        if (matched) return matched;
      }
      throw err;
    }
  }

  async listUsers(role?: string, search?: string): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (search) params.append('search', search);

      const url = `${API_BASE_URL}/users${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch user directory');
      return await response.json();
    } catch (err: any) {
      let results = [...MOCK_USERS];
      if (role) results = results.filter((u) => u.role === role);
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(
          (u) =>
            u.full_name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.dept_id.toLowerCase().includes(s)
        );
      }
      return results;
    }
  }

  async updateUserRole(payload: UpdateRolePayload): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Role update failed' }));
        throw new Error(errData.detail || 'Permission denied or user not found');
      }
      return await response.json();
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const target = MOCK_USERS.find((u) => u.id === payload.user_id);
      if (target) {
        target.role = payload.role;
        return { ...target };
      }
      throw new Error('User not found');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete user');
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const index = MOCK_USERS.findIndex((u) => u.id === userId);
      if (index !== -1) MOCK_USERS.splice(index, 1);
    }
  }

  // Schedule Engine REST Methods
  async saveSchedule(courses: Course[]): Promise<ScheduleResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/save`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ courses })
      });
      if (!response.ok) throw new Error('Failed to save schedule');
      return await response.json();
    } catch (err: any) {
      MOCK_SAVED_SCHEDULE.courses = courses;
      return MOCK_SAVED_SCHEDULE;
    }
  }

  async getSchedule(): Promise<ScheduleResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/me`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch schedule');
      return await response.json();
    } catch (err: any) {
      return MOCK_SAVED_SCHEDULE;
    }
  }

  async getStudentSchedule(studentId: string): Promise<ScheduleResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/student/${studentId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch student schedule');
      return await response.json();
    } catch (err: any) {
      return MOCK_SAVED_SCHEDULE;
    }
  }

  async addUnavailableSlot(payload: { day: string; start_time: string; end_time: string; note?: string }): Promise<UnavailableSlot> {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/unavailable`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to add unavailable slot');
      return await response.json();
    } catch (err: any) {
      const newSlot: UnavailableSlot = {
        id: `slot-${Date.now()}`,
        day: payload.day.toUpperCase(),
        start_time: payload.start_time,
        end_time: payload.end_time,
        note: payload.note || 'Unavailable'
      };
      if (!MOCK_SAVED_SCHEDULE.unavailable_slots) MOCK_SAVED_SCHEDULE.unavailable_slots = [];
      MOCK_SAVED_SCHEDULE.unavailable_slots.push(newSlot);
      return newSlot;
    }
  }

  async deleteUnavailableSlot(slotId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/unavailable/${slotId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete unavailable slot');
    } catch (err: any) {
      if (MOCK_SAVED_SCHEDULE.unavailable_slots) {
        MOCK_SAVED_SCHEDULE.unavailable_slots = MOCK_SAVED_SCHEDULE.unavailable_slots.filter((s) => s.id !== slotId);
      }
    }
  }

  // Duty Tasks & Dashboard API
  async listTasks(): Promise<DutyTask[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return await response.json();
    } catch (err: any) {
      return [...MOCK_TASKS];
    }
  }

  async createTask(payload: any): Promise<DutyTask> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create task');
      return await response.json();
    } catch (err: any) {
      const newTask: DutyTask = {
        id: `task-${Date.now()}`,
        title: payload.title,
        task_type: payload.task_type || 'LAB',
        location: payload.location,
        scheduled_date: payload.scheduled_date,
        start_time: payload.start_time,
        end_time: payload.end_time,
        hourly_rate: payload.hourly_rate || 18.5,
        student_id: payload.student_id || 'mock-1',
        assigned_by: payload.assigned_by || 'Faculty Member',
        status: 'PENDING',
        created_at: new Date().toISOString()
      };
      MOCK_TASKS.unshift(newTask);
      return newTask;
    }
  }

  async updateTaskStatus(taskId: string, status: TaskStatus, log_notes?: string): Promise<DutyTask> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status, log_notes })
      });
      if (!response.ok) throw new Error('Failed to update task status');
      return await response.json();
    } catch (err: any) {
      const task = MOCK_TASKS.find((t) => t.id === taskId);
      if (task) {
        task.status = status;
        if (log_notes) task.log_notes = log_notes;
        return { ...task };
      }
      throw new Error('Task not found');
    }
  }

  async createSwap(taskId: string, reason: string): Promise<ShiftSwap> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/swaps`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ task_id: taskId, reason })
      });
      if (!response.ok) throw new Error('Failed to create shift swap');
      return await response.json();
    } catch (err: any) {
      const newSwap: ShiftSwap = {
        swap_id: `swap-${Date.now()}`,
        task_id: taskId,
        requestor_id: 'mock-1',
        requestor_name: 'Momotaj Happy',
        target_role: 'STUDENT',
        reason,
        status: 'OPEN',
        created_at: new Date().toISOString()
      };
      MOCK_SWAPS.push(newSwap);
      return newSwap;
    }
  }

  async listSwaps(): Promise<ShiftSwap[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/swaps`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch swaps');
      return await response.json();
    } catch (err: any) {
      return [...MOCK_SWAPS];
    }
  }
}

export const api = new ApiClient();

const SCHEDULE_API_URL = 'http://localhost:8000/api/schedule';

export async function parseScheduleApi(rawText: string): Promise<ScheduleResponse> {
  const sanitizedText = rawText.replace(/\r/g, '').replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  const response = await fetch(`${SCHEDULE_API_URL}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: sanitizedText })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to parse text');
  }

  return response.json();
}
