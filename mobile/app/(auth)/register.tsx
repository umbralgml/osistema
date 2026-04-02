import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/config/theme';

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

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleObjective = (key: string) => {
    setForm((prev) => ({
      ...prev,
      objectives: prev.objectives.includes(key)
        ? prev.objectives.filter((o) => o !== key)
        : [...prev.objectives, key],
    }));
  };

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
    setStep(step + 1);
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
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>CRIAR CONTA</Text>
      <Text style={styles.stepText}>Passo {step} de 3</Text>
      <View style={styles.stepBar}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[styles.stepDot, s <= step && styles.stepDotActive]}
          />
        ))}
      </View>

      {step === 1 && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>DADOS DE ACESSO</Text>
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
          <Text style={styles.sectionTitle}>DADOS DO JOGADOR</Text>
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
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => setStep(1)}
            >
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
          <Text style={styles.sectionTitle}>SEUS OBJETIVOS</Text>
          <Text style={styles.hint}>
            Selecione as areas que deseja evoluir
          </Text>
          <View style={styles.chips}>
            {OBJECTIVES.map((obj) => (
              <TouchableOpacity
                key={obj.key}
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
            ))}
          </View>
          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => setStep(2)}
            >
              <Text style={styles.buttonSecondaryText}>VOLTAR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonFlex, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'CRIANDO...' : 'INICIAR JORNADA'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
        <Text style={styles.linkText}>
          Ja tem conta? <Text style={styles.link}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  },
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
