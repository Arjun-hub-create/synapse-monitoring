/**
 * Main App Component with Routing
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks';
import { Header, Sidebar } from '@/components';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { LogsPage } from '@/pages/LogsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { MetricsPage } from '@/pages/MetricsPage';
import { PerformancePage } from '@/pages/PerformancePage';
import { TeamPage } from '@/pages/TeamPage';

export function App() {
  const { accessToken } = useAuthStore();

  // Show login/register for unauthenticated users
  if (!accessToken) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Show authenticated routes
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0a0e27' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header />
          <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
