import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/config/theme';

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

  if (!user) return null;

  const handleLogout = () => {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>PERFIL</Text>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.name || user.username).charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.name || user.username}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>{user.title}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.level}</Text>
          <Text style={styles.statLabel}>LEVEL</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.totalXp}</Text>
          <Text style={styles.statLabel}>TOTAL XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.streak }]}>{user.streak}</Text>
          <Text style={styles.statLabel}>STREAK</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.longestStreak || 0}</Text>
          <Text style={styles.statLabel}>RECORDE</Text>
        </View>
      </View>

      {/* Objectives */}
      {user.objectives && user.objectives.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBJETIVOS</Text>
          <View style={styles.tags}>
            {user.objectives.map((obj) => (
              <View key={obj} style={styles.tag}>
                <Text style={styles.tagText}>
                  {OBJECTIVE_LABELS[obj] || obj}
                </Text>
              </View>
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
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  },
  titleText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.danger,
    letterSpacing: 2,
  },
});
