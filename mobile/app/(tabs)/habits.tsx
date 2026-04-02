import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useHabitsStore } from '../../src/store/habitsStore';
import { useAuthStore } from '../../src/store/authStore';
import { HabitCard } from '../../src/components/HabitCard';
import { XpGainModal } from '../../src/components/XpGainModal';
import { CreateHabitModal } from '../../src/components/CreateHabitModal';
import { theme } from '../../src/config/theme';

export default function HabitsScreen() {
  const { habits, todayStatus, lastCompletion, fetchHabits, fetchTodayStatus, completeHabit, clearLastCompletion } = useHabitsStore();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([fetchHabits(), fetchTodayStatus()]);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleComplete = async (habitId: string) => {
    try {
      await completeHabit(habitId);
      await refreshProfile();
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message || 'Erro ao completar missao');
    }
  };

  const systemHabits = habits.filter((h) => h.isSystemHabit);
  const userHabits = habits.filter((h) => !h.isSystemHabit);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <Text style={styles.title}>MISSOES</Text>
        <Text style={styles.subtitle}>Complete suas quests diarias para ganhar XP</Text>

        {systemHabits.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>MISSOES DO SISTEMA</Text>
            {systemHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={!!todayStatus[habit.id]}
                onComplete={() => handleComplete(habit.id)}
              />
            ))}
          </>
        )}

        {userHabits.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>SUAS MISSOES</Text>
            {userHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={!!todayStatus[habit.id]}
                onComplete={() => handleComplete(habit.id)}
              />
            ))}
          </>
        )}

        {habits.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>&#x1F5E1;&#xFE0F;</Text>
            <Text style={styles.emptyText}>Nenhuma missao disponivel</Text>
            <Text style={styles.emptyHint}>
              Crie sua primeira missao ou configure seus objetivos
            </Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* XP Modal */}
      {lastCompletion && (
        <XpGainModal
          xpEarned={lastCompletion.xpEarned}
          leveledUp={lastCompletion.leveledUp}
          newLevel={lastCompletion.newLevel}
          streakCount={lastCompletion.streakCount}
          onDismiss={clearLastCompletion}
        />
      )}

      {/* Create Habit Modal */}
      <CreateHabitModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          loadData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptyHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 30,
  },
});
