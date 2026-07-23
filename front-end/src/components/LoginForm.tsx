import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user';
import { LogIn, Key, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

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
      // Error handled in AuthContext
    }
  };

  const handleDemoSignIn = async (role: UserRole) => {
    clearError();
    await quickDemoLogin(role);
  };

  return (
    <div className="flex justify-center items-center py-8 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sign In to SoD Workspace</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access departmental scheduling and user directory
          </p>
        </div>

        {/* Quick Demo Sign-In */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5">
          <div className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Demo Role to Sign In Immediately:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSignIn('STUDENT')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 transition-all cursor-pointer"
            >
              Student
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSignIn('FACULTY')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-purple-700 hover:bg-purple-50 transition-all cursor-pointer"
            >
              Faculty
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSignIn('LAB_MGR')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-amber-700 hover:bg-amber-50 transition-all cursor-pointer"
            >
              Lab Mgr
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSignIn('DEPT_MGR')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
            >
              Dept Mgr
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-5">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-[10px] font-bold text-slate-400 tracking-wider">
            OR USE CREDENTIALS
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address or Department ID
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                placeholder="student@sod.edu or SOD-2024-001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Key className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Register account
          </button>
        </div>
      </div>
    </div>
  );
};
