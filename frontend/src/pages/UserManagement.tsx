import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock,
  RefreshCw,
  Search,
  Filter,
  X,
  Shield,
  Layers,
  Key
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserAccount, RolePermissionMatrixItem } from '../types';
import { canManageUsers, getRoleTheme } from '../utils/rbac';
import { AccessRestricted } from '../components/AccessRestricted';

const ROLES_LIST = [
  'Super Admin',
  'Service Desk Agent',
  'Banking Operations Manager',
  'Technical Support Engineer',
  'Operations Analyst',
  'User'
];

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [matrix, setMatrix] = useState<RolePermissionMatrixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState<UserAccount | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('Service Desk Agent');
  const [formDept, setFormDept] = useState('Retail Banking Operations');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsersAndMatrix = async () => {
    setLoading(true);
    try {
      const [usersRes, matrixRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles-permissions')
      ]);
      setUsers(usersRes.data);
      setMatrix(matrixRes.data);
    } catch (e) {
      console.error('Failed to load user management data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndMatrix();
  }, []);

  if (!canManageUsers(user?.role)) {
    return (
      <AccessRestricted
        moduleName="User Management & RBAC Administration"
        requiredRoles={['Super Admin']}
      />
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.post('/users', {
        full_name: formName,
        username: formUsername,
        email: formEmail,
        password: formPassword,
        role: formRole,
        department: formDept
      });
      setCreateModalOpen(false);
      setFormName('');
      setFormUsername('');
      setFormEmail('');
      setFormPassword('');
      fetchUsersAndMatrix();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    setSaving(true);
    try {
      await api.patch(`/users/${editModalUser.id}`, {
        full_name: formName,
        email: formEmail,
        role: formRole,
        department: formDept
      });
      setEditModalUser(null);
      fetchUsersAndMatrix();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (targetUser: UserAccount) => {
    try {
      await api.patch(`/users/${targetUser.id}/status`, {
        is_active: !targetUser.is_active
      });
      fetchUsersAndMatrix();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to toggle user status');
    }
  };

  const openEditModal = (u: UserAccount) => {
    setEditModalUser(u);
    setFormName(u.full_name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormDept(u.department);
    setErrorMsg(null);
  };

  const filteredUsers = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(s) ||
      u.username.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s) ||
      u.department.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            User Accounts & RBAC Governance
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Super Admin Only
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, edit, deactivate user accounts, assign roles, and audit role-based access permissions
          </p>
        </div>

        <button
          onClick={() => {
            setFormName('');
            setFormUsername('');
            setFormEmail('');
            setFormPassword('');
            setFormRole('Service Desk Agent');
            setFormDept('Retail Banking Operations');
            setErrorMsg(null);
            setCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" /> Provision New User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-navy-800 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Accounts Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-navy-800 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          5-Role RBAC Permissions Matrix
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff name, username, department, or role..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredUsers.length} of {users.length} Users
            </span>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading user registry...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Username / Email</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredUsers.map((u) => {
                      const theme = getRoleTheme(u.role);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{u.full_name}</div>
                            <div className="text-[10px] text-slate-400">UID: #{u.id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-navy-800 font-semibold">{u.username}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${theme.badge}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 truncate">{u.department}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {u.is_active ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-slate-400" /> Deactivated
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 text-slate-500 hover:text-navy-700 hover:bg-navy-50 rounded transition-colors"
                                title="Edit user & role"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                  u.is_active
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 5-Role RBAC Permissions Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matrix.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-navy-950">{item.role}</span>
                  <Shield className="w-4 h-4 text-navy-700" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {item.description}
                </p>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Role Capabilities:
                    </span>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {item.permissions.map((p, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Accessible Modules:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.accessibleModules.map((m, mIdx) => (
                        <span key={mIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Provision User Account (RBAC)</h3>
              <button onClick={() => setCreateModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="amorgan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Official Email *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="amorgan@finassist360.bank"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-navy-800 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Edit User & Role Assignment: {editModalUser.username}
              </h3>
              <button onClick={() => setEditModalUser(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-navy-800 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
