import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserLoginPayload, UserRegisterPayload, UserRole } from '../types/user';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: UserLoginPayload) => Promise<void>;
  register: (payload: UserRegisterPayload) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  updateRole: (userId: string, newRole: UserRole) => Promise<void>;
  deleteUserAccount: (userId: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sod_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sod_auth_token');
      if (storedToken) {
        try {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
          setToken(storedToken);
        } catch (err) {
          console.warn('Invalid token session, resetting state');
          localStorage.removeItem('sod_auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: UserLoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(payload);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: UserRegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register(payload);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (role: UserRole) => {
    const demoCredentials: Record<UserRole, { email_or_dept_id: string; password: string }> = {
      STUDENT: { email_or_dept_id: 'student@sod.edu', password: 'Password123!' },
      FACULTY: { email_or_dept_id: 'faculty@sod.edu', password: 'Password123!' },
      LAB_MGR: { email_or_dept_id: 'labmgr@sod.edu', password: 'Password123!' },
      DEPT_MGR: { email_or_dept_id: 'deptmgr@sod.edu', password: 'Password123!' }
    };
    await login(demoCredentials[role]);
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await api.updateUserRole({ user_id: userId, role: newRole });
      if (user && user.id === userId) {
        setUser(updated);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
      throw err;
    }
  };

  const deleteUserAccount = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      if (user && user.id === userId) {
        logout();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('sod_auth_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        quickDemoLogin,
        updateRole,
        deleteUserAccount,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
