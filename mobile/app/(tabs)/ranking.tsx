import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { theme } from '../../src/config/theme';
import api from '../../src/config/api';
import { useAuthStore } from '../../src/store/authStore';

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
  const user = useAuthStore((s) => s.user);

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
    loadRanking();
  }, []);

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
      <Text style={styles.title}>RANKING GLOBAL</Text>
      {myRank && (
        <Text style={styles.myRank}>
          Sua posicao: #{myRank}
        </Text>
      )}

      <View style={styles.list}>
        {ranking.map((entry, index) => {
          const rank = index + 1;
          const isMe = entry.id === user?.id;
          return (
            <View
              key={entry.id}
              style={[
                styles.rankRow,
                isMe && styles.rankRowMe,
                rank <= 3 && styles.rankRowTop,
              ]}
            >
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
            </View>
          );
        })}

        {ranking.length === 0 && (
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
  },
  list: {
    gap: 8,
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
  },
  rankRowMe: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceLight,
  },
  rankRowTop: {
    borderColor: theme.colors.accent + '40',
  },
  rankPosition: {
    width: 36,
    alignItems: 'center',
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
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  rankNameMe: {
    color: theme.colors.primaryLight,
  },
  rankTitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rankStats: {
    alignItems: 'flex-end',
  },
  rankLevel: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.levelUp,
  },
  rankXp: {
    fontSize: 11,
    color: theme.colors.xp,
    marginTop: 2,
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
