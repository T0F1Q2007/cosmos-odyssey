/**
 * COSMOS — Procedural Cosmic Soundscape Synthesizer
 * Uses Web Audio API to generate a deep-space ambient soundscape:
 * - Low-frequency resonant drone (harmonic stellar fundamental)
 * - Filtered pink-noise cosmic microwave background radiation (CMBR)
 * - Gentle LFO frequency sweep simulating solar wind
 */

class CosmicSoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
    this.noiseNode = null;
    this.filter = null;
    this.lfo = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 1. Resonant Drone Oscillators (A1: 55Hz, E2: 82.4Hz, A2: 110Hz)
    const freqs = [55.0, 82.4, 110.0, 164.8];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Detune slightly for lush chorus
      osc.detune.setValueAtTime((idx - 1.5) * 4.5, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start();
      this.oscillators.push(osc);
    });

    // 2. Cosmic Microwave Background Noise (Pink noise approximation)
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Resonant bandpass filter for cosmic wind sweep
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'bandpass';
    this.filter.frequency.setValueAtTime(280, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // LFO to slowly sweep filter frequency
    this.lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12.5s cycle
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);

    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start();

    whiteNoise.connect(this.filter);
    this.filter.connect(this.masterGain);
    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    if (!this.isPlaying) {
      // Fade in smoothly over 1.8 seconds
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.45, now + 1.8);
      this.isPlaying = true;
    } else {
      // Fade out smoothly over 1.2 seconds
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0, now + 1.2);
      this.isPlaying = false;
    }
    return this.isPlaying;
  }
}

export const cosmicAudio = new CosmicSoundEngine();
