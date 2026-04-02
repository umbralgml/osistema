import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../config/theme';
import { sounds } from '../utils/sounds';

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
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const xpScale = useRef(new Animated.Value(2.0)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const streakOpacity = useRef(new Animated.Value(0)).current;
  const streakScale = useRef(new Animated.Value(0.5)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const levelUpScale = useRef(new Animated.Value(0.3)).current;
  const levelUpOpacity = useRef(new Animated.Value(0)).current;
  const levelNumOpacity = useRef(new Animated.Value(0)).current;
  const levelGlow = useRef(new Animated.Value(0)).current;
  const dismissOpacity = useRef(new Animated.Value(1)).current;
  const [showLevelNum, setShowLevelNum] = useState(false);
  const [levelDisplay, setLevelDisplay] = useState(0);

  useEffect(() => {
    // Play sound
    if (leveledUp) {
      sounds.levelUp();
    } else {
      sounds.xpGain();
    }

    // Phase 1: Background fades in
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Phase 2: XP slams in from scale 2.0 to 1.0
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(xpScale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(xpOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Phase 3: Streak
    if (streakCount > 1) {
      setTimeout(() => {
        sounds.streak();
        Animated.parallel([
          Animated.timing(streakOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(streakScale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
        ]).start();
      }, 700);
    }

    // Phase 4: Level up sequence
    if (leveledUp) {
      // White flash
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(flashOpacity, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(flashOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);

      // LEVEL UP text
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(levelUpScale, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(levelUpOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Glow pulse for level up
        Animated.loop(
          Animated.sequence([
            Animated.timing(levelGlow, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(levelGlow, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 1200);

      // Level number count up
      setTimeout(() => {
        setShowLevelNum(true);
        Animated.timing(levelNumOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Count up animation
        const startLevel = Math.max(newLevel - 1, 1);
        let current = startLevel;
        const countInterval = setInterval(() => {
          current++;
          setLevelDisplay(current);
          if (current >= newLevel) {
            clearInterval(countInterval);
          }
        }, 100);
      }, 1600);
    }

    // Phase 5: Auto-dismiss after 3 seconds
    const dismissTimer = setTimeout(() => {
      Animated.timing(dismissOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onDismiss();
      });
    }, 3000);

    return () => clearTimeout(dismissTimer);
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: Animated.multiply(bgOpacity, dismissOpacity) }]}>
      {/* Decorative lines */}
      <View style={styles.linesContainer}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.decorLine,
              {
                left: `${10 + i * 12}%`,
                height: 120 + Math.random() * 200,
                opacity: 0.06 + Math.random() * 0.08,
              },
            ]}
          />
        ))}
      </View>

      {/* White flash for level up */}
      <Animated.View style={[styles.flash, { opacity: flashOpacity }]} />

      {/* XP Text */}
      <Animated.View
        style={[
          styles.xpContainer,
          {
            opacity: xpOpacity,
            transform: [{ scale: xpScale }],
          },
        ]}
      >
        <Text style={styles.xpText}>+{xpEarned} XP</Text>
      </Animated.View>

      {/* Streak */}
      {streakCount > 1 && (
        <Animated.View
          style={[
            styles.streakContainer,
            {
              opacity: streakOpacity,
              transform: [{ scale: streakScale }],
            },
          ]}
        >
          <Text style={styles.streakText}>STREAK x{streakCount}</Text>
        </Animated.View>
      )}

      {/* Level Up */}
      {leveledUp && (
        <Animated.View
          style={[
            styles.levelUpContainer,
            {
              opacity: levelUpOpacity,
              transform: [{ scale: levelUpScale }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.levelUpText,
              {
                textShadowRadius: levelGlow.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [10, 40],
                }),
              },
            ]}
          >
            LEVEL UP!
          </Animated.Text>
          {showLevelNum && (
            <Animated.Text style={[styles.levelNum, { opacity: levelNumOpacity }]}>
              Lv. {levelDisplay || newLevel}
            </Animated.Text>
          )}
        </Animated.View>
      )}

      {/* Flavor text */}
      <View style={styles.flavorContainer}>
        <Text style={styles.flavorText}>
          {leveledUp ? 'Voce ficou mais forte!' : 'Quest completa!'}
        </Text>
      </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  linesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorLine: {
    position: 'absolute',
    bottom: 0,
    width: 1,
    backgroundColor: theme.colors.primary,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  xpContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  xpText: {
    fontSize: 56,
    fontWeight: '900',
    color: theme.colors.xp,
    textShadowColor: theme.colors.xp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    letterSpacing: 2,
  },
  streakContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.streak + '60',
  },
  streakText: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.streak,
    letterSpacing: 3,
    textShadowColor: theme.colors.streak,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  levelUpContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 42,
    fontWeight: '900',
    color: theme.colors.levelUp,
    letterSpacing: 6,
    textShadowColor: theme.colors.levelUp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  levelNum: {
    fontSize: 64,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: 8,
    textShadowColor: theme.colors.levelUp,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  flavorContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  flavorText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
});
