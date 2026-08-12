import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user';
import { LogOut, User as UserIcon, Building, Layers, Calendar, Clock, UserCheck, DollarSign } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, quickDemoLogin, isLoading } = useAuth();

  const isStudent = user?.role === 'STUDENT';
  const isFaculty = user?.role === 'FACULTY';
  const isManager = user?.role === 'LAB_MGR' || user?.role === 'DEPT_MGR';

  const getRoleBadgeStyle = (role?: UserRole) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FACULTY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'LAB_MGR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DEPT_MGR':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 leading-tight">
              SoD Management System
            </h1>
            <p className="text-[11px] text-slate-500">Departmental Duty & Control</p>
          </div>
        </div>

        {/* Navigation Tabs (Role-Based) */}
        {user && (
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {/* Student View: My Duties */}
            {isStudent && (
              <button
                onClick={() => setActiveTab('student-duties')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'student-duties'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                My Duty Timetable
              </button>
            )}

            {/* Student Monthly Billing */}
            {isStudent && (
              <button
                onClick={() => setActiveTab('billing')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'billing'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Monthly Billing
              </button>
            )}

            {/* Faculty / Manager View: Assign Tasks */}
            {(isFaculty || isManager) && (
              <button
                onClick={() => setActiveTab('faculty-tasks')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'faculty-tasks'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Assign Tasks
              </button>
            )}

            {/* Manager View Only: User Management Directory */}
            {isManager && (
              <button
                onClick={() => setActiveTab('directory')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'directory'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                User Directory
              </button>
            )}

            {/* IRAS Parser (All Roles) */}
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              IRAS Parser
            </button>

            {/* My Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              My Profile
            </button>
          </nav>
        )}

        {/* User Status & Demo Switcher */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium px-1">Role:</span>
              {(['STUDENT', 'FACULTY', 'LAB_MGR', 'DEPT_MGR'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  disabled={isLoading}
                  onClick={() => quickDemoLogin(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    user.role === r
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {r.split('_')[0]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-slate-900 leading-tight">{user.full_name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(user.role)} mt-0.5`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Guest Access
          </div>
        )}
      </div>
    </header>
  );
};
