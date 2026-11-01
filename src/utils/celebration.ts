import confetti from 'canvas-confetti';

// Web Audio API Synthesizer for celebration chimes
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a pleasant rising two-tone chime for unlocking a tier
  public playTierChime(tier: 1 | 2 | 3) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const frequencies = tier === 1
        ? [523.25, 659.25] // C5 -> E5 (friendly chime)
        : tier === 2
        ? [587.33, 783.99] // D5 -> G5 (exciting chime)
        : [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6 (VIP major arpeggio)

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.5);
      });
    } catch {
      // AudioContext policy or unsupported
    }
  }
}

export const soundEffects = new SoundEffects();

/**
 * Triggers confetti celebration tailored to milestone tier
 */
export function fireMilestoneConfetti(tier: 1 | 2 | 3) {
  soundEffects.playTierChime(tier);

  if (typeof window === 'undefined') return;

  if (tier === 1) {
    // Tier 1: Crisp burst from bottom right
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.85, y: 0.8 },
      colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
      disableForReducedMotion: true,
    });
  } else if (tier === 2) {
    // Tier 2: Double burst from sides
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.65, y: 0.7 },
      colors: ['#059669', '#3b82f6', '#f59e0b', '#ec4899'],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.95, y: 0.7 },
      colors: ['#059669', '#3b82f6', '#f59e0b', '#ec4899'],
      disableForReducedMotion: true,
    });
  } else {
    // Tier 3: Grand finale celebration
    const end = Date.now() + 1000;
    const colors = ['#059669', '#f59e0b', '#6366f1', '#ec4899', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0.7, y: 0.65 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 0.98, y: 0.65 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
}
