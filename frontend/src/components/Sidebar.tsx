/**
 * Sidebar Component - Inline CSS
 */
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', icon: '📊', path: '/' },
  { label: 'Metrics', icon: '📈', path: '/metrics' },
  { label: 'Performance', icon: '⚡', path: '/performance' },
  { label: 'Alerts', icon: '⚠️', path: '/alerts' },
  { label: 'Logs', icon: '📋', path: '/logs' },
  { label: 'Admin', icon: '👑', path: '/admin' },
  { label: 'Team', icon: '👥', path: '/team' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      style={{
        width: '250px',
        backgroundColor: '#1f2937',
        borderRight: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: '20px 0',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: '0' }}>
          SYNAPSE
        </h1>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>
          Monitoring Platform
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isActive ? '#3b82f6' : 'transparent',
                color: isActive ? 'white' : '#d1d5db',
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#374151';
                  (e.currentTarget as HTMLElement).style.color = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#d1d5db';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #374151',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0' }}>
          v1.0.0 • Production Ready
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
