/**
 * Storage utilities
 */

const TOKEN_KEY = 'synapse_access_token';
const REFRESH_TOKEN_KEY = 'synapse_refresh_token';

export const storage = {
  setAccessToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setRefreshToken: (token: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

/**
 * Utility functions
 */

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};

export const getStatusColor = (
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown'
): string => {
  switch (status) {
    case 'healthy':
      return 'text-neon-green';
    case 'unhealthy':
      return 'text-neon-pink';
    case 'degraded':
      return 'text-yellow-400';
    case 'unknown':
      return 'text-gray-400';
  }
};

export const getStatusBgColor = (
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown'
): string => {
  switch (status) {
    case 'healthy':
      return 'bg-green-500/20';
    case 'unhealthy':
      return 'bg-red-500/20';
    case 'degraded':
      return 'bg-yellow-500/20';
    case 'unknown':
      return 'bg-gray-500/20';
  }
};

export const getSeverityColor = (severity: 'info' | 'warning' | 'critical'): string => {
  switch (severity) {
    case 'info':
      return 'text-neon-cyan';
    case 'warning':
      return 'text-yellow-400';
    case 'critical':
      return 'text-neon-pink';
  }
};

export const formatResponseTime = (ms: number): string => {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatUptimePercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};
