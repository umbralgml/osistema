import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { theme } from '../config/theme';
import { useHabitsStore } from '../store/habitsStore';
import { SystemText } from './SystemText';
import { sounds } from '../utils/sounds';

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORIES = [
  { value: 'FITNESS', label: 'Fitness' },
  { value: 'STUDY', label: 'Estudos' },
  { value: 'HEALTH', label: 'Saude' },
  { value: 'MENTAL', label: 'Mental' },
  { value: 'DISCIPLINE', label: 'Disciplina' },
  { value: 'CUSTOM', label: 'Outro' },
];

const FREQUENCIES = [
  { value: 'DAILY', label: 'Diario' },
  { value: 'WEEKLY', label: 'Semanal' },
];

const DIFFICULTIES = [
  { value: 'EASY', label: 'Rank F', color: theme.colors.xp },
  { value: 'MEDIUM', label: 'Rank D', color: theme.colors.accent },
  { value: 'HARD', label: 'Rank B', color: theme.colors.streak },
  { value: 'LEGENDARY', label: 'Rank S', color: theme.colors.danger },
];

export function CreateHabitModal({ visible, onClose, onCreated }: CreateHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FITNESS');
  const [frequency, setFrequency] = useState('DAILY');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const createHabit = useHabitsStore((s) => s.createHabit);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const submitPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Submit button pulse
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(submitPulse, {
            toValue: 1.03,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(submitPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      slideAnim.setValue(300);
      bgOpacity.setValue(0);
    }
  }, [visible]);

  const handleChipPress = (setter: (v: string) => void, value: string) => {
    sounds.tick();
    setter(value);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    sounds.systemAlert();
    setLoading(true);
    try {
      await createHabit({ name: name.trim(), description: description.trim(), category, frequency, difficulty });
      setName('');
      setDescription('');
      setCategory('FITNESS');
      setFrequency('DAILY');
      setDifficulty('MEDIUM');
      onCreated();
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message || 'Erro ao criar quest');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.overlay, { opacity: bgOpacity }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.container,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.header}>
              <SystemText
                text="NOVA QUEST"
                speed={40}
                style={styles.title}
                glowColor={theme.colors.primary}
              />
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeBtn}>X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              <Text style={styles.label}>NOME DA QUEST</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Treinar por 1 hora"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.label}>DESCRICAO (OPCIONAL)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva sua quest..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>CATEGORIA</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.chip, category === cat.value && styles.chipActive]}
                    onPress={() => handleChipPress(setCategory, cat.value)}
                  >
                    <Text
                      style={[styles.chipText, category === cat.value && styles.chipTextActive]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>FREQUENCIA</Text>
              <View style={styles.chipRow}>
                {FREQUENCIES.map((freq) => (
                  <TouchableOpacity
                    key={freq.value}
                    style={[styles.chip, frequency === freq.value && styles.chipActive]}
                    onPress={() => handleChipPress(setFrequency, freq.value)}
                  >
                    <Text
                      style={[styles.chipText, frequency === freq.value && styles.chipTextActive]}
                    >
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>DIFICULDADE</Text>
              <View style={styles.chipRow}>
                {DIFFICULTIES.map((diff) => (
                  <TouchableOpacity
                    key={diff.value}
                    style={[
                      styles.chip,
                      difficulty === diff.value && {
                        backgroundColor: diff.color + '30',
                        borderColor: diff.color,
                      },
                    ]}
                    onPress={() => handleChipPress(setDifficulty, diff.value)}
                  >
                    <Text
                      style={[styles.chipText, difficulty === diff.value && { color: diff.color }]}
                    >
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Animated.View style={{ transform: [{ scale: submitPulse }] }}>
                <TouchableOpacity
                  style={[styles.submitBtn, (!name.trim() || loading) && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!name.trim() || loading}
                >
                  <Text style={styles.submitBtnText}>
                    {loading ? 'CRIANDO...' : 'CRIAR QUEST'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.primary + '40',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  closeBtn: {
    color: theme.colors.textMuted,
    fontSize: 18,
    fontWeight: '700',
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 2,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: theme.colors.primary + '30',
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: theme.colors.primaryLight,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
