import { useEffect, useState } from 'react';
import { healthAPI, servicesAPI, API_BASE_URL } from '@/utils/api';
import { ServiceMetrics } from '@/types';

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState<ServiceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceMetrics | null>(null);
  const [newServiceUrl, setNewServiceUrl] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceHeaders, setNewServiceHeaders] = useState('');
  const [newServiceTags, setNewServiceTags] = useState('');
  const [newServiceEmailAlerts, setNewServiceEmailAlerts] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [addError, setAddError] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await healthAPI.allMetrics();
      setMetrics(response.data || []);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      setAddError('Please enter a service name');
      return;
    }
    if (!newServiceUrl.trim()) {
      setAddError('Please enter a service URL');
      return;
    }
    if (!newServiceUrl.startsWith('http://') && !newServiceUrl.startsWith('https://')) {
      setAddError('URL must start with http:// or https://');
      return;
    }

    let headersObj: Record<string, string> | undefined = undefined;
    if (newServiceHeaders.trim()) {
      try {
        headersObj = JSON.parse(newServiceHeaders);
      } catch (e) {
        setAddError('Headers must be valid JSON format (e.g. {"Authorization": "Bearer token"})');
        return;
      }
    }

    let tagsArr: string[] | undefined = undefined;
    if (newServiceTags.trim()) {
      tagsArr = newServiceTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (tagsArr.length === 0) tagsArr = undefined;
    }

    setAddingService(true);
    setAddError('');

    try {
      await servicesAPI.create(newServiceName.trim(), newServiceUrl.trim(), '', headersObj, tagsArr, newServiceEmailAlerts);

      // Close modal and reset
      setShowAddService(false);
      setNewServiceName('');
      setNewServiceUrl('');
      setNewServiceHeaders('');
      setNewServiceTags('');
      setNewServiceEmailAlerts(false);
      setAddError('');

      // Refresh metrics after short delay (give backend time to run first check)
      setTimeout(async () => {
        await fetchMetrics();
      }, 2000);

    } catch (error: any) {
      console.error('Failed to add service:', error);

      // ── FIX: show proper error messages ──────────────────────────
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      if (status === 401) {
        setAddError('You must be logged in to add a service. Please login first.');
      } else if (status === 422) {
        setAddError('Invalid data. Please check the URL format (must start with https://)');
      } else if (detail) {
        setAddError(detail);
      } else if (!navigator.onLine) {
        setAddError('No internet connection. Please check your network.');
      } else {
        setAddError('Failed to add service. Make sure the backend is running.');
      }
    } finally {
      setAddingService(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddService(false);
    setNewServiceName('');
    setNewServiceUrl('');
    setNewServiceHeaders('');
    setNewServiceTags('');
    setNewServiceEmailAlerts(false);
    setAddError('');
  };

  const handleCopyBadge = (e: React.MouseEvent, service: ServiceMetrics) => {
    e.stopPropagation(); // prevent expanding the row
    const badgeUrl = `${API_BASE_URL}/services/${service.service_id}/badge`;
    // ensure absolute URL for badge if base url is relative
    const absoluteBadgeUrl = badgeUrl.startsWith('http') ? badgeUrl : `${window.location.origin}${badgeUrl}`;
    const dashboardUrl = window.location.origin;
    const markdown = `[![${service.service_name} Status](${absoluteBadgeUrl})](${dashboardUrl})`;

    navigator.clipboard.writeText(markdown)
      .then(() => alert(`Markdown badge for ${service.service_name} copied to clipboard!`))
      .catch((err) => console.error('Failed to copy badge:', err));
  };


  const allTags = Array.from(new Set(metrics.flatMap(m => m.tags || []))).sort();
  const filteredMetrics = selectedTag
    ? metrics.filter(m => m.tags?.includes(selectedTag))
    : metrics;

  const healthyCount = filteredMetrics.filter((m) => m.current_status === 'healthy').length;
  const unhealthyCount = filteredMetrics.filter((m) => m.current_status === 'unhealthy').length;
  const averageUptime = filteredMetrics.length > 0
    ? (filteredMetrics.reduce((sum, m) => sum + m.uptime_percentage, 0) / filteredMetrics.length).toFixed(2)
    : '0';

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0a0e27', color: '#e0e0ff', fontFamily: 'Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', margin: 0, fontWeight: 'bold', backgroundColor: '#00d9ff', padding: '12px 16px', borderRadius: '8px' }}>
          🎯 SYNAPSE Dashboard
        </h1>
        <button
          onClick={() => setShowAddService(true)}
          style={{
            backgroundColor: '#00d9ff', color: '#0a0e27',
            padding: '0.75rem 1.5rem', borderRadius: '4px',
            border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
          }}
        >
          + Add Service
        </button>
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1f3a', border: '2px solid #00d9ff',
            borderRadius: '8px', padding: '2rem', minWidth: '400px', maxWidth: '500px'
          }}>
            <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              Add New Service
            </h2>

            {/* Error message */}
            {addError && (
              <div style={{
                backgroundColor: '#ff006e22', border: '1px solid #ff006e',
                borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem',
                color: '#ff006e', fontSize: '0.9rem'
              }}>
                ⚠️ {addError}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Service Name *
              </label>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                style={{
                  width: '100%', padding: '0.6rem', backgroundColor: '#0a0e27',
                  color: '#00d9ff', border: '1px solid #00d9ff', borderRadius: '4px',
                  boxSizing: 'border-box', fontFamily: 'Arial, sans-serif'
                }}
                placeholder="My API Service"
                disabled={addingService}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Health Check URL *
              </label>
              <input
                type="text"
                value={newServiceUrl}
                onChange={(e) => setNewServiceUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                style={{
                  width: '100%', padding: '0.6rem', backgroundColor: '#0a0e27',
                  color: '#00d9ff', border: '1px solid #00d9ff', borderRadius: '4px',
                  boxSizing: 'border-box', fontFamily: 'Arial, sans-serif'
                }}
                placeholder="https://api.example.com/health"
                disabled={addingService}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Custom Headers (Optional JSON)
              </label>
              <textarea
                value={newServiceHeaders}
                onChange={(e) => setNewServiceHeaders(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem', backgroundColor: '#0a0e27',
                  color: '#00d9ff', border: '1px solid #00d9ff', borderRadius: '4px',
                  boxSizing: 'border-box', fontFamily: 'monospace', minHeight: '60px'
                }}
                placeholder='{"Authorization": "Bearer token"}'
                disabled={addingService}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#00d9ff', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={newServiceTags}
                onChange={(e) => setNewServiceTags(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                style={{
                  width: '100%', padding: '0.6rem', backgroundColor: '#0a0e27',
                  color: '#00d9ff', border: '1px solid #00d9ff', borderRadius: '4px',
                  boxSizing: 'border-box', fontFamily: 'Arial, sans-serif'
                }}
                placeholder="prod, backend, database"
                disabled={addingService}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="emailAlertsToggle"
                checked={newServiceEmailAlerts}
                onChange={(e) => setNewServiceEmailAlerts(e.target.checked)}
                disabled={addingService}
                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#00d9ff' }}
              />
              <label htmlFor="emailAlertsToggle" style={{ color: '#00d9ff', fontWeight: 'bold', cursor: 'pointer' }}>
                Receive Email Alerts on Downtime
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCloseModal}
                disabled={addingService}
                style={{
                  backgroundColor: '#666', color: '#fff', padding: '0.6rem 1.2rem',
                  borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                disabled={addingService}
                style={{
                  backgroundColor: addingService ? '#009bb5' : '#00d9ff',
                  color: '#0a0e27', padding: '0.6rem 1.2rem',
                  borderRadius: '4px', border: 'none',
                  cursor: addingService ? 'wait' : 'pointer', fontWeight: 'bold'
                }}
              >
                {addingService ? 'Adding...' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#00d9ff', fontWeight: 'bold', marginRight: '0.5rem' }}>Filter by Tag:</span>
          <button
            onClick={() => setSelectedTag(null)}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: '16px', border: '1px solid #00d9ff', cursor: 'pointer',
              backgroundColor: selectedTag === null ? '#00d9ff' : 'transparent',
              color: selectedTag === null ? '#0a0e27' : '#00d9ff', fontWeight: 'bold', fontSize: '0.85rem'
            }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              style={{
                padding: '0.3rem 0.8rem', borderRadius: '16px', border: '1px solid #00d9ff', cursor: 'pointer',
                backgroundColor: selectedTag === tag ? '#00d9ff' : 'transparent',
                color: selectedTag === tag ? '#0a0e27' : '#00d9ff', fontWeight: 'bold', fontSize: '0.85rem'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Services', value: filteredMetrics.length, color: '#00d9ff' },
          { label: 'Healthy', value: healthyCount, color: '#00ff00' },
          { label: 'Unhealthy', value: unhealthyCount, color: '#ff006e' },
          { label: 'Avg Uptime', value: `${averageUptime}%`, color: '#00d9ff' },
        ].map((card) => (
          <div key={card.label} style={{
            backgroundColor: '#1a1f3a', border: '1px solid #00d9ff',
            borderRadius: '8px', padding: '1.5rem', textAlign: 'center'
          }}>
            <p style={{ color: '#a000ff', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>{card.label}</p>
            <p style={{ fontSize: '2.5rem', color: card.color, margin: 0, fontWeight: 'bold' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Services List */}
      <div style={{ backgroundColor: '#1a1f3a', border: '2px solid #00d9ff', borderRadius: '8px', padding: '1.5rem' }}>
        <h2 style={{ color: '#00d9ff', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Services</h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#a000ff', fontSize: '1.1rem' }}>Loading services...</p>
        ) : metrics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#0a0e27', borderRadius: '4px' }}>
            <p style={{ color: '#a000ff', marginBottom: '1rem' }}>No services yet.</p>
            <p style={{ color: '#00d9ff', marginBottom: '1rem' }}>
              Make sure you are <strong>logged in</strong> then click <strong>"+ Add Service"</strong> to get started!
            </p>
          </div>
        ) : filteredMetrics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#0a0e27', borderRadius: '4px' }}>
            <p style={{ color: '#a000ff', marginBottom: '1rem' }}>No services match the selected filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredMetrics.map((service) => (
              <div
                key={service.service_id}
                onClick={() => setSelectedService(selectedService?.service_id === service.service_id ? null : service)}
                style={{
                  backgroundColor: '#0a0e27', border: '1px solid #00d9ff',
                  borderRadius: '6px', padding: '1rem', cursor: 'pointer', transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ color: '#00d9ff', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {service.service_name}
                    </h3>
                    {service.tags && service.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {service.tags.map(tag => (
                          <span key={tag} style={{
                            backgroundColor: '#00d9ff22', color: '#00d9ff',
                            padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={(e) => handleCopyBadge(e, service)}
                      style={{
                        backgroundColor: '#1a1f3a', color: '#a000ff', border: '1px solid #a000ff',
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer'
                      }}
                      title="Copy Markdown Badge"
                    >
                      📋 Copy Badge
                    </button>
                  </div>
                  <span style={{
                    padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold',
                    backgroundColor: service.current_status === 'healthy' ? '#00ff0033' : '#ff006e33',
                    color: service.current_status === 'healthy' ? '#00ff00' : '#ff006e'
                  }}>
                    {service.current_status === 'healthy' ? '✓ Healthy' : '✗ Down'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem', color: '#ddd' }}>
                  <div>
                    <span style={{ color: '#a000ff' }}>Response Time: </span>
                    <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{Math.round(service.avg_response_time_ms)}ms</span>
                  </div>
                  <div>
                    <span style={{ color: '#a000ff' }}>Uptime: </span>
                    <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{service.uptime_percentage.toFixed(2)}%</span>
                  </div>
                </div>

                {selectedService?.service_id === service.service_id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #00d9ff33', backgroundColor: '#1a1f3a', padding: '1rem', borderRadius: '4px' }}>
                    <h4 style={{ color: '#00d9ff', marginTop: 0 }}>Response Times</h4>
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
                        <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>
                          {service.last_check_at ? new Date(service.last_check_at).toLocaleTimeString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', backgroundColor: '#1a1f3a', border: '1px solid #00d9ff', borderRadius: '6px', padding: '1rem', color: '#ddd', fontSize: '0.9rem' }}>
        <p style={{ margin: 0, color: '#a000ff' }}>💡 Tip: You must be <strong style={{ color: '#00d9ff' }}>logged in</strong> to add and view services. Click on any service to see detailed response time information.</p>
      </div>
    </div>
  );
};
