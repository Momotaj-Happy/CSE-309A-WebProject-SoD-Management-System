import type { User, AuthResponse, UserLoginPayload, UserRegisterPayload, UpdateRolePayload } from '../types/user';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Initial fallback mock database in case backend API server is disconnected
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
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      // Fallback local handling if server unreachable
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
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      // Fallback local registration
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

      if (!response.ok) {
        throw new Error('Session expired or invalid token');
      }
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
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user directory');
      }
      return await response.json();
    } catch (err: any) {
      // Fallback filtering on MOCK_USERS
      let results = [...MOCK_USERS];
      if (role) {
        results = results.filter((u) => u.role === role);
      }
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
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
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

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'User deletion failed' }));
        throw new Error(errData.detail || 'Failed to delete user');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      const index = MOCK_USERS.findIndex((u) => u.id === userId);
      if (index !== -1) {
        MOCK_USERS.splice(index, 1);
      }
    }
  }
}

export const api = new ApiClient();

// Schedule Parser API exports
export interface Course {
  id: string;
  name: string;
  section: string;
  room: string;
  days: string;
  time: string;
}

export interface ScheduleResponse {
  success: boolean;
  courses: Course[];
}

const SCHEDULE_API_URL = 'http://localhost:8000/api/schedule';

export async function parseScheduleApi(rawText: string): Promise<ScheduleResponse> {
  const sanitizedText = rawText
    .replace(/\r/g, '')
    .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, ' ');

  const response = await fetch(`${SCHEDULE_API_URL}/parse`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ raw_text: sanitizedText }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to parse text');
  }

  return response.json();
}
