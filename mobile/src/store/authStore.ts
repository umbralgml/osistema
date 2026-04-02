import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../config/api';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  level: number;
  currentXp: number;
  totalXp: number;
  title: string;
  streak: number;
  objectives: string[];
  attributes?: { type: string; value: number }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('token', data.access_token);
    set({ user: data.user, token: data.access_token, isAuthenticated: true });
  },

  register: async (registerData) => {
    const { data } = await api.post('/auth/register', registerData);
    await SecureStore.setItemAsync('token', data.access_token);
    set({ user: data.user, token: data.access_token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const { data } = await api.get('/users/me');
        set({ user: data, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync('token');
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  refreshProfile: async () => {
    try {
      const { data } = await api.get('/users/me');
      set({ user: data });
    } catch {}
  },
}));
