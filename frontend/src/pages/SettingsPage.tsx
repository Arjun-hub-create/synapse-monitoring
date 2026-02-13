/**
 * Settings Page - User Preferences & Theme
 */
import { useState } from 'react';
import { useAuthStore } from '@/hooks/useAuth';

interface UserSettings {
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  timezone: string;
  language: 'en' | 'es' | 'fr' | 'de';
  dataRetention: number; // days
}

const STORAGE_KEY = 'synapse_user_settings';

const getStoredSettings = (): UserSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          theme: 'light',
          emailNotifications: true,
          alertFrequency: 'immediate',
          timezone: 'UTC',
          language: 'en',
          dataRetention: 30,
        };
  } catch {
    return {
      theme: 'light',
      emailNotifications: true,
      alertFrequency: 'immediate',
      timezone: 'UTC',
      language: 'en',
      dataRetention: 30,
    };
  }
};

const saveSettings = (settings: UserSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'advanced'>('general');

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(getStoredSettings());
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#e0e7ff', borderLeft: '6px solid #6366f1', padding: '16px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#312e81', margin: '0 0 8px 0' }}>
            ⚙️ Settings
          </h1>
          <p style={{ color: '#3730a3', margin: '0' }}>Manage your preferences and account settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
        {/* Sidebar Tabs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            height: 'fit-content',
          }}
        >
          {['general', 'notifications', 'security', 'advanced'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === tab ? '#3b82f6' : '#f3f4f6',
                color: activeTab === tab ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              {tab === 'general' && '⚙️ General'}
              {tab === 'notifications' && '🔔 Notifications'}
              {tab === 'security' && '🔐 Security'}
              {tab === 'advanced' && '🔧 Advanced'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '24px',
          }}
        >
          {/* General Tab */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                General Settings
              </h2>

              {/* User Info */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0 0' }}>
                  Email address cannot be changed
                </p>
              </div>

              {/* Theme */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern (EST)</option>
                  <option value="CST">Central (CST)</option>
                  <option value="MST">Mountain (MST)</option>
                  <option value="PST">Pacific (PST)</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                Notification Preferences
              </h2>

              {/* Email Notifications */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: '0 0 4px 0' }}>
                    Email Notifications
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                    Receive alerts via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              {/* Alert Frequency */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Alert Frequency
                </label>
                <select
                  value={settings.alertFrequency}
                  onChange={(e) => handleSettingChange('alertFrequency', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                  How often to receive alert notifications
                </p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                Security Settings
              </h2>

              <div style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #fbbf24', padding: '12px', borderRadius: '4px' }}>
                <p style={{ fontSize: '13px', color: '#92400e', margin: '0' }}>
                  🔒 Two-factor authentication is coming soon
                </p>
              </div>

              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
                <button
                  style={{
                    padding: '10px 16px',
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
                  onClick={() => {
                    if (window.confirm('Are you sure you want to change your password?')) {
                      alert('Password change feature coming soon');
                    }
                  }}
                >
                  Change Password
                </button>
              </div>

              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Active Sessions
                </p>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    borderLeft: '4px solid #10b981',
                    borderRadius: '4px',
                  }}
                >
                  <p style={{ fontSize: '13px', color: '#166534', margin: '0' }}>
                    Current Session - Active now
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                Advanced Settings
              </h2>

              {/* Data Retention */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.dataRetention}
                  onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                  Automatically delete data older than this many days
                </p>
              </div>

              {/* Developer Info */}
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '12px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                  API Documentation
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                  Access API docs at <code style={{ backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px' }}>http://localhost:8000/docs</code>
                </p>
              </div>

              {/* Export Data */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <button
                  style={{
                    padding: '10px 16px',
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
                  onClick={() => alert('Export feature coming soon')}
                >
                  Export All Data
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <button
              onClick={handleSave}
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
              Save Changes
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 16px',
                backgroundColor: '#d1d5db',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#c4cad3';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#d1d5db';
              }}
            >
              Reset
            </button>
            {saved && (
              <span style={{ color: '#10b981', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                ✓ Settings saved successfully
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
