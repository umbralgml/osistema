import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useHabitsStore } from '../../src/store/habitsStore';
import { useAuthStore } from '../../src/store/authStore';
import { HabitCard } from '../../src/components/HabitCard';
import { XpGainModal } from '../../src/components/XpGainModal';
import { CreateHabitModal } from '../../src/components/CreateHabitModal';
import { SystemText } from '../../src/components/SystemText';
import { theme } from '../../src/config/theme';
import { sounds } from '../../src/utils/sounds';

export default function HabitsScreen() {
  const { habits, todayStatus, lastCompletion, fetchHabits, fetchTodayStatus, completeHabit, clearLastCompletion } = useHabitsStore();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const fabBob = useRef(new Animated.Value(0)).current;
  const fabGlow = useRef(new Animated.Value(0.3)).current;
  const emptyPulse = useRef(new Animated.Value(0.5)).current;

  const loadData = useCallback(async () => {
    await Promise.all([fetchHabits(), fetchTodayStatus()]);
  }, []);

  useEffect(() => {
    loadData().then(() => {
      setShowTitle(true);
    });
  }, []);

  // FAB floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabBob, {
          toValue: -6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabBob, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabGlow, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Empty state sword pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(emptyPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(emptyPulse, {
          toValue: 0.5,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
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
      sounds.warning();
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
        {showTitle && (
          <SystemText
            text="MISSOES"
            speed={40}
            style={styles.title}
            glowColor={theme.colors.text}
          />
        )}
        <Text style={styles.subtitle}>Complete suas quests diarias para ganhar XP</Text>

        {systemHabits.length > 0 && (
          <>
            <View style={styles.sectionTitleContainer}>
              <SystemText
                text="MISSOES DO SISTEMA"
                speed={25}
                style={styles.sectionTitle}
                glowColor={theme.colors.secondary}
              />
            </View>
            {systemHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={!!todayStatus[habit.id]}
                onComplete={() => handleComplete(habit.id)}
                delay={index * 50}
              />
            ))}
          </>
        )}

        {userHabits.length > 0 && (
          <>
            <View style={styles.sectionTitleContainer}>
              <SystemText
                text="SUAS MISSOES"
                speed={25}
                style={styles.sectionTitle}
                glowColor={theme.colors.secondary}
              />
            </View>
            {userHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={!!todayStatus[habit.id]}
                onComplete={() => handleComplete(habit.id)}
                delay={(systemHabits.length + index) * 50}
              />
            ))}
          </>
        )}

        {habits.length === 0 && (
          <View style={styles.emptyState}>
            <Animated.Text style={[styles.emptyIcon, { opacity: emptyPulse }]}>
              &#x1F5E1;&#xFE0F;
            </Animated.Text>
            <Text style={styles.emptyText}>Nenhuma missao disponivel</Text>
            <Text style={styles.emptyHint}>
              Crie sua primeira missao ou configure seus objetivos
            </Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ translateY: fabBob }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            sounds.tick();
            setShowCreate(true);
          }}
        >
          <Animated.View
            style={[
              styles.fabGlowRing,
              { opacity: fabGlow },
            ]}
          />
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

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
  sectionTitleContainer: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
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
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    overflow: 'visible',
  },
  fabGlowRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 30,
  },
});
