import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { theme } from '../config/theme';
import { sounds } from '../utils/sounds';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
  showGlow?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  value,
  color = theme.colors.xp,
  height = 8,
  backgroundColor = theme.colors.surfaceLight,
  showGlow = true,
  animated = true,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const shinePosition = useRef(new Animated.Value(-1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const prevValueRef = useRef(0);

  useEffect(() => {
    const clampedValue = Math.min(Math.max(value, 0), 1);

    if (!animated) {
      animatedWidth.setValue(clampedValue);
      return;
    }

    const duration = 800;
    let soundInterval: any = null;

    if (clampedValue > prevValueRef.current) {
      let soundProgress = prevValueRef.current;
      const step = (clampedValue - prevValueRef.current) / (duration / 100);
      soundInterval = setInterval(() => {
        soundProgress += step;
        if (soundProgress <= clampedValue) {
          sounds.progressFill(soundProgress);
        } else {
          clearInterval(soundInterval);
        }
      }, 100);
    }

    Animated.timing(animatedWidth, {
      toValue: clampedValue,
      duration,
      useNativeDriver: false,
    }).start(() => {
      if (soundInterval) clearInterval(soundInterval);
    });

    // Shine sweep effect
    shinePosition.setValue(0);
    Animated.timing(shinePosition, {
      toValue: 1,
      duration: duration + 200,
      useNativeDriver: false,
    }).start();

    prevValueRef.current = clampedValue;
  }, [value, animated]);

  // Glow pulse
  useEffect(() => {
    if (!showGlow) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [showGlow]);

  const fillWidth = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shineLeft = shinePosition.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { height, backgroundColor, borderRadius: height / 2 }]}>
      {/* Fill bar */}
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color,
            borderRadius: height / 2,
            width: fillWidth,
          },
        ]}
      />

      {/* Glowing leading edge */}
      {showGlow && (
        <Animated.View
          style={[
            styles.leadingEdge,
            {
              height,
              left: fillWidth,
              opacity: glowOpacity,
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 8,
              borderRadius: height / 2,
            },
          ]}
        />
      )}

      {/* Shine sweep */}
      <Animated.View
        style={[
          styles.shine,
          {
            height,
            left: shineLeft,
            borderRadius: height / 2,
          },
        ]}
      />

      {/* Ambient glow overlay */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glowOverlay,
            {
              backgroundColor: color,
              borderRadius: height / 2,
              opacity: glowOpacity.interpolate({
                inputRange: [0.2, 0.7],
                outputRange: [0.05, 0.15],
              }),
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  leadingEdge: {
    position: 'absolute',
    top: 0,
    width: 4,
    marginLeft: -2,
  },
  shine: {
    position: 'absolute',
    top: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  glowOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
});
