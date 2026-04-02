import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Web Audio API synth sounds - no external files needed
class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext | null {
    if (Platform.OS !== 'web') return null;
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch { return null; }
    }
    return this.audioContext;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15, delay = 0) {
    const ctx = this.getContext();
    if (!ctx || !this.enabled) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }

  // UI click - quick subtle tick
  tick() {
    this.playTone(800, 0.06, 'square', 0.06);
  }

  // XP gain - ascending sparkle
  xpGain() {
    this.playTone(523, 0.12, 'sine', 0.12, 0);
    this.playTone(659, 0.12, 'sine', 0.12, 0.08);
    this.playTone(784, 0.15, 'sine', 0.15, 0.16);
    this.playTone(1047, 0.2, 'sine', 0.1, 0.24);
  }

  // Level up - epic ascending fanfare
  levelUp() {
    this.playTone(523, 0.15, 'sine', 0.15, 0);
    this.playTone(659, 0.15, 'sine', 0.15, 0.12);
    this.playTone(784, 0.15, 'sine', 0.18, 0.24);
    this.playTone(1047, 0.3, 'sine', 0.2, 0.36);
    // Power chord
    this.playTone(523, 0.4, 'sawtooth', 0.06, 0.5);
    this.playTone(659, 0.4, 'sawtooth', 0.06, 0.5);
    this.playTone(784, 0.4, 'sawtooth', 0.06, 0.5);
    this.playTone(1047, 0.5, 'sine', 0.12, 0.5);
  }

  // Habit complete - satisfying confirmation
  habitComplete() {
    this.playTone(440, 0.08, 'sine', 0.1, 0);
    this.playTone(554, 0.08, 'sine', 0.12, 0.06);
    this.playTone(659, 0.15, 'sine', 0.15, 0.12);
  }

  // System alert - ominous notification
  systemAlert() {
    this.playTone(220, 0.3, 'sawtooth', 0.08, 0);
    this.playTone(277, 0.3, 'sawtooth', 0.08, 0.15);
    this.playTone(330, 0.4, 'sine', 0.1, 0.3);
  }

  // Progress bar filling - rising hum
  progressFill(progress: number) {
    const freq = 200 + (progress * 600);
    this.playTone(freq, 0.08, 'sine', 0.05);
  }

  // Streak sound - fire crackling ascending
  streak() {
    for (let i = 0; i < 5; i++) {
      this.playTone(300 + (i * 80), 0.06, 'sawtooth', 0.04, i * 0.04);
    }
    this.playTone(700, 0.2, 'sine', 0.1, 0.2);
  }

  // Error / penalty warning
  warning() {
    this.playTone(200, 0.2, 'square', 0.08, 0);
    this.playTone(150, 0.3, 'square', 0.08, 0.15);
  }

  // System boot / login
  systemBoot() {
    this.playTone(130, 0.3, 'sawtooth', 0.06, 0);
    this.playTone(165, 0.3, 'sawtooth', 0.06, 0.2);
    this.playTone(196, 0.3, 'sawtooth', 0.06, 0.4);
    this.playTone(262, 0.5, 'sine', 0.1, 0.6);
    this.playTone(330, 0.5, 'sine', 0.08, 0.6);
    this.playTone(392, 0.6, 'sine', 0.12, 0.8);
  }

  // Typewriter effect for system messages
  typeClick() {
    this.playTone(1200 + Math.random() * 400, 0.03, 'square', 0.03);
  }
}

export const sounds = new SoundEngine();
