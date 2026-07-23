import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User, UserRole } from '../types/user';
import { api } from '../services/api';
import { Users, Search, Filter, Shield, UserPlus, Trash2, Edit3, Check, X, RefreshCw, Sparkles, Building, Info } from 'lucide-react';

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

  const fetchUsers = async () => {
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
  }, [roleFilter, search]);

  const handleRoleUpdateSubmit = async (userId: string) => {
    try {
      await updateRole(userId, selectedRole);
      setEditingUserId(null);
      setFeedbackMsg({ type: 'success', text: `Successfully updated user role to ${selectedRole}!` });
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
      setFeedbackMsg({ type: 'success', text: `Deleted user "${userName}" successfully.` });
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
      setFeedbackMsg({ type: 'success', text: `Created new user ${newName} (${newRole})!` });
      fetchUsers();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to create user' });
    }
  };

  const isManager = currentUser?.role === 'LAB_MGR' || currentUser?.role === 'DEPT_MGR';
  const isDeptManager = currentUser?.role === 'DEPT_MGR';

  // Metrics count
  const countStudent = users.filter((u) => u.role === 'STUDENT').length;
  const countFaculty = users.filter((u) => u.role === 'FACULTY').length;
  const countLabMgr = users.filter((u) => u.role === 'LAB_MGR').length;
  const countDeptMgr = users.filter((u) => u.role === 'DEPT_MGR').length;

  return (
    <div className="directory-container">
      {/* Header & Controls */}
      <div className="directory-header">
        <div>
          <h2 className="directory-title">
            <Users className="w-6 h-6 text-indigo-400 inline-block mr-2" />
            User Management Directory
          </h2>
          <p className="directory-subtitle">
            Manage departmental accounts, assign roles, and audit access permissions (FR-AUTH-01 to FR-AUTH-03)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => fetchUsers()} className="btn btn-secondary btn-icon" title="Refresh Directory">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            Add New User
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg bg-indigo">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg bg-blue">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="stat-number">{countStudent}</div>
            <div className="stat-label">Students (SoD)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg bg-purple">
            <Building className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="stat-number">{countFaculty}</div>
            <div className="stat-label">Faculty Members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg bg-amber">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="stat-number">{countLabMgr + countDeptMgr}</div>
            <div className="stat-label">Lab & Dept Managers</div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`alert ${feedbackMsg.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
          <Info className="w-5 h-5 mr-2" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="filter-bar glass-card">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Full Name, Email, or Dept ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <span className="filter-label">
            <Filter className="w-3.5 h-3.5 mr-1 inline-block" /> Role:
          </span>
          <button
            onClick={() => setRoleFilter('')}
            className={`filter-chip ${roleFilter === '' ? 'active' : ''}`}
          >
            All Roles ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('STUDENT')}
            className={`filter-chip ${roleFilter === 'STUDENT' ? 'active' : ''}`}
          >
            Students
          </button>
          <button
            onClick={() => setRoleFilter('FACULTY')}
            className={`filter-chip ${roleFilter === 'FACULTY' ? 'active' : ''}`}
          >
            Faculty
          </button>
          <button
            onClick={() => setRoleFilter('LAB_MGR')}
            className={`filter-chip ${roleFilter === 'LAB_MGR' ? 'active' : ''}`}
          >
            Lab Managers
          </button>
          <button
            onClick={() => setRoleFilter('DEPT_MGR')}
            className={`filter-chip ${roleFilter === 'DEPT_MGR' ? 'active' : ''}`}
          >
            Dept Managers
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="glass-card table-card">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
            <p>Fetching user directory data...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users className="w-12 h-12 text-slate-500 mb-3" />
            <h3>No users found</h3>
            <p>Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="user-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Department ID</th>
                  <th>Email Address</th>
                  <th>Assigned Role</th>
                  <th>Registration Date</th>
                  {isManager && <th className="text-right">Admin Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.id === currentUser?.id ? 'row-highlight' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-sm">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="user-cell-name">{u.full_name}</span>
                          {u.id === currentUser?.id && (
                            <span className="current-user-tag">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-indigo-300 font-semibold">{u.dept_id}</span>
                    </td>
                    <td>
                      <span className="text-slate-300">{u.email}</span>
                    </td>
                    <td>
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="role-select-inline"
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
                            className="btn-icon-sm btn-success"
                            title="Save Role"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="btn-icon-sm btn-cancel"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`role-badge role-${u.role.toLowerCase()}`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    {isManager && (
                      <td className="text-right">
                        <div className="actions-group">
                          {editingUserId !== u.id && (
                            <button
                              onClick={() => {
                                setEditingUserId(u.id);
                                setSelectedRole(u.role);
                              }}
                              className="btn-action btn-edit"
                              title="Modify User Role"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-1" />
                              Edit Role
                            </button>
                          )}

                          {isDeptManager && u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.full_name)}
                              className="btn-action btn-delete"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>
                <UserPlus className="w-5 h-5 text-indigo-400 inline-block mr-2" />
                Add User to System
              </h3>
              <button onClick={() => setShowAddModal(false)} className="close-btn">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-body">
              <div className="form-group">
                <label className="form-label">Department ID</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. SOD-2026-900"
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Full Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="user@sod.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input form-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="LAB_MGR">LAB_MGR</option>
                  <option value="DEPT_MGR">DEPT_MGR</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
