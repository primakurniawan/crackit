let audioCtx: AudioContext | null = null;
let enabled = true;
let volume = 0.5;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    // Standard and vendor prefixed names
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
}

export const soundManager = {
  isEnabled(): boolean {
    return enabled;
  },

  setEnabled(val: boolean) {
    enabled = val;
  },

  getVolume(): number {
    return volume;
  },

  setVolume(val: number) {
    volume = Math.max(0, Math.min(1, val));
  },

  init() {
    try {
      getAudioContext();
    } catch (e) {
      console.warn('Web Audio API is not supported in this browser.', e);
    }
  },

  playShuffle() {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // We will create a small deck shuffle sound using multiple short sweeps of noise/filtered sweeps
      const duration = 0.8;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Fill the buffer with white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      // Sound like card brushing: 4 individual brush sweeps in rapid succession
      for (let sweep = 0; sweep < 4; sweep++) {
        const sweepStart = now + sweep * 0.18;
        const sweepDuration = 0.15;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        // sweep the bandpass frequency down
        filter.frequency.setValueAtTime(1200 - sweep * 100, sweepStart);
        filter.frequency.exponentialRampToValueAtTime(300, sweepStart + sweepDuration);
        filter.Q.setValueAtTime(3.0, sweepStart);
        
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, sweepStart);
        gainNode.gain.linearRampToValueAtTime(0.12 * volume, sweepStart + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, sweepStart + sweepDuration);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        noise.start(sweepStart);
        noise.stop(sweepStart + sweepDuration);
      }
    } catch (e) {
      console.error('Failed to play shuffle sound', e);
    }
  },

  playFlip() {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Flip sound: a clean low-frequency sweep whoosh
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.35 * volume, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.error('Failed to play flip sound', e);
    }
  },

  playTick() {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Small clean click tick
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(800, now + 0.03);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08 * volume, now + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.error('Failed to play tick sound', e);
    }
  },

  playSuccess() {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // A pleasant minor/major chord sequence (pentatonic sound)
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gainNode.gain.setValueAtTime(0, now + index * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.12 * volume, now + index * 0.08 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.4);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.4);
      });
    } catch (e) {
      console.error('Failed to play success sound', e);
    }
  }
};
