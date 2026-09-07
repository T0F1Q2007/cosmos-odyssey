import { describe, it, expect, beforeEach } from 'vitest';
import { AudioEngine } from '../src/core/audio-engine.js';

describe('AudioEngine', () => {
  let engine;

  const createMockAudioContext = () => ({
    state: 'running',
    currentTime: 0,
    destination: {},
    createGain: () => ({
      gain: {
        value: 0,
        setValueAtTime: function(v) { this.value = v; },
        linearRampToValueAtTime: function(v) { this.value = v; },
        cancelScheduledValues: () => {}
      },
      connect: () => {}
    }),
    createOscillator: () => ({
      type: 'sine',
      frequency: {
        value: 440,
        setValueAtTime: function(v) { this.value = v; },
        linearRampToValueAtTime: function(v) { this.value = v; }
      },
      detune: { setValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {}
    }),
    createBuffer: () => ({
      getChannelData: () => new Float32Array(1024)
    }),
    createBufferSource: () => ({
      connect: () => {},
      start: () => {},
      stop: () => {}
    }),
    createBiquadFilter: () => ({
      type: 'bandpass',
      frequency: {
        value: 320,
        setValueAtTime: function(v) { this.value = v; },
        linearRampToValueAtTime: function(v) { this.value = v; },
        cancelScheduledValues: () => {}
      },
      Q: {
        value: 1,
        setValueAtTime: function(v) { this.value = v; },
        linearRampToValueAtTime: function(v) { this.value = v; },
        cancelScheduledValues: () => {}
      },
      connect: () => {}
    }),
    createDynamicsCompressor: () => ({
      threshold: { setValueAtTime: () => {} },
      knee: { setValueAtTime: () => {} },
      ratio: { setValueAtTime: () => {} },
      attack: { setValueAtTime: () => {} },
      release: { setValueAtTime: () => {} },
      connect: () => {}
    }),
    resume: async () => {}
  });

  beforeEach(() => {
    engine = new AudioEngine();
  });

  it('should start in uninitialized or stopped state with boosted default volume', () => {
    expect(engine.isPlaying).toBe(false);
    expect(engine.isUnlocked).toBe(false);
    expect(engine.volume).toBeGreaterThanOrEqual(0.8);
  });

  it('should toggle play state correctly', () => {
    const mockCtx = createMockAudioContext();
    engine.setMockContext(mockCtx);
    const state1 = engine.toggle();
    expect(state1).toBe(true);
    expect(engine.isPlaying).toBe(true);

    const state2 = engine.toggle();
    expect(state2).toBe(false);
    expect(engine.isPlaying).toBe(false);
  });

  it('should clamp volume between 0 and 1', () => {
    engine.setVolume(1.5);
    expect(engine.volume).toBe(1.0);

    engine.setVolume(-0.5);
    expect(engine.volume).toBe(0.0);

    engine.setVolume(0.85);
    expect(engine.volume).toBe(0.85);
  });

  it('should switch between unique celestial body audio profiles', () => {
    const mockCtx = createMockAudioContext();
    engine.setMockContext(mockCtx);
    engine.init();

    // 1. Sun Profile: Deep solar convection roar & plasma turbulence
    engine.setCelestialBody('sun');
    expect(engine.currentBody).toBe('sun');
    const sunProfile = engine.getActiveProfile();
    expect(sunProfile.name).toContain('Sun');
    expect(sunProfile.baseFreq).toBeLessThanOrEqual(60); // sub-bass 48Hz

    // 2. Jupiter Profile: Harsh Jovian decametric bursts & magnetosphere
    engine.setCelestialBody('jupiter');
    expect(engine.currentBody).toBe('jupiter');
    const jupiterProfile = engine.getActiveProfile();
    expect(jupiterProfile.name).toContain('Jupiter');
    expect(jupiterProfile.timbre).toContain('decametric');

    // 3. Saturn Profile: Crystalline icy ring chimes
    engine.setCelestialBody('saturn');
    expect(engine.currentBody).toBe('saturn');
    const saturnProfile = engine.getActiveProfile();
    expect(saturnProfile.name).toContain('Saturn');
    expect(saturnProfile.baseFreq).toBeGreaterThanOrEqual(500); // high ring resonance chimes

    // 4. Earth Profile: Schumann 432Hz harmonic chord & oceanic breathing
    engine.setCelestialBody('earth');
    expect(engine.currentBody).toBe('earth');
    const earthProfile = engine.getActiveProfile();
    expect(earthProfile.name).toContain('Terra');

    // 5. Deep Sky Profile: Pulsar beacon & CMBR hiss
    engine.setCelestialBody('deep-sky');
    expect(engine.currentBody).toBe('deep-sky');
    const deepProfile = engine.getActiveProfile();
    expect(deepProfile.name).toContain('Deep Sky');
  });

  it('should safely handle unknown celestial body id with fallback', () => {
    const mockCtx = createMockAudioContext();
    engine.setMockContext(mockCtx);
    engine.init();

    engine.setCelestialBody('unknown-asteroid');
    expect(engine.currentBody).toBe('sun');
  });
});
