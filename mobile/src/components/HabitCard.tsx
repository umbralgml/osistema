import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { theme } from '../config/theme';
import { sounds } from '../utils/sounds';

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
  delay?: number;
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

export function HabitCard({ habit, completed, onComplete, delay = 0 }: HabitCardProps) {
  const catColor = categoryColors[habit.category] || categoryColors.default;
  const diffLabel = difficultyLabels[habit.difficulty] || habit.difficulty;
  const diffColor = difficultyColors[habit.difficulty] || theme.colors.textMuted;

  const stripeGlow = useRef(new Animated.Value(0.4)).current;
  const cardFlash = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const xpFloat = useRef(new Animated.Value(0)).current;
  const xpFadeOut = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(60)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Slide in animation
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideIn, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Stripe pulse
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(stripeGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(stripeGlow, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePress = () => {
    sounds.tick();
  };

  const handleComplete = () => {
    if (completed) return;
    sounds.habitComplete();
    setJustCompleted(true);

    // Card flash
    Animated.sequence([
      Animated.timing(cardFlash, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardFlash, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple from check button
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.6);
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 3,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // XP float animation
    setShowXpFloat(true);
    xpFloat.setValue(0);
    xpFadeOut.setValue(1);
    Animated.parallel([
      Animated.timing(xpFloat, {
        toValue: -50,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(xpFadeOut, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowXpFloat(false);
    });

    onComplete();
  };

  const isCompleted = completed || justCompleted;

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          transform: [{ translateX: slideIn }],
          opacity: fadeIn,
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <View
          style={[
            styles.card,
            isCompleted && styles.cardCompleted,
          ]}
        >
          {/* Flash overlay */}
          <Animated.View
            style={[
              styles.flashOverlay,
              {
                opacity: cardFlash,
                backgroundColor: catColor,
              },
            ]}
          />

          {/* Green glow border for completed */}
          {isCompleted && <View style={styles.completedGlowBorder} />}

          {/* Category stripe with glow */}
          <Animated.View
            style={[
              styles.categoryStripe,
              {
                backgroundColor: catColor,
                opacity: stripeGlow,
                shadowColor: catColor,
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 6,
              },
            ]}
          />

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={[styles.name, isCompleted && styles.nameCompleted]} numberOfLines={1}>
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

          {/* Complete button with ripple */}
          <View style={styles.completeBtnWrapper}>
            {/* Ripple effect */}
            <Animated.View
              style={[
                styles.ripple,
                {
                  backgroundColor: theme.colors.xp,
                  opacity: rippleOpacity,
                  transform: [{ scale: rippleScale }],
                },
              ]}
            />
            <TouchableOpacity
              style={[styles.completeBtn, isCompleted && styles.completeBtnDone]}
              onPress={handleComplete}
              disabled={isCompleted}
              activeOpacity={0.7}
            >
              {isCompleted ? (
                <Text style={styles.checkmark}>&#10003;</Text>
              ) : (
                <Text style={styles.completeIcon}>&#9876;</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Floating XP text */}
          {showXpFloat && (
            <Animated.View
              style={[
                styles.xpFloatContainer,
                {
                  transform: [{ translateY: xpFloat }],
                  opacity: xpFadeOut,
                },
              ]}
            >
              <Text style={styles.xpFloatText}>+{habit.xpReward} XP</Text>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  cardCompleted: {
    borderColor: theme.colors.xp + '40',
  },
  completedGlowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.xp + '30',
    shadowColor: theme.colors.xp,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 0,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    borderRadius: theme.borderRadius.md,
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
  completeBtnWrapper: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  completeBtn: {
    width: 56,
    height: '100%',
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
  xpFloatContainer: {
    position: 'absolute',
    top: 0,
    right: 70,
    zIndex: 10,
  },
  xpFloatText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.xp,
    textShadowColor: theme.colors.xp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
