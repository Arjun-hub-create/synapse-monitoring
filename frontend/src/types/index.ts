/**
 * TypeScript Types for Synapse
 */

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  health_check_url: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceDetail extends Service {
  current_status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  last_check_at: string | null;
  uptime_percentage: number;
  avg_response_time_ms: number;
}

export interface HealthCheck {
  id: string;
  service_id: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  response_time_ms: number;
  status_code: number;
  error_message?: string;
  timestamp: string;
}

export interface ServiceMetrics {
  service_id: string;
  service_name: string;
  current_status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  uptime_percentage: number;
  avg_response_time_ms: number;
  min_response_time_ms: number;
  max_response_time_ms: number;
  total_checks: number;
  failed_checks: number;
  last_check_at: string | null;
  checks_24h: Array<{
    timestamp: string;
    status: string;
    response_time_ms: number;
  }>;
}

export interface Alert {
  id: string;
  service_id: string;
  service_name?: string;
  alert_type: 'service_down' | 'high_latency' | 'repeated_failures';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface WebSocketMessage {
  type: 'connection' | 'health_update' | 'alert' | 'metrics';
  data?: Record<string, any>;
  timestamp?: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}
