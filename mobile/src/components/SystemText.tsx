import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, StyleSheet, View, TextStyle } from 'react-native';
import { theme } from '../config/theme';
import { sounds } from '../utils/sounds';

interface SystemTextProps {
  text: string;
  speed?: number;
  style?: TextStyle | TextStyle[];
  onComplete?: () => void;
  glowColor?: string;
}

export function SystemText({ text, speed = 30, style, onComplete, glowColor = theme.colors.secondary }: SystemTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const indexRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    indexRef.current = 0;
    completedRef.current = false;
    setDisplayedText('');
    setShowCursor(true);

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.substring(0, indexRef.current + 1));
        sounds.typeClick();
        indexRef.current++;
      } else {
        clearInterval(interval);
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(() => {
            setShowCursor(false);
            onComplete?.();
          }, 500);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          {
            textShadowColor: glowColor,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
          },
          style,
        ]}
      >
        {displayedText}
        {showCursor && (
          <Animated.Text
            style={[
              styles.cursor,
              { opacity: cursorOpacity, color: glowColor },
            ]}
          >
            |
          </Animated.Text>
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cursor: {
    fontSize: theme.fontSize.md,
    fontWeight: '300',
  },
});
