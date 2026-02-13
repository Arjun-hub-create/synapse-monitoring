/**
 * Admin Page - User Management & System Settings
 */
import { useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

interface SystemStats {
  totalUsers: number;
  activeServices: number;
  totalAlerts: number;
  uptime: number;
  apiCalls: number;
  databaseSize: string;
}

const STORAGE_KEY_USERS = 'synapse_admin_users';
const STORAGE_KEY_STATS = 'synapse_system_stats';

const getStoredUsers = (): AdminUser[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading users:', e);
  }
  return [
    {
      id: '1',
      email: 'admin@synapse.io',
      role: 'admin',
      status: 'active',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

const getSystemStats = (): SystemStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_STATS);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading stats:', e);
  }
  return {
    totalUsers: 1,
    activeServices: 0,
    totalAlerts: 0,
    uptime: 99.9,
    apiCalls: 0,
    databaseSize: '2.4 MB',
  };
};

const saveUsers = (users: AdminUser[]) => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'system'>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>(getStoredUsers());
  const stats = getSystemStats();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'viewer'>('user');

  const handleAddUser = () => {
    if (!newUserEmail || !newUserEmail.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    const newUser: AdminUser = {
      id: Date.now().toString(),
      email: newUserEmail,
      role: newUserRole,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setNewUserEmail('');
    setNewUserRole('user');
    setShowAddUser(false);
    alert('User added successfully');
  };

  const handleDeleteUser = (id: string) => {
    if (id === users[0].id) {
      alert('Cannot delete the primary admin user');
      return;
    }

    if (window.confirm('Are you sure you want to remove this user?')) {
      const updatedUsers = users.filter((u) => u.id !== id);
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    }
  };

  const handleChangeRole = (id: string, newRole: 'admin' | 'user' | 'viewer') => {
    const updatedUsers = users.map((u) => (u.id === id ? { ...u, role: newRole } : u));
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const handleChangeStatus = (id: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    const updatedUsers = users.map((u) => (u.id === id ? { ...u, status: newStatus } : u));
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return { bg: '#fecaca', text: '#991b1b' };
      case 'user':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'viewer':
        return { bg: '#e0e7ff', text: '#3730a3' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#dcfce7', text: '#166534' };
      case 'inactive':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'suspended':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fef3c7', borderLeft: '6px solid #fbbf24', padding: '16px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e', margin: '0 0 8px 0' }}>
            👑 Administration
          </h1>
          <p style={{ color: '#78350f', margin: '0' }}>Manage system settings, users, and resources</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        {['dashboard', 'users', 'system'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab ? '3px solid #3b82f6' : 'none',
              color: activeTab === tab ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? '600' : '500',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'dashboard' && '📊 Dashboard'}
            {tab === 'users' && '👥 Users'}
            {tab === 'system' && '⚙️ System'}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3b82f6' },
              { label: 'Active Services', value: stats.activeServices, icon: '🟢', color: '#10b981' },
              { label: 'Total Alerts', value: stats.totalAlerts, icon: '⚠️', color: '#f59e0b' },
              { label: 'Uptime', value: `${stats.uptime}%`, icon: '📈', color: '#ec4899' },
              { label: 'API Calls', value: stats.apiCalls.toLocaleString(), icon: '📡', color: '#8b5cf6' },
              { label: 'DB Size', value: stats.databaseSize, icon: '💾', color: '#06b6d4' },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '24px', margin: '0 0 8px 0' }}>{stat.icon}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>{stat.label}</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, margin: '0' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* System Health */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
              System Health
            </h3>
            {[
              { name: 'API Server', status: 'Online', uptime: '99.9%' },
              { name: 'Database', status: 'Online', uptime: '99.8%' },
              { name: 'Cache Layer', status: 'Online', uptime: '99.95%' },
              { name: 'WebSocket Connection', status: 'Online', uptime: '99.7%' },
            ].map((service, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: idx < 3 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <p style={{ fontSize: '14px', color: '#374151', margin: '0' }}>{service.name}</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '500' }}>
                    {service.status}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{service.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
              }}
            >
              + Add User
            </button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <div
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="user">User</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleAddUser}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddUser(false)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {users.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                <p>No users found</p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: '#374151',
                  }}
                >
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Joined</div>
                  <div>Actions</div>
                </div>
                {users.map((user, idx) => {
                  const roleColor = getRoleColor(user.role);
                  const statusColor = getStatusColor(user.status);
                  return (
                    <div
                      key={user.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                        gap: '12px',
                        padding: '12px',
                        borderBottom: idx < users.length - 1 ? '1px solid #e5e7eb' : 'none',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#fafbfc',
                        alignItems: 'center',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ color: '#374151' }}>{user.email}</div>
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value as any)}
                        disabled={user.id === users[0].id}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '3px',
                          border: 'none',
                          backgroundColor: roleColor.bg,
                          color: roleColor.text,
                          cursor: user.id === users[0].id ? 'not-allowed' : 'pointer',
                          fontWeight: '500',
                          fontSize: '11px',
                        }}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <select
                        value={user.status}
                        onChange={(e) => handleChangeStatus(user.id, e.target.value as any)}
                        disabled={user.id === users[0].id}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '3px',
                          border: 'none',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          cursor: user.id === users[0].id ? 'not-allowed' : 'pointer',
                          fontWeight: '500',
                          fontSize: '11px',
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <div style={{ color: '#6b7280' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === users[0].id}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: user.id === users[0].id ? '#e5e7eb' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: user.id === users[0].id ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          fontWeight: '500',
                          opacity: user.id === users[0].id ? 0.5 : 1,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
              System Configuration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  API Version
                </label>
                <input
                  type="text"
                  value="1.0.0"
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Environment
                </label>
                <input
                  type="text"
                  value="Production"
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Database
                </label>
                <input
                  type="text"
                  value="MongoDB Atlas"
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Uptime (hours)
                </label>
                <input
                  type="text"
                  value="2160"
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #fbbf24', padding: '16px', borderRadius: '6px' }}>
            <p style={{ fontSize: '13px', color: '#92400e', margin: '0' }}>
              ℹ️ Advanced system configuration options including maintenance mode, backup settings, and performance tuning are coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
