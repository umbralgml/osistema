import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/config/theme';
import { SystemText } from '../../src/components/SystemText';
import { sounds } from '../../src/utils/sounds';

const OBJECTIVES = [
  { key: 'fitness', label: 'Treino Fisico' },
  { key: 'study', label: 'Estudos' },
  { key: 'mental', label: 'Saude Mental' },
  { key: 'discipline', label: 'Disciplina' },
  { key: 'health', label: 'Saude' },
  { key: 'quit_addiction', label: 'Parar Vicios' },
];

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    phone: '',
    height: '',
    weight: '',
    age: '',
    objectives: [] as string[],
  });

  const stepFade = useRef(new Animated.Value(1)).current;
  const stepSlide = useRef(new Animated.Value(0)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const journeyPulse = useRef(new Animated.Value(1)).current;
  const objAnims = useRef(OBJECTIVES.map(() => new Animated.Value(0))).current;

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleObjective = (key: string) => {
    sounds.tick();
    setForm((prev) => ({
      ...prev,
      objectives: prev.objectives.includes(key)
        ? prev.objectives.filter((o) => o !== key)
        : [...prev.objectives, key],
    }));
  };

  // Step transition animation
  const animateStep = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(stepFade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(stepSlide, {
        toValue: nextStep > step ? -30 : 30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      stepSlide.setValue(nextStep > step ? 30 : -30);
      Animated.parallel([
        Animated.timing(stepFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(stepSlide, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Stagger objective chips on step 3
  useEffect(() => {
    if (step === 3) {
      objAnims.forEach((anim) => anim.setValue(0));
      OBJECTIVES.forEach((_, i) => {
        setTimeout(() => {
          Animated.spring(objAnims[i], {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }).start();
        }, i * 80);
      });

      // Journey button pulse
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(journeyPulse, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(journeyPulse, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [step]);

  const handleNext = () => {
    if (step === 1) {
      if (!form.username || !form.email || !form.password) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatorios');
        return;
      }
      if (form.password.length < 6) {
        Alert.alert('Erro', 'Senha deve ter no minimo 6 caracteres');
        return;
      }
    }
    sounds.tick();
    animateStep(step + 1);
  };

  const handleBack = () => {
    sounds.tick();
    animateStep(step - 1);
  };

  const handleRegister = async () => {
    if (form.objectives.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um objetivo');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        name: form.name || form.username,
        phone: form.phone || undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        age: form.age ? parseInt(form.age) : undefined,
        objectives: form.objectives,
      });
      sounds.systemBoot();
      setShowWelcome(true);
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 3500);
    } catch (err: any) {
      sounds.warning();
      Alert.alert('Erro', err?.response?.data?.message || 'Erro ao criar conta');
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Welcome overlay */}
      {showWelcome && (
        <Animated.View style={[styles.welcomeOverlay, { opacity: welcomeOpacity }]}>
          <SystemText
            text="PLAYER REGISTERED."
            speed={50}
            style={styles.welcomeText}
            glowColor={theme.colors.primary}
            onComplete={() => {}}
          />
          <View style={{ marginTop: 16 }}>
            <SystemText
              text="WELCOME TO THE SYSTEM."
              speed={50}
              style={styles.welcomeText}
              glowColor={theme.colors.xp}
            />
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SystemText
          text="CRIAR CONTA"
          speed={35}
          style={styles.title}
          glowColor={theme.colors.primary}
        />
        <Text style={styles.stepText}>Passo {step} de 3</Text>
        <View style={styles.stepBar}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.stepDot, s <= step && styles.stepDotActive]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: stepFade,
              transform: [{ translateX: stepSlide }],
            },
          ]}
        >
          {step === 1 && (
            <View style={styles.form}>
              <SystemText
                text="DADOS DE ACESSO"
                speed={30}
                style={styles.sectionTitle}
                glowColor={theme.colors.secondary}
              />
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="seu_nome_de_guerreiro"
                placeholderTextColor={theme.colors.textMuted}
                value={form.username}
                onChangeText={(v) => update('username', v)}
                autoCapitalize="none"
              />
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="email@exemplo.com"
                placeholderTextColor={theme.colors.textMuted}
                value={form.email}
                onChangeText={(v) => update('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.label}>SENHA</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 6 caracteres"
                placeholderTextColor={theme.colors.textMuted}
                value={form.password}
                onChangeText={(v) => update('password', v)}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>PROXIMO</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.form}>
              <SystemText
                text="DADOS DO JOGADOR"
                speed={30}
                style={styles.sectionTitle}
                glowColor={theme.colors.secondary}
              />
              <Text style={styles.label}>NOME COMPLETO</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={theme.colors.textMuted}
                value={form.name}
                onChangeText={(v) => update('name', v)}
              />
              <Text style={styles.label}>TELEFONE</Text>
              <TextInput
                style={styles.input}
                placeholder="(11) 99999-9999"
                placeholderTextColor={theme.colors.textMuted}
                value={form.phone}
                onChangeText={(v) => update('phone', v)}
                keyboardType="phone-pad"
              />
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>ALTURA (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="175"
                    placeholderTextColor={theme.colors.textMuted}
                    value={form.height}
                    onChangeText={(v) => update('height', v)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>PESO (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="70"
                    placeholderTextColor={theme.colors.textMuted}
                    value={form.weight}
                    onChangeText={(v) => update('weight', v)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <Text style={styles.label}>IDADE</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor={theme.colors.textMuted}
                value={form.age}
                onChangeText={(v) => update('age', v)}
                keyboardType="numeric"
              />
              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={handleBack}>
                  <Text style={styles.buttonSecondaryText}>VOLTAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonFlex} onPress={handleNext}>
                  <Text style={styles.buttonText}>PROXIMO</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.form}>
              <SystemText
                text="SEUS OBJETIVOS"
                speed={30}
                style={styles.sectionTitle}
                glowColor={theme.colors.secondary}
              />
              <Text style={styles.hint}>
                Selecione as areas que deseja evoluir
              </Text>
              <View style={styles.chips}>
                {OBJECTIVES.map((obj, i) => (
                  <Animated.View
                    key={obj.key}
                    style={{
                      opacity: objAnims[i],
                      transform: [
                        {
                          translateY: objAnims[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        form.objectives.includes(obj.key) && styles.chipActive,
                      ]}
                      onPress={() => toggleObjective(obj.key)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.objectives.includes(obj.key) && styles.chipTextActive,
                        ]}
                      >
                        {obj.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={handleBack}>
                  <Text style={styles.buttonSecondaryText}>VOLTAR</Text>
                </TouchableOpacity>
                <Animated.View style={[styles.buttonFlexWrapper, { transform: [{ scale: journeyPulse }] }]}>
                  <TouchableOpacity
                    style={[styles.buttonFlexEpic, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'CRIANDO...' : 'INICIAR JORNADA'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          )}
        </Animated.View>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={styles.linkText}>
            Ja tem conta? <Text style={styles.link}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    color: theme.colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.primary,
    textAlign: 'center',
    letterSpacing: 4,
  },
  stepText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
    letterSpacing: 1,
  },
  stepBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  stepDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  stepContainer: {},
  form: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 2,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    marginTop: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    fontSize: 15,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonFlex: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: 18,
    alignItems: 'center',
  },
  buttonFlexWrapper: {
    flex: 1,
  },
  buttonFlexEpic: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: 18,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonSecondary: {
    borderRadius: theme.borderRadius.md,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonSecondaryText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  linkText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  link: {
    color: theme.colors.primaryLight,
    fontWeight: '600',
  },
});
