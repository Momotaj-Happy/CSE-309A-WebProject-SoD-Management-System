import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user';
import { Shield, LogOut, User as UserIcon, Sparkles, Building, Layers, Calendar } from 'lucide-react';

interface NavbarProps {
  activeTab: 'directory' | 'schedule' | 'profile' | 'rbac';
  setActiveTab: (tab: 'directory' | 'schedule' | 'profile' | 'rbac') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, quickDemoLogin, isLoading } = useAuth();

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'STUDENT':
        return 'badge-blue';
      case 'FACULTY':
        return 'badge-purple';
      case 'LAB_MGR':
        return 'badge-amber';
      case 'DEPT_MGR':
        return 'badge-emerald';
      default:
        return 'badge-slate';
    }
  };

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'STUDENT':
        return 'Student (SoD)';
      case 'FACULTY':
        return 'Faculty Member';
      case 'LAB_MGR':
        return 'Lab Manager';
      case 'DEPT_MGR':
        return 'Dept Manager';
      default:
        return 'Guest';
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Header */}
        <div className="brand-group">
          <div className="brand-icon">
            <Building className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="brand-title">SoD System</h1>
            <p className="brand-subtitle">Departmental Duty & User Management</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'directory' ? 'active' : ''}`}
              onClick={() => setActiveTab('directory')}
            >
              <Layers className="w-4 h-4 mr-2 inline-block" />
              User Directory
            </button>
            <button
              className={`nav-btn ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Calendar className="w-4 h-4 mr-2 inline-block" />
              IRAS Schedule Parser
            </button>
            <button
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <UserIcon className="w-4 h-4 mr-2 inline-block" />
              My Profile
            </button>
            <button
              className={`nav-btn ${activeTab === 'rbac' ? 'active' : ''}`}
              onClick={() => setActiveTab('rbac')}
            >
              <Shield className="w-4 h-4 mr-2 inline-block" />
              RBAC Permissions
            </button>
          </nav>
        )}

        {/* User Info & Quick Role Switcher */}
        {user ? (
          <div className="user-controls">
            {/* Quick Demo Switcher Dropdown */}
            <div className="demo-switcher">
              <span className="demo-label">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1 inline-block" />
                Switch Role:
              </span>
              <div className="role-switch-buttons">
                <button
                  disabled={isLoading}
                  onClick={() => quickDemoLogin('STUDENT')}
                  className={`switch-chip ${user.role === 'STUDENT' ? 'chip-active' : ''}`}
                >
                  Student
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => quickDemoLogin('FACULTY')}
                  className={`switch-chip ${user.role === 'FACULTY' ? 'chip-active' : ''}`}
                >
                  Faculty
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => quickDemoLogin('LAB_MGR')}
                  className={`switch-chip ${user.role === 'LAB_MGR' ? 'chip-active' : ''}`}
                >
                  Lab Mgr
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => quickDemoLogin('DEPT_MGR')}
                  className={`switch-chip ${user.role === 'DEPT_MGR' ? 'chip-active' : ''}`}
                >
                  Dept Mgr
                </button>
              </div>
            </div>

            {/* Profile pill */}
            <div className="profile-pill">
              <div className="user-avatar">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="profile-details">
                <span className="profile-name">{user.full_name}</span>
                <span className={`role-badge ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button onClick={logout} className="logout-btn" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="guest-badge">
            <Shield className="w-4 h-4 mr-1 text-slate-400" />
            Guest Session
          </div>
        )}
      </div>
    </header>
  );
};
