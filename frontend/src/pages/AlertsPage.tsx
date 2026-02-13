/**
 * Alerts Page - Inline CSS Version
 */
import { useEffect, useState } from 'react';

interface Alert {
  id: string;
  serviceId: string;
  serviceName: string;
  level: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const STORAGE_KEY = 'synapse_alerts';

const getStoredAlerts = (): Alert[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveAlerts = (alerts: Alert[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
};

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');

  useEffect(() => {
    // Load alerts from localStorage
    const stored = getStoredAlerts();
    setAlerts(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = alerts;
    if (filter === 'active') {
      filtered = alerts.filter((a) => !a.resolved);
    } else if (filter === 'resolved') {
      filtered = alerts.filter((a) => a.resolved);
    }
    setFilteredAlerts(filtered);
  }, [alerts, filter]);

  const handleResolveAlert = (id: string) => {
    const updated = alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a));
    setAlerts(updated);
    saveAlerts(updated);
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#dc2626';
      case 'warning':
        return '#ea580c';
      case 'info':
        return '#0ea5e9';
      default:
        return '#6b7280';
    }
  };

  const getLevelLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fee2e2', borderLeft: '6px solid #ef4444', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#991b1b', margin: '0 0 8px 0' }}>
            🚨 Alerts
          </h1>
          <p style={{ color: '#7f1d1d', margin: '0' }}>
            View and manage service alerts {filteredAlerts.length > 0 ? `(${filteredAlerts.length} total)` : '(No alerts)'}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'active', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as 'all' | 'active' | 'resolved')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: filter === f ? '#3b82f6' : '#e5e7eb',
              color: filter === f ? 'white' : '#374151',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (filter !== f) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== f) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
              }
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>Loading alerts...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            color: '#6b7280',
          }}
        >
          <p style={{ fontSize: '16px', margin: '0' }}>No {filter === 'all' ? 'alerts' : `${filter} alerts`} found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '16px',
                backgroundColor: 'white',
                border: `2px solid ${getLevelColor(alert.level)}`,
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: alert.resolved ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!alert.resolved) {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: getLevelColor(alert.level),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {getLevelLabel(alert.level)}
                  </span>
                  {alert.resolved && (
                    <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>✓ RESOLVED</span>
                  )}
                </div>
                <p style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0', fontSize: '15px' }}>
                  {alert.serviceName}
                </p>
                <p style={{ color: '#6b7280', margin: '0 0 4px 0', fontSize: '14px' }}>{alert.message}</p>
                <p style={{ color: '#9ca3af', margin: '0', fontSize: '12px' }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                {!alert.resolved && (
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
                    }}
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
