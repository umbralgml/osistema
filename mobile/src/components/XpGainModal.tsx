import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../config/theme';

interface XpGainModalProps {
  xpEarned: number;
  leveledUp: boolean;
  newLevel: number;
  streakCount: number;
  onDismiss: () => void;
}

const { width, height } = Dimensions.get('window');

export function XpGainModal({
  xpEarned,
  leveledUp,
  newLevel,
  streakCount,
  onDismiss,
}: XpGainModalProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onDismiss();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        {leveledUp && (
          <>
            <Text style={styles.levelUpLabel}>LEVEL UP!</Text>
            <Text style={styles.levelUpValue}>Lv. {newLevel}</Text>
            <View style={styles.divider} />
          </>
        )}
        <Text style={styles.xpLabel}>+{xpEarned} XP</Text>
        {streakCount > 1 && (
          <Text style={styles.streakText}>
            Streak x{streakCount}
          </Text>
        )}
        <Text style={styles.flavorText}>
          {leveledUp ? 'Voce ficou mais forte!' : 'Quest completa!'}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 40,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  levelUpLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.levelUp,
    letterSpacing: 4,
    textShadowColor: theme.colors.levelUp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 4,
  },
  levelUpValue: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 8,
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: theme.colors.primary,
    marginVertical: 12,
    borderRadius: 1,
  },
  xpLabel: {
    fontSize: 42,
    fontWeight: '900',
    color: theme.colors.xp,
    textShadowColor: theme.colors.xp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.streak,
    marginTop: 8,
  },
  flavorText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
