import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User, UserRole } from '../types/user';
import { api } from '../services/api';
import { Users, Search, Filter, Shield, UserPlus, Trash2, Edit3, Check, X, RefreshCw, Building, Info, ShieldAlert } from 'lucide-react';

export const UserDirectory: React.FC = () => {
  const { user: currentUser, updateRole, deleteUserAccount } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newDeptId, setNewDeptId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword] = useState('Password123!');
  const [newRole, setNewRole] = useState<UserRole>('STUDENT');

  const isManager = currentUser?.role === 'LAB_MGR' || currentUser?.role === 'DEPT_MGR';
  const isDeptManager = currentUser?.role === 'DEPT_MGR';

  const fetchUsers = async () => {
    if (!isManager) return;
    setLoading(true);
    try {
      const data = await api.listUsers(roleFilter || undefined, search || undefined);
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search, currentUser?.role]);

  // Access Guard for Non-Managers (Students & Faculty)
  if (!isManager) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-8 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">User Management Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          {currentUser?.role === 'STUDENT'
            ? 'Students do not have user management access. You can parse your IRAS schedule and view assigned duty timings in the navigation tabs above.'
            : 'Faculty members do not have user management access. You can view student timings and assign duty tasks under the "Assign Tasks" tab.'}
        </p>
      </div>
    );
  }

  const handleRoleUpdateSubmit = async (userId: string) => {
    try {
      await updateRole(userId, selectedRole);
      setEditingUserId(null);
      setFeedbackMsg({ type: 'success', text: `Role updated to ${selectedRole}` });
      fetchUsers();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update user role' });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await deleteUserAccount(userId);
      setFeedbackMsg({ type: 'success', text: `User "${userName}" deleted successfully.` });
      fetchUsers();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to delete user' });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register({
        dept_id: newDeptId,
        email: newEmail,
        full_name: newName,
        password: newPassword,
        role: newRole
      });
      setShowAddModal(false);
      setNewDeptId('');
      setNewEmail('');
      setNewName('');
      setFeedbackMsg({ type: 'success', text: `Created user ${newName} (${newRole})` });
      fetchUsers();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to create user' });
    }
  };

  const countStudent = users.filter((u) => u.role === 'STUDENT').length;
  const countFaculty = users.filter((u) => u.role === 'FACULTY').length;
  const countLabMgr = users.filter((u) => u.role === 'LAB_MGR').length;
  const countDeptMgr = users.filter((u) => u.role === 'DEPT_MGR').length;

  const getRoleStyle = (r: UserRole) => {
    switch (r) {
      case 'STUDENT': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FACULTY': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'LAB_MGR': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DEPT_MGR': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            User Directory & Administrative Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add users, update system roles, and manage departmental permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{users.length}</div>
            <div className="text-[11px] text-slate-500">Total System Users</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{countStudent}</div>
            <div className="text-[11px] text-slate-500">Students (SoD)</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{countFaculty}</div>
            <div className="text-[11px] text-slate-500">Faculty Members</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{countLabMgr + countDeptMgr}</div>
            <div className="text-[11px] text-slate-500">Lab & Dept Managers</div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <Info className="w-4 h-4" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none"
            placeholder="Search by Name, Email, or Dept ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Role:
          </span>
          {['', 'STUDENT', 'FACULTY', 'LAB_MGR', 'DEPT_MGR'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {r === '' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs">Loading user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs">No matching users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Dept ID</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Registration</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${u.id === currentUser?.id ? 'bg-indigo-50/50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{u.full_name}</span>
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] text-indigo-600 font-semibold">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-indigo-700 font-semibold">{u.dept_id}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            className="bg-white border border-indigo-600 text-xs text-slate-900 rounded-lg px-2 py-1 outline-none"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="FACULTY">FACULTY</option>
                            <option value="LAB_MGR">LAB_MGR</option>
                            <option value="DEPT_MGR">DEPT_MGR</option>
                          </select>
                          <button
                            onClick={() => handleRoleUpdateSubmit(u.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleStyle(u.role)}`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {editingUserId !== u.id && (
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setSelectedRole(u.role);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 text-[11px] font-semibold cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit Role
                          </button>
                        )}
                        {isDeptManager && u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.full_name)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white text-[11px] cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Add System User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department ID</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 font-mono"
                  placeholder="SOD-2026-99"
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600"
                  placeholder="Full Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600"
                  placeholder="user@sod.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="LAB_MGR">LAB_MGR</option>
                  <option value="DEPT_MGR">DEPT_MGR</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
