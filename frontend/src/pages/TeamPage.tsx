import { useState, useEffect } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Developer' | 'Viewer';
  joinDate: string;
}

export const TeamPage = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: TeamMember['role'];
  }>({
    name: '',
    email: '',
    role: 'Developer'
  });

  // Load team members from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('teamMembers');
    if (stored) {
      setTeam(JSON.parse(stored));
    } else {
      // Initialize with sample data
      const initialTeam: TeamMember[] = [
        {
          id: '1',
          name: 'Arjun Singh',
          email: 'arjun@synapse.ai',
          role: 'Admin',
          joinDate: '2025-01-01'
        },
        {
          id: '2',
          name: 'Priya Sharma',
          email: 'priya@synapse.ai',
          role: 'Manager',
          joinDate: '2025-01-15'
        },
        {
          id: '3',
          name: 'Ravi Kumar',
          email: 'ravi@synapse.ai',
          role: 'Developer',
          joinDate: '2025-02-01'
        }
      ];
      setTeam(initialTeam);
      localStorage.setItem('teamMembers', JSON.stringify(initialTeam));
    }
  }, []);

  // Save team to localStorage
  const saveTeam = (updatedTeam: TeamMember[]) => {
    setTeam(updatedTeam);
    localStorage.setItem('teamMembers', JSON.stringify(updatedTeam));
  };

  // Handle adding new member
  const handleAddMember = () => {
    if (formData.name.trim() && formData.email.trim()) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        joinDate: new Date().toISOString().split('T')[0]
      };
      saveTeam([...team, newMember]);
      setFormData({ name: '', email: '', role: 'Developer' });
      setShowAddForm(false);
    }
  };

  // Handle removing member
  const handleRemoveMember = (id: string) => {
    saveTeam(team.filter(member => member.id !== id));
  };

  // Handle role change
  const handleRoleChange = (id: string, newRole: TeamMember['role']) => {
    const updated = team.map(member =>
      member.id === id ? { ...member, role: newRole } : member
    );
    saveTeam(updated);
  };

  const roleColors: Record<TeamMember['role'], string> = {
    'Admin': '#dcfce7',
    'Manager': '#dbeafe',
    'Developer': '#e9d5ff',
    'Viewer': '#fef3c7'
  };

  const roleBorders: Record<TeamMember['role'], string> = {
    'Admin': '#10b981',
    'Manager': '#3b82f6',
    'Developer': '#a855f7',
    'Viewer': '#fbbf24'
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0a0e27', color: '#e0e0ff', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#f0fdf4', borderLeft: '6px solid #22c55e', padding: '16px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534', margin: '0 0 8px 0' }}>
            👥 Team Management
          </h1>
          <p style={{ color: '#15803d', margin: '0' }}>Manage your team members and their roles ({team.length} members)</p>
        </div>
      </div>

      {/* Add Member Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: '#22c55e',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Team Member'}
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <div style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Add New Team Member</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Name Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>Name</label>
              <input
                type="text"
                placeholder="Member name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: '#e0e0ff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Email Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>Email</label>
              <input
                type="email"
                placeholder="member@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: '#e0e0ff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Role Select */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamMember['role'] })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: '#e0e0ff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddMember}
            style={{
              backgroundColor: '#22c55e',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Add Member
          </button>
        </div>
      )}

      {/* Team Members Table */}
      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Join Date</th>
              <th style={{ padding: '12px', textAlign: 'center', color: '#9ca3af' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '12px', color: '#e0e0ff' }}>
                  <strong>{member.name}</strong>
                </td>
                <td style={{ padding: '12px', color: '#9ca3af' }}>{member.email}</td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as TeamMember['role'])}
                    style={{
                      backgroundColor: roleColors[member.role],
                      border: `2px solid ${roleBorders[member.role]}`,
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: '#000'
                    }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Developer">Developer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </td>
                <td style={{ padding: '12px', color: '#9ca3af' }}>
                  {new Date(member.joinDate).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {team.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ margin: '0', fontSize: '16px' }}>No team members yet. Add one to get started!</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '14px' }}>Total Members</p>
          <p style={{ color: '#22c55e', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>{team.length}</p>
        </div>

        <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '14px' }}>Admins</p>
          <p style={{ color: '#22c55e', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>{team.filter(m => m.role === 'Admin').length}</p>
        </div>

        <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '14px' }}>Developers</p>
          <p style={{ color: '#22c55e', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>{team.filter(m => m.role === 'Developer').length}</p>
        </div>

        <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '14px' }}>Other Roles</p>
          <p style={{ color: '#22c55e', margin: '0', fontSize: '28px', fontWeight: 'bold' }}>{team.filter(m => m.role !== 'Admin' && m.role !== 'Developer').length}</p>
        </div>
      </div>
    </div>
  );
};
