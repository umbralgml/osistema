import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useHabitsStore } from '../../src/store/habitsStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { SystemText } from '../../src/components/SystemText';
import { AnimatedCounter } from '../../src/components/AnimatedCounter';
import { GlowView } from '../../src/components/GlowView';
import { theme } from '../../src/config/theme';
import { sounds } from '../../src/utils/sounds';
import api from '../../src/config/api';

export default function DashboardScreen() {
  const { user, refreshProfile } = useAuthStore();
  const { habits, todayStatus, fetchHabits, fetchTodayStatus } = useHabitsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [xpHistory, setXpHistory] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  // Stagger animations
  const levelCardOpacity = useRef(new Animated.Value(0)).current;
  const levelCardSlide = useRef(new Animated.Value(30)).current;
  const streakOpacity = useRef(new Animated.Value(0)).current;
  const streakSlide = useRef(new Animated.Value(30)).current;
  const streakGlow = useRef(new Animated.Value(0.3)).current;
  const attrOpacity = useRef(new Animated.Value(0)).current;
  const attrSlide = useRef(new Animated.Value(30)).current;
  const todayOpacity = useRef(new Animated.Value(0)).current;
  const todaySlide = useRef(new Animated.Value(30)).current;
  const xpHistOpacity = useRef(new Animated.Value(0)).current;
  const refreshTextOpacity = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    await Promise.all([
      refreshProfile(),
      fetchHabits(),
      fetchTodayStatus(),
      api.get('/xp/history').then((r) => setXpHistory(r.data)).catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    loadData().then(() => {
      setLoaded(true);
      setShowTitle(true);
    });
  }, []);

  // Stagger entrance sequence after loaded
  useEffect(() => {
    if (!loaded) return;

    // Title types, then stagger cards
    const baseDelay = 800; // after title types

    // Level card
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(levelCardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(levelCardSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, baseDelay);

    // Streak
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(streakOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(streakSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
      // Streak flame pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(streakGlow, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(streakGlow, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }, baseDelay + 300);

    // Attributes
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(attrOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(attrSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, baseDelay + 600);

    // Today progress
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(todayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(todaySlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, baseDelay + 900);

    // XP history
    setTimeout(() => {
      Animated.timing(xpHistOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, baseDelay + 1200);
  }, [loaded]);

  const onRefresh = async () => {
    setRefreshing(true);
    Animated.timing(refreshTextOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    await loadData();
    Animated.timing(refreshTextOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
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
      {/* Refresh text */}
      <Animated.View style={[styles.refreshBanner, { opacity: refreshTextOpacity }]}>
        <Text style={styles.refreshText}>ATUALIZANDO DADOS DO SISTEMA...</Text>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        {showTitle && (
          <SystemText
            text="STATUS DO JOGADOR"
            speed={35}
            style={styles.greeting}
            glowColor={theme.colors.secondary}
          />
        )}
        <Text style={styles.playerName}>{user.name || user.username}</Text>
        <Text style={styles.titleBadge}>{user.title}</Text>
      </View>

      {/* Level Card */}
      <Animated.View style={{ opacity: levelCardOpacity, transform: [{ translateY: levelCardSlide }] }}>
        <GlowView color={theme.colors.levelUp} intensity={0.3} pulsing style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.levelRow}>
              <View>
                <Text style={styles.levelLabel}>LEVEL</Text>
                {loaded && (
                  <AnimatedCounter
                    value={user.level}
                    duration={1200}
                    style={styles.levelNumber}
                  />
                )}
              </View>
              <View style={styles.xpInfo}>
                <Text style={styles.xpText}>
                  {user.currentXp} / {xpForNext} XP
                </Text>
              </View>
            </View>
            <ProgressBar value={xpProgress} color={theme.colors.xp} height={8} showGlow />
            <Text style={styles.totalXp}>Total: {user.totalXp} XP</Text>
          </View>
        </GlowView>
      </Animated.View>

      {/* Streak */}
      <Animated.View style={{ opacity: streakOpacity, transform: [{ translateY: streakSlide }] }}>
        <View style={styles.streakCard}>
          <Animated.View style={[styles.streakIconContainer, { opacity: streakGlow }]}>
            <Text style={styles.streakIcon}>&#x1F525;</Text>
          </Animated.View>
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
      </Animated.View>

      {/* Attributes */}
      <Animated.View style={{ opacity: attrOpacity, transform: [{ translateY: attrSlide }] }}>
        <GlowView color={theme.colors.primary} intensity={0.2} pulsing={false} style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>ATRIBUTOS</Text>
            <View style={styles.attrRow}>
              <Text style={[styles.attrLabel, { color: theme.colors.strength }]}>FOR</Text>
              <View style={styles.attrBarContainer}>
                <ProgressBar
                  value={loaded ? Math.min(getAttr('STRENGTH') / 100, 1) : 0}
                  color={theme.colors.strength}
                  height={6}
                  showGlow
                />
              </View>
              <Text style={styles.attrValue}>{getAttr('STRENGTH')}</Text>
            </View>
            <View style={styles.attrRow}>
              <Text style={[styles.attrLabel, { color: theme.colors.intelligence }]}>INT</Text>
              <View style={styles.attrBarContainer}>
                <ProgressBar
                  value={loaded ? Math.min(getAttr('INTELLIGENCE') / 100, 1) : 0}
                  color={theme.colors.intelligence}
                  height={6}
                  showGlow
                />
              </View>
              <Text style={styles.attrValue}>{getAttr('INTELLIGENCE')}</Text>
            </View>
            <View style={styles.attrRow}>
              <Text style={[styles.attrLabel, { color: theme.colors.discipline }]}>DIS</Text>
              <View style={styles.attrBarContainer}>
                <ProgressBar
                  value={loaded ? Math.min(getAttr('DISCIPLINE') / 100, 1) : 0}
                  color={theme.colors.discipline}
                  height={6}
                  showGlow
                />
              </View>
              <Text style={styles.attrValue}>{getAttr('DISCIPLINE')}</Text>
            </View>
          </View>
        </GlowView>
      </Animated.View>

      {/* Today Progress */}
      <Animated.View style={{ opacity: todayOpacity, transform: [{ translateY: todaySlide }] }}>
        <GlowView color={theme.colors.secondary} intensity={0.2} pulsing={false} style={styles.card}>
          <View style={styles.cardInner}>
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
              showGlow
            />
          </View>
        </GlowView>
      </Animated.View>

      {/* Recent XP */}
      {xpHistory.length > 0 && (
        <Animated.View style={{ opacity: xpHistOpacity }}>
          <View style={styles.xpCard}>
            <Text style={styles.sectionTitle}>XP RECENTE</Text>
            {xpHistory.slice(0, 5).map((log: any, i: number) => (
              <View key={log.id || i} style={styles.xpLogRow}>
                <Text style={styles.xpLogAmount}>+{log.amount} XP</Text>
                <Text style={styles.xpLogSource}>{log.description || log.source}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
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
  refreshBanner: {
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
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
    marginTop: 8,
  },
  titleBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accent,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: theme.colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  card: {
    marginBottom: 16,
  },
  cardInner: {
    padding: 20,
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
    textShadowColor: theme.colors.levelUp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  xpInfo: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.xp,
    textShadowColor: theme.colors.xp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
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
    borderColor: theme.colors.streak + '30',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: theme.colors.streak,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  streakIconContainer: {},
  streakIcon: {
    fontSize: 32,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.streak,
    textShadowColor: theme.colors.streak,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
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
    textShadowColor: theme.colors.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  todayLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  xpCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    textShadowColor: theme.colors.xp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  xpLogSource: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
