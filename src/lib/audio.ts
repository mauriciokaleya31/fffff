let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Try to resume if it was suspended (browser autoplay policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const playSound = {
  enable: () => {
    soundEnabled = true;
    getAudioContext();
  },
  disable: () => {
    soundEnabled = false;
  },
  isEnabled: () => soundEnabled,
  
  // 1. Play Trade Open UP Sound: A clean bright high-pitched upward sweep
  tradeOpenUp: () => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.12);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      console.warn("Audio open UP trade playback error:", e);
    }
  },

  // 1b. Play Trade Open DOWN Sound: A solid deep descending sweep
  tradeOpenDown: () => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.14);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn("Audio open DOWN trade playback error:", e);
    }
  },

  // 1c. Legacy fallback
  tradeOpen: () => {
    playSound.tradeOpenUp();
  },

  // 2. Play Trade Win Chime: A beautiful, double-note bright harmonic shimmer (like C5 -> G5)
  tradeWin: () => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // Note 1 (Note C5: 523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2 (Note G5: 783.99 Hz, played 0.08s later for an elegant arpeggio chord)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.08);
      gain2.gain.setValueAtTime(0.0, now);
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.6);
      
    } catch (e) {
      console.warn("Audio win playback error:", e);
    }
  },

  // 3. Play Trade Loss: A soft, low-pitched descending thud / minor rumble
  tradeLoss: () => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.25);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn("Audio loss playback error:", e);
    }
  },

  // 4. Play Ticking Sound: A short high-pitched mechanical clock tick
  tick: () => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3500, now); // high frequency clock tick
      
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03); // very brief
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn("Audio tick playback error:", e);
    }
  },

  // 5. Play Support Chat sound tip
  chatMessage: () => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn("Audio supportMessage play error:", e);
    }
  }
};
