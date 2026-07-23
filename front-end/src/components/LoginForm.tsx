import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user';
import { LogIn, Key, Mail, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, quickDemoLogin, isLoading, error, clearError } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    try {
      await login({ email_or_dept_id: identifier, password });
    } catch (err) {
      // Handled in context error state
    }
  };

  const handleDemoSignIn = async (role: UserRole) => {
    clearError();
    await quickDemoLogin(role);
  };

  return (
    <div className="auth-card-wrapper">
      <div className="glass-card auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-circle">
            <LogIn className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to access your Departmental SoD Workspace & Duty Schedule
          </p>
        </div>

        {/* Quick Demo Sign In Bar */}
        <div className="demo-login-box">
          <div className="demo-box-header">
            <Sparkles className="w-4 h-4 text-amber-400 mr-1.5" />
            <span>Instant Demo Sign-in (Pre-configured Roles):</span>
          </div>
          <div className="demo-grid">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSignIn('STUDENT')}
              className="demo-btn demo-student"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Student
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSignIn('FACULTY')}
              className="demo-btn demo-faculty"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Faculty
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSignIn('LAB_MGR')}
              className="demo-btn demo-labmgr"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Lab Manager
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSignIn('DEPT_MGR')}
              className="demo-btn demo-deptmgr"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Dept Manager
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>OR SIGN IN WITH CREDENTIALS</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email or Department ID</label>
            <div className="input-input-wrapper">
              <Mail className="input-icon" />
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. student@sod.edu or SOD-2024-001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-input-wrapper">
              <Key className="input-icon" />
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full mt-4">
            {isLoading ? (
              <span className="spinner">Authenticating...</span>
            ) : (
              <>
                Sign In to Workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="auth-footer">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister} className="link-btn">
            Create new account
          </button>
        </div>
      </div>
    </div>
  );
};
