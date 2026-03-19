/**
 * API utility functions - Fixed
 */
import axios, { AxiosInstance } from 'axios';
import { AuthToken, Service, ServiceDetail, HealthCheck, Alert, ServiceMetrics } from '@/types';

// ── Base URL — works locally and on Render ──────────────────────
const getBaseUrl = (): string => {
  try {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.length > 0) {
      return envUrl;
    }
  } catch (_) { }
  // Fallback — same server (works when frontend+backend on same domain)
  return '/api/v1';
};

export const API_BASE_URL = getBaseUrl();

let apiClient: AxiosInstance | null = null;

export const initializeApiClient = (accessToken?: string) => {
  apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
  return apiClient;
};

export const getApiClient = (): AxiosInstance => {
  if (!apiClient) {
    apiClient = initializeApiClient();
  }
  return apiClient;
};

export const setAuthToken = (token: string) => {
  const client = getApiClient();
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  const client = getApiClient();
  delete client.defaults.headers.common['Authorization'];
};

// Auth API
export const authAPI = {
  register: (email: string, password: string, fullName: string) =>
    getApiClient().post<{ message: string; data: any }>('/auth/register', {
      email,
      password,
      full_name: fullName,
    }),

  login: (email: string, password: string) =>
    getApiClient().post<AuthToken>('/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    getApiClient().post<AuthToken>('/auth/refresh', { refresh_token: refreshToken }),
};

// Services API
export const servicesAPI = {
  create: (name: string, healthCheckUrl: string, description?: string, headers?: Record<string, string>, tags?: string[], emailAlertsEnabled?: boolean) =>
    getApiClient().post<Service>('/services', {
      name,
      health_check_url: healthCheckUrl,
      description: description || '',
      headers,
      tags,
      email_alerts_enabled: emailAlertsEnabled,
    }),

  list: () => getApiClient().get<Service[]>('/services'),

  get: (serviceId: string) =>
    getApiClient().get<ServiceDetail>(`/services/${serviceId}`),

  update: (serviceId: string, data: Partial<Service>) =>
    getApiClient().patch<Service>(`/services/${serviceId}`, data),

  delete: (serviceId: string) =>
    getApiClient().delete(`/services/${serviceId}`),
};

// Health API
export const healthAPI = {
  check: (serviceId: string) =>
    getApiClient().post<HealthCheck>(`/health/${serviceId}/check`),

  history: (serviceId: string, limit?: number) =>
    getApiClient().get<HealthCheck[]>(`/health/${serviceId}/history`, {
      params: { limit },
    }),

  metrics: (serviceId: string) =>
    getApiClient().get<ServiceMetrics>(`/health/${serviceId}/metrics`),

  allMetrics: () =>
    getApiClient().get<ServiceMetrics[]>('/health/all/metrics'),
};

// Alerts API
export const alertsAPI = {
  list: (resolved?: boolean, limit?: number) =>
    getApiClient().get<Alert[]>('/alerts', {
      params: { resolved, limit },
    }),

  resolve: (alertId: string) =>
    getApiClient().post(`/alerts/${alertId}/resolve`),

  serviceAlerts: (serviceId: string) =>
    getApiClient().get<Alert[]>(`/alerts/${serviceId}/service`),
};

// WebSocket
export const createWebSocketConnection = (token: string): WebSocket => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${protocol}://${window.location.host}/ws/metrics/${token}`;
  return new WebSocket(wsUrl);
};