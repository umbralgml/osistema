import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    xpReward: number;
    isSystemHabit: boolean;
    attributeType: string;
  };
  completed: boolean;
  onComplete: () => void;
}

const categoryColors: Record<string, string> = {
  fitness: theme.colors.strength,
  study: theme.colors.intelligence,
  health: theme.colors.xp,
  mental: theme.colors.discipline,
  discipline: theme.colors.accent,
  default: theme.colors.secondary,
};

const difficultyLabels: Record<string, string> = {
  easy: 'F',
  medium: 'D',
  hard: 'B',
  extreme: 'S',
};

const difficultyColors: Record<string, string> = {
  easy: theme.colors.xp,
  medium: theme.colors.accent,
  hard: theme.colors.streak,
  extreme: theme.colors.danger,
};

export function HabitCard({ habit, completed, onComplete }: HabitCardProps) {
  const catColor = categoryColors[habit.category] || categoryColors.default;
  const diffLabel = difficultyLabels[habit.difficulty] || habit.difficulty;
  const diffColor = difficultyColors[habit.difficulty] || theme.colors.textMuted;

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      <View style={[styles.categoryStripe, { backgroundColor: catColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, completed && styles.nameCompleted]} numberOfLines={1}>
              {habit.name}
            </Text>
            {habit.isSystemHabit && (
              <View style={styles.systemBadge}>
                <Text style={styles.systemBadgeText}>SISTEMA</Text>
              </View>
            )}
          </View>
          <View style={styles.badges}>
            <View style={[styles.diffBadge, { borderColor: diffColor }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>Rank {diffLabel}</Text>
            </View>
          </View>
        </View>
        {habit.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {habit.description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.xpContainer}>
            <Text style={styles.xpIcon}>+</Text>
            <Text style={styles.xpText}>{habit.xpReward} XP</Text>
          </View>
          <Text style={[styles.categoryTag, { color: catColor }]}>
            {habit.category.toUpperCase()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.completeBtn, completed && styles.completeBtnDone]}
        onPress={onComplete}
        disabled={completed}
        activeOpacity={0.7}
      >
        {completed ? (
          <Text style={styles.checkmark}>&#10003;</Text>
        ) : (
          <Text style={styles.completeIcon}>&#9876;</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardCompleted: {
    opacity: 0.6,
    borderColor: theme.colors.xp + '40',
  },
  categoryStripe: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    flexShrink: 1,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  systemBadge: {
    backgroundColor: theme.colors.primary + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  systemBadgeText: {
    color: theme.colors.primaryLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badges: {
    flexDirection: 'row',
  },
  diffBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpIcon: {
    color: theme.colors.xp,
    fontSize: 14,
    fontWeight: '800',
    marginRight: 2,
  },
  xpText: {
    color: theme.colors.xp,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  completeBtn: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  completeBtnDone: {
    backgroundColor: theme.colors.xp + '20',
  },
  checkmark: {
    fontSize: 24,
    color: theme.colors.xp,
    fontWeight: '700',
  },
  completeIcon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
});
