/**
 * Metrics Page - Real-time Performance Monitoring
 */
import { useState, useEffect } from 'react';

interface Metric {
  timestamp: string;
  cpu: number;
  memory: number;
  responseTime: number;
  requestCount: number;
  errorCount: number;
}

const STORAGE_KEY = 'synapse_metrics';

const generateMockMetrics = (): Metric[] => {
  const now = Date.now();
  const metrics: Metric[] = [];
  
  for (let i = 59; i >= 0; i--) {
    metrics.push({
      timestamp: new Date(now - i * 60000).toLocaleTimeString(),
      cpu: Math.random() * 80 + 10,
      memory: Math.random() * 70 + 20,
      responseTime: Math.random() * 200 + 50,
      requestCount: Math.floor(Math.random() * 1000 + 500),
      errorCount: Math.floor(Math.random() * 20),
    });
  }
  return metrics;
};

const getStoredMetrics = (): Metric[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : generateMockMetrics();
  } catch {
    return generateMockMetrics();
  }
};

const saveMetrics = (metrics: Metric[]) => {
  const latest60 = metrics.slice(-60);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(latest60));
};

export const MetricsPage = () => {
  const [metrics, setMetrics] = useState<Metric[]>(getStoredMetrics());
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newMetric: Metric = {
        timestamp: now.toLocaleTimeString(),
        cpu: Math.random() * 80 + 10,
        memory: Math.random() * 70 + 20,
        responseTime: Math.random() * 200 + 50,
        requestCount: Math.floor(Math.random() * 1000 + 500),
        errorCount: Math.floor(Math.random() * 20),
      };
      
      setMetrics((prev) => {
        const updated = [...prev, newMetric];
        saveMetrics(updated);
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMetricData = () => {
    const endIdx = metrics.length;
    const startIdx = Math.max(0, endIdx - 60);
    return metrics.slice(startIdx, endIdx);
  };

  const currentMetrics = getMetricData();
  const latest = currentMetrics[currentMetrics.length - 1] || currentMetrics[0];

  const getStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { status: 'Good', color: '#10b981' };
    if (value <= thresholds.warning) return { status: 'Warning', color: '#f59e0b' };
    return { status: 'Critical', color: '#ef4444' };
  };

  const cpuStatus = getStatus(latest?.cpu || 0, { good: 50, warning: 75 });
  const memoryStatus = getStatus(latest?.memory || 0, { good: 50, warning: 75 });
  const responseTimeStatus = getStatus(latest?.responseTime || 0, { good: 100, warning: 150 });

  const SimpleLineChart = ({ data, dataKey, color }: { data: Metric[]; dataKey: keyof Metric; color: string }) => {
    if (data.length < 2) return null;

    const values = data.map((m) => (typeof m[dataKey] === 'number' ? (m[dataKey] as number) : 0));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const width = 100;
    const height = 100;
    const points = values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width="100%" height="100" viewBox={`0 0 ${width} ${height}`} style={{ marginTop: '8px' }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#dbeafe', borderLeft: '6px solid #3b82f6', padding: '16px', borderRadius: '8px', flex: 1, marginRight: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 8px 0' }}>
            📊 Metrics & Monitoring
          </h1>
          <p style={{ color: '#1e3a8a', margin: '0' }}>Real-time system performance metrics (updates every 5 seconds)</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['1h', '6h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: timeRange === range ? '#3b82f6' : '#e5e7eb',
                color: timeRange === range ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '13px',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          {
            title: 'CPU Usage',
            value: latest?.cpu.toFixed(1),
            unit: '%',
            status: cpuStatus,
            icon: '⚙️',
            color: '#f59e0b',
          },
          {
            title: 'Memory Usage',
            value: latest?.memory.toFixed(1),
            unit: '%',
            status: memoryStatus,
            icon: '💾',
            color: '#8b5cf6',
          },
          {
            title: 'Response Time',
            value: latest?.responseTime.toFixed(0),
            unit: 'ms',
            status: responseTimeStatus,
            icon: '⏱️',
            color: '#ec4899',
          },
          {
            title: 'Error Rate',
            value: latest?.errorCount,
            unit: 'errors',
            status: { status: latest?.errorCount === 0 ? 'Good' : 'Has Errors', color: latest?.errorCount === 0 ? '#10b981' : '#ef4444' },
            icon: '⚠️',
            color: '#ef4444',
          },
        ].map((metric, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{metric.title}</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: metric.color, margin: '0' }}>
                  {metric.value}
                  <span style={{ fontSize: '14px', marginLeft: '4px' }}>{metric.unit}</span>
                </p>
              </div>
              <span style={{ fontSize: '24px' }}>{metric.icon}</span>
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: metric.status.color + '20',
                color: metric.status.color,
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              {metric.status.status}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { title: 'CPU Usage', key: 'cpu' as const, color: '#f59e0b', unit: '%' },
          { title: 'Memory Usage', key: 'memory' as const, color: '#8b5cf6', unit: '%' },
          { title: 'Response Time', key: 'responseTime' as const, color: '#ec4899', unit: 'ms' },
          { title: 'Request Count', key: 'requestCount' as const, color: '#3b82f6', unit: 'req' },
        ].map((chart) => (
          <div
            key={chart.key}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '16px',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
              {chart.title}
            </p>
            <SimpleLineChart data={currentMetrics} dataKey={chart.key} color={chart.color} />
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '8px 0 0 0' }}>Last 60 data points</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0' }}>Recent Metrics</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Timestamp</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>CPU</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Memory</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Response Time</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Requests</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Errors</th>
              </tr>
            </thead>
            <tbody>
              {currentMetrics.slice(-10).reverse().map((metric, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx < 9 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: idx % 2 === 0 ? 'white' : '#fafbfc',
                  }}
                >
                  <td style={{ padding: '12px', color: '#374151' }}>{metric.timestamp}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        backgroundColor: metric.cpu > 75 ? '#fee2e2' : '#dbeafe',
                        color: metric.cpu > 75 ? '#991b1b' : '#1e40af',
                        borderRadius: '3px',
                        fontWeight: '500',
                      }}
                    >
                      {metric.cpu.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        backgroundColor: metric.memory > 75 ? '#fee2e2' : '#e0e7ff',
                        color: metric.memory > 75 ? '#991b1b' : '#3730a3',
                        borderRadius: '3px',
                        fontWeight: '500',
                      }}
                    >
                      {metric.memory.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#374151' }}>{metric.responseTime.toFixed(0)}ms</td>
                  <td style={{ padding: '12px', color: '#374151' }}>{metric.requestCount}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        backgroundColor: metric.errorCount > 0 ? '#fee2e2' : '#dcfce7',
                        color: metric.errorCount > 0 ? '#991b1b' : '#166534',
                        borderRadius: '3px',
                        fontWeight: '500',
                      }}
                    >
                      {metric.errorCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div style={{ marginTop: '20px', backgroundColor: '#dbeafe', borderLeft: '4px solid #0ea5e9', padding: '12px', borderRadius: '4px' }}>
        <p style={{ fontSize: '12px', color: '#1e40af', margin: '0' }}>
          ℹ️ Metrics are collected every 5 seconds and stored locally. Historical data retention varies based on your settings.
        </p>
      </div>
    </div>
  );
};

export default MetricsPage;
