/**
 * UI Store (Zustand)
 */
import { create } from 'zustand';
import { UIState } from '@/types';

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  openSidebar: () => set({ sidebarOpen: true }),
}));
