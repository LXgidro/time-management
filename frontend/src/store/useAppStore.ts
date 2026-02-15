import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/user';
import type { AppState } from '../types/appstore';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      projects: [],
      activeTimer: null,
      isLoading: false,

      setAuth: ({ user, token }) => {
        localStorage.setItem('tm_token', token);
        localStorage.setItem('tm_user', JSON.stringify(user));
        set({ user, token, isLoading: false });
      },

      logout: () => {
        localStorage.removeItem('tm_token');
        localStorage.removeItem('tm_user');
        set({
          user: null,
          token: null,
          activeTimer: null,
          projects: [],
          isLoading: false,
        });
      },

      loadFromStorage: () => {
        const token = localStorage.getItem('tm_token');
        const userRaw = localStorage.getItem('tm_user');

        if (token && userRaw) {
          try {
            const user = JSON.parse(userRaw) as AuthUser;
            set({ token, user });
          } catch {
            localStorage.removeItem('tm_token');
            localStorage.removeItem('tm_user');
          }
        } else {
          if (token) localStorage.removeItem('tm_token');
          if (userRaw) localStorage.removeItem('tm_user');
        }
      },

      setProjects: (projects) => set({ projects }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === id ? { ...p, ...updates } : p,
          ),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p._id !== id),
        })),

      setActiveTimer: (activeTimer) => set({ activeTimer }),
      clearActiveTimer: () => set({ activeTimer: null }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);

export const useUser = () => useAppStore((state) => state.user);
export const useToken = () => useAppStore((state) => state.token);
export const useIsAuthenticated = () => useAppStore((state) => !!state.token);
export const useProjects = () => useAppStore((state) => state.projects);
export const useActiveTimer = () => useAppStore((state) => state.activeTimer);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
