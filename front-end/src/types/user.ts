export type UserRole = 'STUDENT' | 'FACULTY' | 'LAB_MGR' | 'DEPT_MGR';

export interface User {
  id: string;
  dept_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserRegisterPayload {
  dept_id: string;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface UserLoginPayload {
  email_or_dept_id: string;
  password: string;
}

export interface UpdateRolePayload {
  user_id: string;
  role: UserRole;
}
