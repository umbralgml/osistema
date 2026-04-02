import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

interface GlowViewProps {
  color?: string;
  intensity?: number;
  pulsing?: boolean;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function GlowView({
  color = theme.colors.primary,
  intensity = 0.5,
  pulsing = true,
  children,
  style,
}: GlowViewProps) {
  const pulseAnim = useRef(new Animated.Value(intensity * 0.4)).current;

  useEffect(() => {
    if (!pulsing) {
      pulseAnim.setValue(intensity);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: intensity,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: intensity * 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulsing, intensity]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: pulseAnim as any,
          shadowRadius: 20 * intensity,
          elevation: 10 * intensity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
});
