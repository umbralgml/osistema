import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/config/theme';
import { SystemText } from '../../src/components/SystemText';
import { AnimatedCounter } from '../../src/components/AnimatedCounter';
import { sounds } from '../../src/utils/sounds';

const OBJECTIVE_LABELS: Record<string, string> = {
  fitness: 'Treino Fisico',
  study: 'Estudos',
  mental: 'Saude Mental',
  discipline: 'Disciplina',
  health: 'Saude',
  quit_addiction: 'Parar Vicios',
};

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [loaded, setLoaded] = useState(false);

  // Animations
  const avatarRotate = useRef(new Animated.Value(0)).current;
  const avatarGlow = useRef(new Animated.Value(0.3)).current;
  const titlePulse = useRef(new Animated.Value(0.4)).current;
  const logoutGlow = useRef(new Animated.Value(0)).current;
  const objAnims = useRef<Animated.Value[]>([]).current;
  const statsAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    setLoaded(true);

    // Avatar rotating border glow
    Animated.loop(
      Animated.timing(avatarRotate, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();

    // Avatar glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarGlow, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(avatarGlow, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Title badge pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(titlePulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(titlePulse, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Stats cards stagger
    statsAnims.forEach((anim, i) => {
      setTimeout(() => {
        Animated.spring(anim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();
      }, 300 + i * 150);
    });
  }, []);

  // Objective tags stagger
  useEffect(() => {
    if (!user?.objectives) return;
    while (objAnims.length < user.objectives.length) {
      objAnims.push(new Animated.Value(0));
    }
    user.objectives.forEach((_, i) => {
      setTimeout(() => {
        if (objAnims[i]) {
          Animated.timing(objAnims[i], {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }
      }, 800 + i * 100);
    });
  }, [user?.objectives]);

  if (!user) return null;

  const handleLogout = () => {
    sounds.warning();
    Alert.alert('Sair', 'Deseja realmente sair do sistema?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const avatarSpin = avatarRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SystemText
        text="PERFIL"
        speed={40}
        style={styles.headerTitle}
        glowColor={theme.colors.text}
      />

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarOuter}>
          <Animated.View
            style={[
              styles.avatarGlowRing,
              {
                opacity: avatarGlow,
                transform: [{ rotate: avatarSpin }],
              },
            ]}
          />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.name || user.username).charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user.name || user.username}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Animated.View
          style={[
            styles.titleBadge,
            {
              shadowOpacity: titlePulse,
            },
          ]}
        >
          <Text style={styles.titleText}>{user.title}</Text>
        </Animated.View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[
          { value: user.level, label: 'LEVEL', color: theme.colors.primaryLight },
          { value: user.totalXp, label: 'TOTAL XP', color: theme.colors.primaryLight },
          { value: user.streak, label: 'STREAK', color: theme.colors.streak },
          { value: user.longestStreak || 0, label: 'RECORDE', color: theme.colors.primaryLight },
        ].map((stat, i) => (
          <Animated.View
            key={stat.label}
            style={[
              styles.statCard,
              {
                opacity: statsAnims[i],
                transform: [
                  {
                    scale: statsAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {loaded && (
              <AnimatedCounter
                value={stat.value}
                duration={1000}
                style={[styles.statValue, { color: stat.color }]}
              />
            )}
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Objectives */}
      {user.objectives && user.objectives.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBJETIVOS</Text>
          <View style={styles.tags}>
            {user.objectives.map((obj, i) => (
              <Animated.View
                key={obj}
                style={{
                  opacity: objAnims[i] || 1,
                  transform: [
                    {
                      translateY: (objAnims[i] || new Animated.Value(1)).interpolate({
                        inputRange: [0, 1],
                        outputRange: [15, 0],
                      }),
                    },
                  ],
                }}
              >
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {OBJECTIVE_LABELS[obj] || obj}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
      )}

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMACOES</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Email" value={user.email} />
          {user.phone && <InfoRow label="Telefone" value={user.phone} />}
          {user.age && <InfoRow label="Idade" value={`${user.age} anos`} />}
          {user.height && <InfoRow label="Altura" value={`${user.height} cm`} />}
          {user.weight && <InfoRow label="Peso" value={`${user.weight} kg`} />}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>SAIR DO SISTEMA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 3,
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarOuter: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarGlowRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopColor: theme.colors.primaryLight,
    borderRightColor: 'transparent',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
  },
  username: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  titleBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.accent + '20',
    borderWidth: 1,
    borderColor: theme.colors.accent + '40',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 4,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: theme.colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primaryLight,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryLight,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.danger,
    letterSpacing: 2,
    textShadowColor: theme.colors.danger,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
