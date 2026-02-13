/**
 * Logs Page - Inline CSS Version
 */
import { useState, useEffect } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
}

const STORAGE_KEY = 'synapse_logs';

const getStoredLogs = (): LogEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLogs = (logs: LogEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

// Mock initial logs
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: 'info',
    message: 'Health check passed for Auth Service',
    source: 'scheduler',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    level: 'warning',
    message: 'High latency detected: 450ms',
    source: 'health-monitor',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    level: 'info',
    message: 'Service Database Cache refreshed',
    source: 'cache',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    level: 'error',
    message: 'Failed to connect to API Gateway',
    source: 'api-gateway',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'critical',
    message: 'Critical: Database connection lost',
    source: 'database',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 360000).toISOString(),
    level: 'info',
    message: 'New user registered: user@example.com',
    source: 'auth',
  },
];

export const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Load logs from localStorage, or use mock logs if empty
    let stored = getStoredLogs();
    if (stored.length === 0) {
      stored = mockLogs;
      saveLogs(stored);
    }
    setLogs(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = logs;

    // Apply level filter
    if (filter !== 'all') {
      filtered = filtered.filter((log) => log.level === filter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.source.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
  }, [logs, filter, search]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return { bg: '#fecaca', text: '#dc2626', border: '#ef4444' };
      case 'error':
        return { bg: '#fde2e4', text: '#991b1b', border: '#f87171' };
      case 'warning':
        return { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' };
      case 'info':
        return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const getLevelLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const handleCopyLog = (log: LogEntry) => {
    const text = `[${log.level.toUpperCase()}] ${log.timestamp} - ${log.source}: ${log.message}`;
    navigator.clipboard.writeText(text);
    alert('Log copied to clipboard');
  };

  const handleDownloadLogs = () => {
    const csv = logs
      .map((log) => `"${log.timestamp}","${log.level}","${log.source}","${log.message}"`)
      .join('\n');
    const header = '"timestamp","level","source","message"\n';
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      setLogs([]);
      saveLogs([]);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#dcfce7', borderLeft: '6px solid #10b981', padding: '16px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#065f46', margin: '0 0 8px 0' }}>
            📋 Logs
          </h1>
          <p style={{ color: '#047857', margin: '0' }}>System activity and event logs</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* Search Box */}
        <input
          type="text"
          placeholder="Search logs by message or source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            minWidth: '250px',
            fontFamily: 'monospace',
          }}
        />

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'info', 'warning', 'error', 'critical'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as 'all' | 'info' | 'warning' | 'error' | 'critical')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === f ? '#3b82f6' : '#e5e7eb',
                color: filter === f ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '12px',
                whiteSpace: 'nowrap',
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
              {f === 'all' ? 'All' : getLevelLabel(f)}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleDownloadLogs}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
          }}
        >
          ↓ Download
        </button>
        <button
          onClick={handleClearLogs}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
          }}
        >
          🗑 Clear
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {['info', 'warning', 'error', 'critical'].map((level) => {
          const count = logs.filter((log) => log.level === level).length;
          const colors = getLevelColor(level);
          return (
            <div
              key={level}
              style={{
                padding: '12px',
                backgroundColor: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <p style={{ color: colors.text, fontWeight: 'bold', fontSize: '24px', margin: '0' }}>{count}</p>
              <p style={{ color: colors.text, fontSize: '12px', margin: '0' }}>
                {getLevelLabel(level)} Logs
              </p>
            </div>
          );
        })}
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>Loading logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
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
          <p style={{ fontSize: '16px', margin: '0' }}>No logs found matching your filters</p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 80px 120px 1fr 80px',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '600',
              fontSize: '12px',
              color: '#374151',
              textTransform: 'uppercase',
            }}
          >
            <div>Timestamp</div>
            <div>Level</div>
            <div>Source</div>
            <div>Message</div>
            <div style={{ textAlign: 'right' }}>Action</div>
          </div>

          {/* Table Rows */}
          <div>
            {filteredLogs.map((log, index) => {
              const colors = getLevelColor(log.level);
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 80px 120px 1fr 80px',
                    gap: '12px',
                    padding: '12px',
                    borderBottom: index < filteredLogs.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: index % 2 === 0 ? 'white' : '#fafbfc',
                    fontSize: '12px',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ color: '#6b7280', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>

                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderRadius: '3px',
                        fontWeight: 'bold',
                        fontSize: '11px',
                      }}
                    >
                      {getLevelLabel(log.level)}
                    </span>
                  </div>

                  <div style={{ color: '#6b7280', fontFamily: 'monospace' }}>{log.source}</div>

                  <div style={{ color: '#374151', wordBreak: 'break-word' }}>{log.message}</div>

                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleCopyLog(log)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#e5e7eb',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', textAlign: 'center' }}>
        <p style={{ color: '#166534', fontSize: '12px', margin: '0' }}>
          Showing {filteredLogs.length} of {logs.length} logs
        </p>
      </div>
    </div>
  );
};

export default LogsPage;
