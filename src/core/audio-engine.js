/**
 * AudioEngine — Deep Module for Multi-Timbral Cosmic Soundscape
 * Features per-planet acoustic synthesis (Solar rumble, Jovian radio bursts,
 * Saturn crystalline ring chimes, supersonic winds, pulsar clicks),
 * dynamics compression for warm punchy loudness, and smooth crossfades.
 */

export const CELESTIAL_AUDIO_PROFILES = {
  'sun': {
    id: 'sun',
    name: 'The Sun — Peaceful Solar Harmony & Warm Deep Drone',
    description: 'Warm meditative sub-bass drone (48Hz), gentle solar pulsation, and soft celestial glow.',
    baseFreq: 48.0,
    freqs: [48.0, 96.0, 144.0, 192.0],
    detunes: [-1.5, 0, 1.5, -0.8],
    types: ['sine', 'sine', 'triangle', 'sine'],
    filterType: 'lowpass',
    filterFreq: 320,
    filterQ: 0.9,
    noiseGain: 0.03,
    timbre: 'warm-solar-drone'
  },
  'mercury': {
    id: 'mercury',
    name: 'Mercury — Serene Airless Solitude & Distant Shimmer',
    description: 'Delicate, tranquil high-register sine harmonics and quiet cosmic calm.',
    baseFreq: 110.0,
    freqs: [110.0, 220.0, 330.0, 440.0],
    detunes: [0, 1.2, -1.2, 0.5],
    types: ['sine', 'sine', 'triangle', 'sine'],
    filterType: 'lowpass',
    filterFreq: 420,
    filterQ: 0.8,
    noiseGain: 0.02,
    timbre: 'serene-airless-solitude'
  },
  'venus': {
    id: 'venus',
    name: 'Venus — Ethereal Golden Atmosphere & Soft Amber Pad',
    description: 'Soothing golden ambient chords, gentle cloud breathing, and warm tranquil pad.',
    baseFreq: 65.0,
    freqs: [65.0, 130.0, 195.0, 260.0],
    detunes: [-1.2, 1.0, 1.8, -0.9],
    types: ['sine', 'triangle', 'sine', 'sine'],
    filterType: 'lowpass',
    filterFreq: 360,
    filterQ: 0.9,
    noiseGain: 0.03,
    timbre: 'ethereal-amber-pad'
  },
  'earth': {
    id: 'earth',
    name: 'Terra & Luna — Biospheric Harmony & 432Hz Schumann Peace',
    description: 'Peaceful 432Hz / 108Hz harmonic chord, oceanic breathing LFO, and gentle biospheric calm.',
    baseFreq: 108.0,
    freqs: [108.0, 216.0, 324.0, 432.0],
    detunes: [0, 1.0, -1.0, 0.5],
    types: ['sine', 'sine', 'triangle', 'sine'],
    filterType: 'lowpass',
    filterFreq: 480,
    filterQ: 0.8,
    noiseGain: 0.02,
    timbre: 'harmonic-biosphere-peace'
  },
  'mars': {
    id: 'mars',
    name: 'Mars — Peaceful Red Dunes & Soft Canyon Breeze',
    description: 'Gentle red planet whisper, warm flute-like harmonics, and tranquil stillness.',
    baseFreq: 85.0,
    freqs: [85.0, 127.5, 170.0, 255.0],
    detunes: [-1.0, 1.0, -1.5, 0.8],
    types: ['triangle', 'sine', 'sine', 'sine'],
    filterType: 'lowpass',
    filterFreq: 380,
    filterQ: 0.9,
    noiseGain: 0.03,
    timbre: 'gentle-dune-whisper'
  },
  'jupiter': {
    id: 'jupiter',
    name: 'Jupiter — Majestic Jovian Chorus & Gentle Decametric Pad',
    description: 'Deep royal fifths (55Hz), peaceful ambient swelling, and serene magnetospheric chorus.',
    baseFreq: 55.0,
    freqs: [55.0, 110.0, 165.0, 220.0],
    detunes: [-1.5, 1.5, -0.8, 1.2],
    types: ['sine', 'triangle', 'sine', 'sine'],
    filterType: 'lowpass',
    filterFreq: 340,
    filterQ: 0.8,
    noiseGain: 0.03,
    timbre: 'jovian-peaceful-decametric-pad'
  },
  'saturn': {
    id: 'saturn',
    name: 'Saturn — Ethereal Ring Chimes & Crystalline Meditation',
    description: 'Peaceful water-ice bell tones (587Hz), harmonic crystalline chimes, and celestial lullaby.',
    baseFreq: 587.33,
    freqs: [293.66, 440.0, 587.33, 880.0],
    detunes: [0, 1.5, -1.5, 0.8],
    types: ['sine', 'sine', 'triangle', 'sine'],
    filterType: 'lowpass',
    filterFreq: 640,
    filterQ: 0.8,
    noiseGain: 0.02,
    timbre: 'crystalline-ring-chimes'
  },
  'ice-giants': {
    id: 'ice-giants',
    name: 'Uranus & Neptune — Deep Azure Calm & Frigid Solitude',
    description: 'Tranquil deep-blue pad, soft distant whistling undertones, and serene outer-system peace.',
    baseFreq: 60.0,
    freqs: [60.0, 120.0, 180.0, 240.0],
    detunes: [-1.2, 1.2, 0.8, -0.8],
    types: ['sine', 'triangle', 'sine', 'sine'],
    filterType: 'lowpass',
    filterFreq: 360,
    filterQ: 0.8,
    noiseGain: 0.03,
    timbre: 'peaceful-azure-calm'
  },
  'andromeda': {
    id: 'andromeda',
    name: 'Andromeda (M31) — Majestic Spiral Drone & Ethereal Core',
    description: 'Tranquil intergalactic open chords, serene golden stellar pad, and deep cosmic grace.',
    baseFreq: 65.41,
    freqs: [65.41, 130.81, 196.22, 261.63],
    detunes: [-1.0, 1.0, -0.5, 0.5],
    types: ['sine', 'triangle', 'sine', 'sine'],
    filterType: 'lowpass',
    filterFreq: 380,
    filterQ: 0.8,
    noiseGain: 0.02,
    timbre: 'andromeda-spiral-peace'
  },
  'whirlpool': {
    id: 'whirlpool',
    name: 'Whirlpool (M51) — Grand-Design Harmonic Waves',
    description: 'Meditative rotating density chords, soft starlight chimes, and peaceful spiral harmony.',
    baseFreq: 82.41,
    freqs: [82.41, 123.61, 164.81, 247.22],
    detunes: [-0.8, 0.8, 1.2, -0.6],
    types: ['sine', 'sine', 'triangle', 'sine'],
    filterType: 'lowpass',
    filterFreq: 420,
    filterQ: 0.8,
    noiseGain: 0.02,
    timbre: 'whirlpool-harmonic-waves'
  },
  'sombrero': {
    id: 'sombrero',
    name: 'Sombrero (M104) — Serene Bulge Resonance & Dark Dust Calm',
    description: 'Warm resonant halo hum, deep quiet dust ring absorption pad, and meditative presence.',
    baseFreq: 58.27,
    freqs: [58.27, 87.31, 116.54, 174.81],
    detunes: [-1.0, 1.0, -0.8, 0.8],
    types: ['sine', 'triangle', 'sine', 'sine'],
    filterType: 'lowpass',
    filterFreq: 340,
    filterQ: 0.8,
    noiseGain: 0.02,
    timbre: 'sombrero-dust-calm'
  },
  'triangulum': {
    id: 'triangulum',
    name: 'Triangulum (M33) — Cyan Stellar Nursery & Soft Bells',
    description: 'Delicate cyan star nursery chimes, peaceful high-register bells, and gentle warmth.',
    baseFreq: 98.00,
    freqs: [98.00, 147.00, 196.00, 294.00],
    detunes: [0, 1.0, -1.0, 0.8],
    types: ['sine', 'sine', 'triangle', 'sine'],
    filterType: 'lowpass',
    filterFreq: 460,
    filterQ: 0.8,
    noiseGain: 0.02,
    timbre: 'triangulum-soft-bells'
  },
  'deep-sky': {
    id: 'deep-sky',
    name: 'Deep Sky & The Milky Way — The Infinite Peaceful Void',
    description: 'Vast, serene galactic open fifths, gentle cosmic lullaby, and infinite stillness of our home galaxy.',
    baseFreq: 55.0,
    freqs: [55.0, 110.0, 165.0, 220.0],
    detunes: [-0.8, 0.8, -0.5, 0.5],
    types: ['sine', 'sine', 'triangle', 'sine'],
    filterType: 'lowpass',
    filterFreq: 360,
    filterQ: 0.8,
    noiseGain: 0.02,
    timbre: 'peaceful-milkyway-void'
  }
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isUnlocked = false;
    this.volume = 0.85; // Boosted default volume
    this.masterGain = null;
    this.compressor = null;
    this.oscillators = [];
    this.oscGains = [];
    this.noiseNode = null;
    this.noiseGain = null;
    this.filter = null;
    this.currentBody = 'sun';
  }

  setMockContext(ctx) {
    this.ctx = ctx;
    this.isUnlocked = true;
  }

  unlock() {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return;
    try {
      if (!this.ctx && (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext))) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isUnlocked = true;
    } catch (e) {
      console.warn('AudioContext unlock deferred:', e);
    }
  }

  init() {
    if (this.masterGain) return;
    this.unlock();

    if (!this.ctx) return;

    // 1. Dynamics Compressor for professional loudness & punch without clipping
    if (this.ctx.createDynamicsCompressor) {
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(24, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);
    }

    // 2. Master Gain Node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    if (this.compressor) {
      this.masterGain.connect(this.compressor);
    } else {
      this.masterGain.connect(this.ctx.destination);
    }

    // 3. Multi-Harmonic Oscillator Bank (4 Voices)
    const initialProfile = CELESTIAL_AUDIO_PROFILES.sun;
    initialProfile.freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = initialProfile.types[idx] || 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.detune.setValueAtTime(initialProfile.detunes[idx] || 0, this.ctx.currentTime);

      const baseGain = 0.28 / (idx + 1);
      oscGain.gain.setValueAtTime(baseGain, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start();

      this.oscillators.push(osc);
      this.oscGains.push(oscGain);
    });

    // 4. Filtered Cosmic Noise Generator (Pink/Brown noise spectrum)
    const sampleRate = this.ctx.sampleRate || 44100;
    const bufferSize = 2 * sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.085;
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Resonant Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = initialProfile.filterType || 'lowpass';
    this.filter.frequency.setValueAtTime(initialProfile.filterFreq, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(initialProfile.filterQ, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(initialProfile.noiseGain * 0.35, this.ctx.currentTime);

    noiseSource.connect(this.filter);
    this.filter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);
    noiseSource.start();
    this.noiseNode = noiseSource;
  }

  setCelestialBody(id) {
    const profile = CELESTIAL_AUDIO_PROFILES[id] || CELESTIAL_AUDIO_PROFILES.sun;
    this.currentBody = profile.id;

    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const rampTime = 1.0;

    // Morph filter
    if (this.filter && this.filter.frequency) {
      if (this.filter.type !== profile.filterType) {
        this.filter.type = profile.filterType;
      }
      if (this.filter.frequency.cancelScheduledValues) {
        this.filter.frequency.cancelScheduledValues(now);
      }
      if (this.filter.frequency.setValueAtTime) {
        this.filter.frequency.setValueAtTime(this.filter.frequency.value || profile.filterFreq, now);
      }
      if (this.filter.frequency.linearRampToValueAtTime) {
        this.filter.frequency.linearRampToValueAtTime(profile.filterFreq, now + rampTime);
      }

      if (this.filter.Q) {
        if (this.filter.Q.cancelScheduledValues) {
          this.filter.Q.cancelScheduledValues(now);
        }
        if (this.filter.Q.setValueAtTime) {
          this.filter.Q.setValueAtTime(this.filter.Q.value || profile.filterQ, now);
        }
        if (this.filter.Q.linearRampToValueAtTime) {
          this.filter.Q.linearRampToValueAtTime(profile.filterQ, now + rampTime);
        }
      }
    }

    // Morph noise gain
    if (this.noiseGain && this.noiseGain.gain) {
      if (this.noiseGain.gain.cancelScheduledValues) {
        this.noiseGain.gain.cancelScheduledValues(now);
      }
      if (this.noiseGain.gain.setValueAtTime) {
        this.noiseGain.gain.setValueAtTime(this.noiseGain.gain.value || 0.1, now);
      }
      if (this.noiseGain.gain.linearRampToValueAtTime) {
        this.noiseGain.gain.linearRampToValueAtTime(profile.noiseGain * 0.35, now + rampTime);
      }
    }

    // Morph oscillators
    profile.freqs.forEach((freq, idx) => {
      const osc = this.oscillators[idx];
      const oscGain = this.oscGains[idx];
      if (osc && osc.frequency) {
        if (osc.frequency.cancelScheduledValues) {
          osc.frequency.cancelScheduledValues(now);
        }
        if (osc.frequency.setValueAtTime) {
          osc.frequency.setValueAtTime(osc.frequency.value || freq, now);
        }
        if (osc.frequency.linearRampToValueAtTime) {
          osc.frequency.linearRampToValueAtTime(freq, now + rampTime);
        }

        if (osc.detune && osc.detune.setValueAtTime) {
          osc.detune.setValueAtTime(profile.detunes[idx] || 0, now);
        }
      }
      if (oscGain && oscGain.gain) {
        const targetGain = 0.28 / (idx + 1);
        if (oscGain.gain.cancelScheduledValues) {
          oscGain.gain.cancelScheduledValues(now);
        }
        if (oscGain.gain.setValueAtTime) {
          oscGain.gain.setValueAtTime(oscGain.gain.value || targetGain, now);
        }
        if (oscGain.gain.linearRampToValueAtTime) {
          oscGain.gain.linearRampToValueAtTime(targetGain, now + rampTime);
        }
      }
    });
  }

  getActiveProfile() {
    return CELESTIAL_AUDIO_PROFILES[this.currentBody] || CELESTIAL_AUDIO_PROFILES.sun;
  }

  setVolume(val) {
    this.volume = Math.max(0.0, Math.min(1.0, val));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  toggle() {
    this.unlock();
    if (!this.masterGain) {
      this.init();
    }
    if (!this.ctx || !this.masterGain) {
      this.isPlaying = !this.isPlaying;
      return this.isPlaying;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    if (!this.isPlaying) {
      // Fade in smoothly to boosted volume
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || 0, now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.8);
      this.isPlaying = true;
    } else {
      // Fade out
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || this.volume, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0, now + 0.6);
      this.isPlaying = false;
    }
    return this.isPlaying;
  }
}

export const cosmicAudio = new AudioEngine();

