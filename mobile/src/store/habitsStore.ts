import { create } from 'zustand';
import api from '../config/api';

interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  xpReward: number;
  difficulty: string;
  isSystemHabit: boolean;
  attributeType: string;
  completedToday?: boolean;
}

interface CompletionResult {
  xpEarned: number;
  newLevel: number;
  leveledUp: boolean;
  streakCount: number;
}

interface HabitsState {
  habits: Habit[];
  todayStatus: Record<string, boolean>;
  isLoading: boolean;
  lastCompletion: CompletionResult | null;
  fetchHabits: () => Promise<void>;
  fetchTodayStatus: () => Promise<void>;
  completeHabit: (habitId: string, note?: string) => Promise<CompletionResult>;
  createHabit: (data: any) => Promise<void>;
  clearLastCompletion: () => void;
}

export const useHabitsStore = create<HabitsState>((set) => ({
  habits: [],
  todayStatus: {},
  isLoading: false,
  lastCompletion: null,

  fetchHabits: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/habits');
    set({ habits: data, isLoading: false });
  },

  fetchTodayStatus: async () => {
    const { data } = await api.get('/habits/today');
    const status: Record<string, boolean> = {};
    data.forEach((log: any) => { status[log.habitId || log.habit?.id] = true; });
    set({ todayStatus: status });
  },

  completeHabit: async (habitId, note?) => {
    const { data } = await api.post('/habits/complete', { habitId, note });
    set({ lastCompletion: data });
    const todayRes = await api.get('/habits/today');
    const status: Record<string, boolean> = {};
    todayRes.data.forEach((log: any) => { status[log.habitId || log.habit?.id] = true; });
    set({ todayStatus: status });
    return data;
  },

  createHabit: async (habitData) => {
    await api.post('/habits', habitData);
    const { data } = await api.get('/habits');
    set({ habits: data });
  },

  clearLastCompletion: () => set({ lastCompletion: null }),
}));
