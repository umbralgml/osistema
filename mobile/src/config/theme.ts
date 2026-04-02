export const theme = {
  colors: {
    background: '#0a0a1a',
    surface: '#12122a',
    surfaceLight: '#1a1a3e',
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    secondary: '#06b6d4',
    accent: '#f59e0b',
    xp: '#22c55e',
    danger: '#ef4444',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#1e293b',
    streak: '#f97316',
    levelUp: '#eab308',
    strength: '#ef4444',
    intelligence: '#3b82f6',
    discipline: '#a855f7',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 8, md: 12, lg: 16, xl: 24 },
  fontSize: { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 36 },
};

export type Theme = typeof theme;
