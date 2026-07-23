import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Hash, Calendar, CheckCircle2, UserCheck, Key, Clock } from 'lucide-react';

export const UserProfileCard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleCapabilities = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return [
          'IRAS Raw Schedule Parser (FR-PARSER-01)',
          'View Personal Duty Dashboard (FR-TASK-02)',
          'Shift Swap Request Broadcasting (FR-PROXY-01)',
          'Submit Monthly Duty Bill (FR-BILL-01)',
          'Export Visual Schedule PNG (FR-EXPORT-01)'
        ];
      case 'FACULTY':
        return [
          'Assign Tasks & Duties to Students (FR-TASK-03)',
          'Verify Completed Student Duties (FR-BILL-02)',
          'Review Task Logs & Attachments (FR-TASK-04)',
          'View Lab & Exam Duty Schedules'
        ];
      case 'LAB_MGR':
        return [
          'Create & Manage Duty Slot Templates (FR-TASK-01)',
          'Oversee Student Shift Swap History (FR-PROXY-04)',
          'Update User System Roles (FR-AUTH-02)',
          'Export Monthly Duty Logs CSV (FR-EXPORT-02)'
        ];
      case 'DEPT_MGR':
        return [
          'Final Financial Approval on Monthly Bills (FR-BILL-02)',
          'Full Administrative User Role Management (FR-AUTH-03)',
          'Departmental Duty Audit Trail Access (FR-UTIL-01)',
          'Delete User Accounts & Revoke Access'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="profile-container">
      {/* Main Profile Header Card */}
      <div className="glass-card profile-hero-card">
        <div className="profile-hero-content">
          <div className="profile-large-avatar">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-hero-text">
            <div className="flex items-center gap-3">
              <h2 className="profile-name-heading">{user.full_name}</h2>
              <span className={`role-badge badge-lg role-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
            <p className="profile-email-sub font-mono">{user.email}</p>
            <div className="profile-chips-row">
              <span className="profile-chip">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                Dept ID: <strong>{user.dept_id}</strong>
              </span>
              <span className="profile-chip">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </span>
              <span className="profile-chip chip-success">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                JWT Session Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Profile Metadata & Role Capabilities */}
      <div className="profile-grid">
        {/* Account Metadata */}
        <div className="glass-card profile-section">
          <h3 className="section-title">
            <UserCheck className="w-5 h-5 text-indigo-400 mr-2" />
            Account Credentials & Security
          </h3>

          <div className="details-list">
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Hash className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="detail-body">
                <span className="detail-label">Department ID</span>
                <span className="detail-value font-mono">{user.dept_id}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Mail className="w-4 h-4 text-purple-400" />
              </div>
              <div className="detail-body">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Key className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="detail-body">
                <span className="detail-label">Authentication Token</span>
                <span className="detail-value font-mono text-xs text-slate-400 truncate max-w-xs">
                  Bearer JWT (Algorithm HS256)
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="detail-body">
                <span className="detail-label">Role Privilege Level</span>
                <span className="detail-value capitalize">
                  {user.role.replace('_', ' ')} Access Level
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mapped Role Capabilities */}
        <div className="glass-card profile-section">
          <h3 className="section-title">
            <Shield className="w-5 h-5 text-emerald-400 mr-2" />
            Role Capabilities & Mapped FRs
          </h3>

          <ul className="capabilities-list">
            {getRoleCapabilities(user.role).map((cap, idx) => (
              <li key={idx} className="capability-item">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
