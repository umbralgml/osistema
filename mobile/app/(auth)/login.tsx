import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/config/theme';
import { SystemText } from '../../src/components/SystemText';
import { sounds } from '../../src/utils/sounds';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showConnecting, setShowConnecting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const login = useAuthStore((s) => s.login);

  // Animation values
  const titleLetters = 'O SISTEMA'.split('');
  const letterAnims = useRef(titleLetters.map(() => new Animated.Value(0))).current;
  const titleGlow = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const scanLinePos = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const emailBorder = useRef(new Animated.Value(0)).current;
  const passwordBorder = useRef(new Animated.Value(0)).current;
  const connectingOpacity = useRef(new Animated.Value(0)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Letter-by-letter title fade in
    titleLetters.forEach((_, i) => {
      setTimeout(() => {
        Animated.timing(letterAnims[i], {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }, i * 100);
    });

    // Title glow pulse (starts after letters)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(titleGlow, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(titleGlow, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Divider expand
      Animated.timing(dividerWidth, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start();

      setShowSubtitle(true);
    }, titleLetters.length * 100 + 200);

    // Form fade in
    setTimeout(() => {
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, titleLetters.length * 100 + 1500);

    // Scan lines animation (looping)
    Animated.loop(
      Animated.timing(scanLinePos, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    // Button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Focus animations for inputs
  useEffect(() => {
    Animated.timing(emailBorder, {
      toValue: emailFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [emailFocused]);

  useEffect(() => {
    Animated.timing(passwordBorder, {
      toValue: passwordFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [passwordFocused]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      sounds.systemBoot();
      setShowConnecting(true);
      Animated.timing(connectingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 2000);
    } catch (err: any) {
      sounds.warning();
      Alert.alert('Erro', err?.response?.data?.message || 'Credenciais invalidas');
      setLoading(false);
    }
  };

  const emailBorderColor = emailBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  const passwordBorderColor = passwordBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  const scanTranslate = scanLinePos.interpolate({
    inputRange: [0, 1],
    outputRange: [-800, 800],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Scan lines overlay */}
      <View style={styles.scanLinesContainer}>
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanTranslate }] },
          ]}
        />
        {/* Static scan line texture */}
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.staticScanLine,
              { top: i * 20 },
            ]}
          />
        ))}
      </View>

      {/* Connecting overlay */}
      {showConnecting && (
        <Animated.View style={[styles.connectingOverlay, { opacity: connectingOpacity }]}>
          <SystemText
            text="CONNECTING TO THE SYSTEM..."
            speed={50}
            style={styles.connectingText}
            glowColor={theme.colors.primary}
          />
        </Animated.View>
      )}

      <View style={styles.inner}>
        {/* Title - letter by letter */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {titleLetters.map((letter, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.title,
                  {
                    opacity: letterAnims[i],
                    textShadowRadius: titleGlow.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [5, 25],
                    }),
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>

          {showSubtitle && (
            <View style={styles.subtitleContainer}>
              <SystemText
                text="Voce foi escolhido. Desperte."
                speed={40}
                style={styles.subtitle}
                glowColor={theme.colors.secondary}
              />
            </View>
          )}

          <Animated.View
            style={[
              styles.divider,
              {
                width: dividerWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 60],
                }),
              },
            ]}
          />
        </View>

        {/* Form */}
        <Animated.View style={[styles.form, { opacity: formOpacity }]}>
          <Text style={styles.label}>EMAIL</Text>
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                borderColor: emailBorderColor,
                shadowColor: emailFocused ? theme.colors.primary : 'transparent',
                shadowOpacity: emailFocused ? 0.4 : 0,
                shadowRadius: emailFocused ? 10 : 0,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </Animated.View>

          <Text style={styles.label}>SENHA</Text>
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                borderColor: passwordBorderColor,
                shadowColor: passwordFocused ? theme.colors.primary : 'transparent',
                shadowOpacity: passwordFocused ? 0.4 : 0,
                shadowRadius: passwordFocused ? 10 : 0,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>
              Novo jogador? <Text style={styles.link}>Criar conta</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scanLinesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1,
    pointerEvents: 'none',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.primary,
    opacity: 0.06,
  },
  staticScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.03)',
  },
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  connectingText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    color: theme.colors.primary,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  titleRow: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 6,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitleContainer: {
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
  },
  divider: {
    height: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    marginTop: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  linkText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  link: {
    color: theme.colors.primaryLight,
    fontWeight: '600',
  },
});
