import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { theme } from '../config/theme';
import { sounds } from '../utils/sounds';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle | TextStyle[];
  onComplete?: () => void;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  style,
  onComplete,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = Date.now();
    let lastSoundTime = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);

      setDisplayValue(current);

      if (Date.now() - lastSoundTime > 80 && progress < 1) {
        sounds.progressFill(progress);
        lastSoundTime = Date.now();
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <Text style={[{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }, style]}>
      {prefix}{displayValue}{suffix}
    </Text>
  );
}
