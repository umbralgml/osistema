import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { SystemText } from '../src/components/SystemText';
import { theme } from '../src/config/theme';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  const orbScale = useRef(new Animated.Value(0.8)).current;
  const orbOpacity = useRef(new Animated.Value(0.3)).current;
  const orbGlow = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Pulsing orb animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbScale, {
            toValue: 1.2,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(orbOpacity, {
            toValue: 0.7,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(orbGlow, {
            toValue: 0.8,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orbScale, {
            toValue: 0.8,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(orbOpacity, {
            toValue: 0.3,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(orbGlow, {
            toValue: 0.2,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  if (!isLoading) {
    return isAuthenticated ? <Redirect href="/(tabs)/dashboard" /> : <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      {/* Pulsing orb */}
      <Animated.View
        style={[
          styles.orb,
          {
            transform: [{ scale: orbScale }],
            opacity: orbOpacity,
            shadowOpacity: orbGlow,
          },
        ]}
      />

      {/* Inner orb core */}
      <Animated.View
        style={[
          styles.orbCore,
          {
            transform: [{ scale: orbScale }],
          },
        ]}
      />

      {/* Text below orb */}
      <View style={styles.textContainer}>
        <SystemText
          text="INICIANDO O SISTEMA..."
          speed={50}
          style={styles.loadingText}
          glowColor={theme.colors.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  orb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '20',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 10,
    position: 'absolute',
  },
  orbCore: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    bottom: '30%',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
    color: theme.colors.primary,
  },
});
