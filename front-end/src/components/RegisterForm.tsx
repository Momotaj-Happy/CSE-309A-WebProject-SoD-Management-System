import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user';
import { UserPlus, User, Mail, Key, Hash, Shield, AlertCircle, ArrowRight } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading, error } = useAuth();
  const [deptId, setDeptId] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptId || !email || !fullName || !password) return;
    try {
      await register({
        dept_id: deptId,
        email,
        full_name: fullName,
        password,
        role
      });
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="auth-card-wrapper">
      <div className="glass-card auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">
            Register your Department ID to access SoD scheduling and billing
          </p>
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
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Department ID (FR-AUTH-01)</label>
              <div className="input-input-wrapper">
                <Hash className="input-icon" />
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. SOD-2026-105"
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                required
                className="form-input"
                placeholder="student@sod.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">System Role (FR-AUTH-02)</label>
            <div className="input-input-wrapper">
              <Shield className="input-icon" />
              <select
                className="form-input form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="STUDENT">Student (SoD Workforce)</option>
                <option value="FACULTY">Faculty Member (Task Assignor & Verifier)</option>
                <option value="LAB_MGR">Lab Manager (Duty Slot Supervisor)</option>
                <option value="DEPT_MGR">Department Manager (Financial Approver)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min 6 characters)</label>
            <div className="input-input-wrapper">
              <Key className="input-icon" />
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full mt-4">
            {isLoading ? (
              <span className="spinner">Creating Account...</span>
            ) : (
              <>
                Register & Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="auth-footer">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="link-btn">
            Sign in instead
          </button>
        </div>
      </div>
    </div>
  );
};
