/**
 * Dashboard Page - Completely Rebuilt
 */
import { useEffect, useState } from 'react';
import { healthAPI } from '@/utils/api';
import { ServiceMetrics } from '@/types';

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState<ServiceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceMetrics | null>(null);
  const [newServiceUrl, setNewServiceUrl] = useState('');
  const [newServiceName, setNewServiceName] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await healthAPI.allMetrics();
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddService = async () => {
    if (!newServiceName || !newServiceUrl) {
      alert('Please enter both service name and URL');
      return;
    }
    // TODO: Add actual API call here
    alert('Service added! (API integration needed)');
    setShowAddService(false);
    setNewServiceName('');
    setNewServiceUrl('');
  };

  const healthyCount = metrics.filter((m) => m.current_status === 'healthy').length;
  const unhealthyCount = metrics.filter((m) => m.current_status === 'unhealthy').length;
  const averageUptime = metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.uptime_percentage, 0) / metrics.length).toFixed(2) : '0';

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0a0e27', color: '#e0e0ff', fontFamily: 'Arial, sans-serif' }}>
      {/* Header with Add Service Button */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', margin: 0, fontWeight: 'bold', backgroundColor: '#00d9ff', padding: '12px 16px', borderRadius: '8px' }}>🎯 SYNAPSE Dashboard</h1>
        <button
          onClick={() => setShowAddService(true)}
          style={{
            backgroundColor: '#00d9ff',
            color: '#0a0e27',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          + Add Service
        </button>
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1f3a',
            border: '2px solid #00d9ff',
            borderRadius: '8px',
            padding: '2rem',
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add New Service</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Service Name</label>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: '#0a0e27',
                  color: '#00d9ff',
                  border: '1px solid #00d9ff',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontFamily: 'Arial, sans-serif'
                }}
                placeholder="My API Service"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Service URL</label>
              <input
                type="url"
                value={newServiceUrl}
                onChange={(e) => setNewServiceUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: '#0a0e27',
                  color: '#00d9ff',
                  border: '1px solid #00d9ff',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontFamily: 'Arial, sans-serif'
                }}
                placeholder="https://api.example.com/health"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddService(false)}
                style={{
                  backgroundColor: '#666',
                  color: '#fff',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                style={{
                  backgroundColor: '#00d9ff',
                  color: '#0a0e27',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          backgroundColor: '#1a1f3a',
          border: '1px solid #00d9ff',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#a000ff', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Total Services</p>
          <p style={{ fontSize: '2.5rem', color: '#00d9ff', margin: 0, fontWeight: 'bold' }}>{metrics.length}</p>
        </div>

        <div style={{
          backgroundColor: '#1a1f3a',
          border: '1px solid #00d9ff',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#00ff00', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Healthy</p>
          <p style={{ fontSize: '2.5rem', color: '#00ff00', margin: 0, fontWeight: 'bold' }}>{healthyCount}</p>
        </div>

        <div style={{
          backgroundColor: '#1a1f3a',
          border: '1px solid #00d9ff',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#ff006e', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Unhealthy</p>
          <p style={{ fontSize: '2.5rem', color: '#ff006e', margin: 0, fontWeight: 'bold' }}>{unhealthyCount}</p>
        </div>

        <div style={{
          backgroundColor: '#1a1f3a',
          border: '1px solid #00d9ff',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#a000ff', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Avg Uptime</p>
          <p style={{ fontSize: '2.5rem', color: '#00d9ff', margin: 0, fontWeight: 'bold' }}>{averageUptime}%</p>
        </div>
      </div>

      {/* Services List */}
      <div style={{
        backgroundColor: '#1a1f3a',
        border: '2px solid #00d9ff',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Services</h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#a000ff', fontSize: '1.1rem' }}>Loading services...</p>
        ) : metrics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#0a0e27', borderRadius: '4px' }}>
            <p style={{ color: '#a000ff', marginBottom: '1rem' }}>No services yet. Click "Add Service" to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {metrics.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(selectedService?.id === service.id ? null : service)}
                style={{
                  backgroundColor: '#0a0e27',
                  border: '1px solid #00d9ff',
                  borderRadius: '6px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {/* Service Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ color: '#00d9ff', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {service.service_name}
                    </h3>
                  </div>
                  <span style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    backgroundColor: service.current_status === 'healthy' ? '#00ff0033' : '#ff006e33',
                    color: service.current_status === 'healthy' ? '#00ff00' : '#ff006e'
                  }}>
                    {service.current_status === 'healthy' ? '✓ Healthy' : '✗ Down'}
                  </span>
                </div>

                {/* Service Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem', color: '#ddd' }}>
                  <div>
                    <span style={{ color: '#a000ff' }}>Response Time: </span>
                    <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{Math.round(service.avg_response_time_ms)}ms</span>
                  </div>
                  <div>
                    <span style={{ color: '#a000ff' }}>Uptime: </span>
                    <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{service.uptime_percentage.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span style={{ color: '#a000ff' }}>Checks: </span>
                    <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>Recently</span>
                  </div>
                </div>

                {/* Expanded View */}
                {selectedService?.id === service.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #00d9ff33', backgroundColor: '#1a1f3a', padding: '1rem', borderRadius: '4px' }}>
                    <h4 style={{ color: '#00d9ff', marginTop: 0 }}>Response Times (Recent)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#a000ff' }}>Average: </span>
                        <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{Math.round(service.avg_response_time_ms)}ms</span>
                      </div>
                      <div>
                        <span style={{ color: '#a000ff' }}>Max: </span>
                        <span style={{ color: '#ff9900', fontWeight: 'bold' }}>{Math.round(service.max_response_time_ms)}ms</span>
                      </div>
                      <div>
                        <span style={{ color: '#a000ff' }}>Last Check: </span>
                        <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{new Date(service.last_check_at || '').toLocaleTimeString() || 'Never'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '2rem',
        backgroundColor: '#1a1f3a',
        border: '1px solid #00d9ff',
        borderRadius: '6px',
        padding: '1rem',
        color: '#ddd',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: 0, color: '#a000ff' }}>💡 Tip: Click on any service to see detailed response time Information</p>
      </div>
    </div>
  );
};
