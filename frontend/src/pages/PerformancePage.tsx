/**
 * Performance Page - Detailed Analytics & Insights
 */
import { useState } from 'react';

interface PerformanceData {
  serviceId: string;
  serviceName: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  uptime: number;
  errorRate: number;
  requestsPerSecond: number;
  peakResponseTime: number;
}

const STORAGE_KEY = 'synapse_performance_data';

const getPerformanceData = (): PerformanceData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading performance data:', e);
  }

  return [
    {
      serviceId: '1',
      serviceName: 'API Gateway',
      avgResponseTime: 145,
      p95ResponseTime: 320,
      p99ResponseTime: 450,
      uptime: 99.95,
      errorRate: 0.02,
      requestsPerSecond: 1250,
      peakResponseTime: 520,
    },
    {
      serviceId: '2',
      serviceName: 'Auth Service',
      avgResponseTime: 89,
      p95ResponseTime: 180,
      p99ResponseTime: 250,
      uptime: 99.98,
      errorRate: 0.01,
      requestsPerSecond: 450,
      peakResponseTime: 320,
    },
    {
      serviceId: '3',
      serviceName: 'Database',
      avgResponseTime: 45,
      p95ResponseTime: 120,
      p99ResponseTime: 180,
      uptime: 99.9,
      errorRate: 0.05,
      requestsPerSecond: 2100,
      peakResponseTime: 250,
    },
  ];
};

export const PerformancePage = () => {
  const [performanceData] = useState<PerformanceData[]>(getPerformanceData());
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const selectedData = performanceData.find((p) => p.serviceId === selectedService) || performanceData[0];

  const getHealthScore = (data: PerformanceData) => {
    let score = 100;
    score -= data.errorRate * 1000; // Each 0.1% error reduces score by 100
    score -= Math.max(0, (data.avgResponseTime - 100) / 5); // Slow response times reduce score
    score -= (100 - data.uptime) * 10; // Downtime heavily penalizes score
    return Math.max(0, Math.min(100, score));
  };

  const getHealthStatus = (score: number) => {
    if (score >= 95) return { status: 'Excellent', color: '#10b981' };
    if (score >= 85) return { status: 'Good', color: '#3b82f6' };
    if (score >= 70) return { status: 'Fair', color: '#f59e0b' };
    return { status: 'Poor', color: '#ef4444' };
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#e9d5ff', borderLeft: '6px solid #a855f7', padding: '16px', borderRadius: '8px', flex: 1, marginRight: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#6b21a8', margin: '0 0 8px 0' }}>
            ⚡ Performance Analytics
          </h1>
          <p style={{ color: '#581c87', margin: '0' }}>Detailed performance metrics and service health analysis</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['24h', '7d', '30d'].map((range) => (
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

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px' }}>
        {/* Sidebar - Service List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {performanceData.map((data) => {
            const score = getHealthScore(data);
            const health = getHealthStatus(score);
            return (
              <button
                key={data.serviceId}
                onClick={() => setSelectedService(data.serviceId)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  border: selectedService === data.serviceId ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: selectedService === data.serviceId ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    selectedService === data.serviceId ? '#eff6ff' : '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    selectedService === data.serviceId ? '#eff6ff' : 'white';
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', margin: '0 0 6px 0' }}>
                  {data.serviceName}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: health.color,
                    }}
                  />
                  <span style={{ fontSize: '11px', color: health.color, fontWeight: '600' }}>
                    {health.status}
                  </span>
                  <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: 'auto' }}>
                    {score.toFixed(0)}/100
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Health Score Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>Service Health Score</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                  {selectedData.serviceName}
                </p>
              </div>
              <span style={{ fontSize: '24px' }}>❤️</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Health Score Gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `conic-gradient(${getHealthStatus(getHealthScore(selectedData)).color} 0deg ${
                        (getHealthScore(selectedData) / 100) * 360
                      }deg, #e5e7eb ${(getHealthScore(selectedData) / 100) * 360}deg 360deg)`,
                    }}
                  />
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
                      {getHealthScore(selectedData).toFixed(0)}
                    </p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '0' }}>/ 100</p>
                  </div>
                </div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: getHealthStatus(getHealthScore(selectedData)).color, marginTop: '12px' }}>
                  {getHealthStatus(getHealthScore(selectedData)).status}
                </p>
              </div>

              {/* Key Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Uptime', value: `${selectedData.uptime.toFixed(2)}%`, icon: '⬆️' },
                  { label: 'Error Rate', value: `${(selectedData.errorRate * 100).toFixed(2)}%`, icon: '⚠️' },
                  { label: 'Avg Response', value: `${selectedData.avgResponseTime}ms`, icon: '⏱️' },
                  { label: 'Peak Response', value: `${selectedData.peakResponseTime}ms`, icon: '📈' },
                ].map((metric, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      padding: '12px',
                      borderLeft: '3px solid #3b82f6',
                    }}
                  >
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0' }}>{metric.label}</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
              Response Time Distribution
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { title: 'Average', value: selectedData.avgResponseTime, unit: 'ms', description: 'Mean response time' },
                { title: 'P95', value: selectedData.p95ResponseTime, unit: 'ms', description: '95th percentile' },
                { title: 'P99', value: selectedData.p99ResponseTime, unit: 'ms', description: '99th percentile' },
              ].map((stat, idx) => (
                <div key={idx} style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>{stat.title}</p>
                  <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: '4px 0 0 0' }}>
                    {stat.value}
                    <span style={{ fontSize: '12px', marginLeft: '4px' }}>{stat.unit}</span>
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>{stat.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic & Performance */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
              Traffic & Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                {
                  title: 'Requests/Second',
                  value: selectedData.requestsPerSecond,
                  unit: 'req/s',
                  color: '#3b82f6',
                },
                {
                  title: 'Error Rate',
                  value: (selectedData.errorRate * 100).toFixed(3),
                  unit: '%',
                  color: selectedData.errorRate > 0.05 ? '#ef4444' : '#10b981',
                },
                {
                  title: 'Uptime',
                  value: selectedData.uptime.toFixed(2),
                  unit: '%',
                  color: selectedData.uptime > 99.9 ? '#10b981' : '#f59e0b',
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: stat.color + '10',
                    borderRadius: '6px',
                    padding: '16px',
                    borderLeft: `4px solid ${stat.color}`,
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>{stat.title}</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color, margin: '0' }}>
                    {stat.value}
                    <span style={{ fontSize: '12px', marginLeft: '4px' }}>{stat.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #fbbf24', padding: '16px', borderRadius: '6px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', margin: '0 0 8px 0' }}>
              💡 Performance Recommendations
            </p>
            <ul style={{ margin: '0', paddingLeft: '20px', color: '#92400e', fontSize: '12px' }}>
              <li>Consider caching frequently accessed endpoints</li>
              <li>Monitor P99 response times - there may be occasional slow queries</li>
              <li>Current error rate is within acceptable limits</li>
              <li>Uptime is excellent - maintain current infrastructure health</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
