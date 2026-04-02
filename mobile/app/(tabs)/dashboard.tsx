import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useHabitsStore } from '../../src/store/habitsStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { theme } from '../../src/config/theme';
import api from '../../src/config/api';

export default function DashboardScreen() {
  const { user, refreshProfile } = useAuthStore();
  const { habits, todayStatus, fetchHabits, fetchTodayStatus } = useHabitsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [xpHistory, setXpHistory] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    await Promise.all([
      refreshProfile(),
      fetchHabits(),
      fetchTodayStatus(),
      api.get('/xp/history').then((r) => setXpHistory(r.data)).catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!user) return null;

  const xpForNext = Math.floor(100 * Math.pow(user.level, 1.5));
  const xpProgress = xpForNext > 0 ? user.currentXp / xpForNext : 0;
  const completedToday = Object.keys(todayStatus).length;
  const totalHabits = habits.length;

  const attributes = user.attributes || [];
  const getAttr = (type: string) =>
    attributes.find((a) => a.type === type)?.value || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>STATUS DO JOGADOR</Text>
        <Text style={styles.playerName}>{user.name || user.username}</Text>
        <Text style={styles.titleBadge}>{user.title}</Text>
      </View>

      {/* Level Card */}
      <View style={styles.card}>
        <View style={styles.levelRow}>
          <View>
            <Text style={styles.levelLabel}>LEVEL</Text>
            <Text style={styles.levelNumber}>{user.level}</Text>
          </View>
          <View style={styles.xpInfo}>
            <Text style={styles.xpText}>
              {user.currentXp} / {xpForNext} XP
            </Text>
          </View>
        </View>
        <ProgressBar value={xpProgress} color={theme.colors.xp} height={8} />
        <Text style={styles.totalXp}>Total: {user.totalXp} XP</Text>
      </View>

      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakIcon}>&#x1F525;</Text>
        <View>
          <Text style={styles.streakNumber}>{user.streak} dias</Text>
          <Text style={styles.streakLabel}>STREAK ATUAL</Text>
        </View>
        <View style={styles.streakDivider} />
        <View>
          <Text style={styles.streakNumber}>{user.longestStreak} dias</Text>
          <Text style={styles.streakLabel}>RECORDE</Text>
        </View>
      </View>

      {/* Attributes */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ATRIBUTOS</Text>
        <View style={styles.attrRow}>
          <Text style={[styles.attrLabel, { color: theme.colors.strength }]}>
            FOR
          </Text>
          <View style={styles.attrBarContainer}>
            <ProgressBar
              value={Math.min(getAttr('STRENGTH') / 100, 1)}
              color={theme.colors.strength}
              height={6}
            />
          </View>
          <Text style={styles.attrValue}>{getAttr('STRENGTH')}</Text>
        </View>
        <View style={styles.attrRow}>
          <Text style={[styles.attrLabel, { color: theme.colors.intelligence }]}>
            INT
          </Text>
          <View style={styles.attrBarContainer}>
            <ProgressBar
              value={Math.min(getAttr('INTELLIGENCE') / 100, 1)}
              color={theme.colors.intelligence}
              height={6}
            />
          </View>
          <Text style={styles.attrValue}>{getAttr('INTELLIGENCE')}</Text>
        </View>
        <View style={styles.attrRow}>
          <Text style={[styles.attrLabel, { color: theme.colors.discipline }]}>
            DIS
          </Text>
          <View style={styles.attrBarContainer}>
            <ProgressBar
              value={Math.min(getAttr('DISCIPLINE') / 100, 1)}
              color={theme.colors.discipline}
              height={6}
            />
          </View>
          <Text style={styles.attrValue}>{getAttr('DISCIPLINE')}</Text>
        </View>
      </View>

      {/* Today Progress */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>MISSOES DE HOJE</Text>
        <View style={styles.todayRow}>
          <Text style={styles.todayCount}>
            {completedToday}/{totalHabits}
          </Text>
          <Text style={styles.todayLabel}>concluidas</Text>
        </View>
        <ProgressBar
          value={totalHabits > 0 ? completedToday / totalHabits : 0}
          color={theme.colors.secondary}
          height={6}
        />
      </View>

      {/* Recent XP */}
      {xpHistory.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>XP RECENTE</Text>
          {xpHistory.slice(0, 5).map((log: any, i: number) => (
            <View key={log.id || i} style={styles.xpLogRow}>
              <Text style={styles.xpLogAmount}>+{log.amount} XP</Text>
              <Text style={styles.xpLogSource}>{log.description || log.source}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
    paddingBottom: 30,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 3,
  },
  playerName: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: 4,
  },
  titleBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accent,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 2,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.levelUp,
    lineHeight: 52,
  },
  xpInfo: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.xp,
  },
  totalXp: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'right',
  },
  streakCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakIcon: {
    fontSize: 32,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.streak,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  attrLabel: {
    fontSize: 13,
    fontWeight: '900',
    width: 32,
  },
  attrBarContainer: {
    flex: 1,
  },
  attrValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    width: 36,
    textAlign: 'right',
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  todayCount: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.secondary,
  },
  todayLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  xpLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  xpLogAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.xp,
  },
  xpLogSource: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
