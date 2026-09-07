import { describe, it, expect } from 'vitest';
import {
  generateEarthTexture,
  generateJupiterTexture,
  generateMarsTexture,
  generateSaturnRingsTexture,
  generateGalaxyTexture,
  generateAndromedaTexture,
  generateWhirlpoolTexture,
  generateSombreroTexture,
  generateTriangulumTexture,
  generateMilkyWayTexture
} from '../src/core/texture-generator.js';

describe('TextureGenerator', () => {
  it('should export all generator functions including specific galaxies', () => {
    expect(generateEarthTexture).toBeTypeOf('function');
    expect(generateJupiterTexture).toBeTypeOf('function');
    expect(generateMarsTexture).toBeTypeOf('function');
    expect(generateSaturnRingsTexture).toBeTypeOf('function');
    expect(generateGalaxyTexture).toBeTypeOf('function');
    expect(generateMilkyWayTexture).toBeTypeOf('function');
    expect(generateAndromedaTexture).toBeTypeOf('function');
    expect(generateWhirlpoolTexture).toBeTypeOf('function');
    expect(generateSombreroTexture).toBeTypeOf('function');
    expect(generateTriangulumTexture).toBeTypeOf('function');
  });

  it('should generate valid Three.js CanvasTexture instances', () => {
    // When document is present (or with mock canvas), it returns texture
    const mockDocument = {
      createElement: () => ({
        width: 128,
        height: 64,
        getContext: () => ({
          createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
          putImageData: () => {},
          createLinearGradient: () => ({ addColorStop: () => {} }),
          createRadialGradient: () => ({ addColorStop: () => {} }),
          fillRect: () => {},
          clearRect: () => {},
          beginPath: () => {},
          ellipse: () => {},
          arc: () => {},
          fill: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {}
        })
      })
    };

    globalThis.document = mockDocument;
    const tex = generateEarthTexture(64, 32);
    expect(tex).toBeDefined();
    expect(tex.isTexture).toBe(true);

    const ringTex = generateSaturnRingsTexture(64, 2);
    expect(ringTex).toBeDefined();
    expect(ringTex.isTexture).toBe(true);

    const andromedaTex = generateAndromedaTexture(128);
    expect(andromedaTex).toBeDefined();
    expect(andromedaTex.isTexture).toBe(true);

    const sombreroTex = generateSombreroTexture(128);
    expect(sombreroTex).toBeDefined();
    expect(sombreroTex.isTexture).toBe(true);
  });
});
