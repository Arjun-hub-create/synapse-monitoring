/**
 * Auth Store (Zustand)
 */
import { create } from 'zustand';
import { AuthState } from '@/types';
import { authAPI, setAuthToken, clearAuthToken, initializeApiClient } from '@/utils/api';
import { storage } from '@/utils';

export const useAuthStore = create<AuthState>((set) => {
  // Initialize client with stored token
  const storedToken = storage.getAccessToken();
  if (storedToken) {
    initializeApiClient(storedToken);
  }

  return {
    user: null,
    accessToken: storedToken || null,
    refreshToken: storage.getRefreshToken() || null,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authAPI.login(email, password);
        const { access_token, refresh_token } = response.data;

        storage.setAccessToken(access_token);
        storage.setRefreshToken(refresh_token);
        setAuthToken(access_token);

        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoading: false,
        });
      } catch (error: any) {
        const message = error.response?.data?.detail || 'Login failed';
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    register: async (email: string, password: string, fullName: string) => {
      set({ isLoading: true, error: null });
      try {
        // Register user
        await authAPI.register(email, password, fullName);
        
        // Auto login after registration
        const loginResponse = await authAPI.login(email, password);
        const { access_token, refresh_token } = loginResponse.data;

        storage.setAccessToken(access_token);
        storage.setRefreshToken(refresh_token);
        setAuthToken(access_token);

        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Registration failed:', error);
        const message = error.response?.data?.detail || error.message || 'Registration failed';
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    logout: () => {
      storage.clear();
      clearAuthToken();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null,
      });
    },

    clearError: () => {
      set({ error: null });
    },
  };
});
