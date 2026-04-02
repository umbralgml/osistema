import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { theme } from '../../src/config/theme';
import api from '../../src/config/api';
import { useAuthStore } from '../../src/store/authStore';
import { SystemText } from '../../src/components/SystemText';

interface RankEntry {
  id: string;
  username: string;
  name: string;
  level: number;
  totalXp: number;
  title: string;
}

export default function RankingScreen() {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const user = useAuthStore((s) => s.user);

  const rowAnims = useRef<Animated.Value[]>([]).current;
  const rowSlides = useRef<Animated.Value[]>([]).current;

  const loadRanking = useCallback(async () => {
    try {
      const [rankRes, myRankRes] = await Promise.all([
        api.get('/ranking?limit=50'),
        api.get('/ranking/me'),
      ]);
      setRanking(rankRes.data);
      setMyRank(myRankRes.data.rank);
    } catch {}
  }, []);

  useEffect(() => {
    loadRanking().then(() => {
      setLoaded(true);
      setShowTitle(true);
    });
  }, []);

  // Stagger row animations when loaded
  useEffect(() => {
    if (!loaded || ranking.length === 0) return;

    // Initialize anims for each row
    while (rowAnims.length < ranking.length) {
      rowAnims.push(new Animated.Value(0));
      rowSlides.push(new Animated.Value(40));
    }

    ranking.forEach((_, i) => {
      setTimeout(() => {
        if (rowAnims[i]) {
          Animated.parallel([
            Animated.timing(rowAnims[i], {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(rowSlides[i], {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }, 600 + i * 60);
    });
  }, [loaded, ranking.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRanking();
    setRefreshing(false);
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return theme.colors.textMuted;
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '\u{1F947}';
    if (rank === 2) return '\u{1F948}';
    if (rank === 3) return '\u{1F949}';
    return `#${rank}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {showTitle && (
        <SystemText
          text="RANKING GLOBAL"
          speed={35}
          style={styles.title}
          glowColor={theme.colors.text}
        />
      )}
      {myRank && (
        <Text style={styles.myRank}>
          Sua posicao: #{myRank}
        </Text>
      )}

      <View style={styles.list}>
        {ranking.map((entry, index) => {
          const rank = index + 1;
          const isMe = entry.id === user?.id;
          const medalColor = getMedalColor(rank);
          const animOpacity = rowAnims[index] || new Animated.Value(1);
          const animSlide = rowSlides[index] || new Animated.Value(0);

          return (
            <Animated.View
              key={entry.id}
              style={[
                styles.rankRow,
                isMe && styles.rankRowMe,
                rank <= 3 && [styles.rankRowTop, { borderColor: medalColor + '50' }],
                {
                  opacity: animOpacity,
                  transform: [{ translateY: animSlide }],
                },
              ]}
            >
              {/* Top 3 glow */}
              {rank <= 3 && (
                <View
                  style={[
                    styles.topGlow,
                    {
                      shadowColor: medalColor,
                      borderColor: medalColor + '30',
                    },
                  ]}
                />
              )}

              {/* Me glow */}
              {isMe && (
                <View style={styles.meGlow} />
              )}

              <View style={styles.rankPosition}>
                <Text
                  style={[
                    styles.rankNumber,
                    { color: getMedalColor(rank) },
                    rank <= 3 && styles.rankNumberTop,
                  ]}
                >
                  {getMedalEmoji(rank)}
                </Text>
              </View>

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(entry.name || entry.username).charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.rankInfo}>
                <Text style={[styles.rankName, isMe && styles.rankNameMe]}>
                  {entry.username}
                  {isMe ? ' (voce)' : ''}
                </Text>
                <Text style={styles.rankTitle}>{entry.title}</Text>
              </View>

              <View style={styles.rankStats}>
                <Text style={styles.rankLevel}>Lv.{entry.level}</Text>
                <Text style={styles.rankXp}>{entry.totalXp} XP</Text>
              </View>
            </Animated.View>
          );
        })}

        {ranking.length === 0 && loaded && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum jogador no ranking ainda</Text>
          </View>
        )}
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 3,
  },
  myRank: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 24,
    textShadowColor: theme.colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  list: {
    gap: 8,
    marginTop: 16,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  rankRowMe: {
    borderColor: theme.colors.primary + '60',
    backgroundColor: theme.colors.surfaceLight,
  },
  rankRowTop: {
    borderWidth: 1,
  },
  topGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.borderRadius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
  },
  meGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  rankPosition: {
    width: 36,
    alignItems: 'center',
    zIndex: 1,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  rankNumberTop: {
    fontSize: 22,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  rankInfo: {
    flex: 1,
    zIndex: 1,
  },
  rankName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  rankNameMe: {
    color: theme.colors.primaryLight,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  rankTitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rankStats: {
    alignItems: 'flex-end',
    zIndex: 1,
  },
  rankLevel: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.levelUp,
    textShadowColor: theme.colors.levelUp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  rankXp: {
    fontSize: 11,
    color: theme.colors.xp,
    marginTop: 2,
    textShadowColor: theme.colors.xp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
