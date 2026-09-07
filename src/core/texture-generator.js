import * as THREE from 'three';

/**
 * TextureGenerator — High-Definition Procedural Astrophysics Texture Engine
 * Generates 1024x512 multi-octave FBM planetary maps, dynamic cloud decks,
 * Jovian storm belts, ring divisions, and logarithmic spiral galaxies.
 */

// Simple pseudo-random hash & value noise
function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x, y) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  // Cubic Hermite curve
  const u = fx * fx * (3.0 - 2.0 * fx);
  const v = fy * fy * (3.0 - 2.0 * fy);

  const a = hash2(i, j);
  const b = hash2(i + 1, j);
  const c = hash2(i, j + 1);
  const d = hash2(i + 1, j + 1);

  return (a * (1 - u) + b * u) + (c - a) * v * (1 - u) + (d - b) * u * v;
}

// Fractal Brownian Motion (FBM) with 5 octaves
function fbm(x, y, octaves = 5) {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let o = 0; o < octaves; o++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    freq *= 2.05;
    amp *= 0.5;
  }
  return val;
}

/**
 * 1. Earth Texture Generator (Continents, Oceans, Polar Caps)
 */
export function generateEarthTexture(w = 1024, h = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    const lat = (y / h - 0.5) * Math.PI; // -PI/2 to PI/2
    const cosLat = Math.cos(lat);

    for (let x = 0; x < w; x++) {
      const lon = (x / w) * Math.PI * 2;
      const idx = (y * w + x) * 4;

      // Map spherical coords to noise space
      const nx = Math.cos(lon) * cosLat * 3.5;
      const ny = Math.sin(lon) * cosLat * 3.5;
      const nz = Math.sin(lat) * 3.5;

      const continentVal = fbm(nx + 10, ny + nz + 10, 6);

      // Polar ice cap test
      const isPolar = Math.abs(lat) > 1.25;

      if (isPolar) {
        // Polar Ice
        data[idx]     = 240;
        data[idx + 1] = 248;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      } else if (continentVal > 0.48) {
        // Landmass
        const elev = (continentVal - 0.48) / 0.52;
        if (elev > 0.6) {
          // Mountains / Plateau
          data[idx]     = 139 + Math.floor(elev * 40);
          data[idx + 1] = 119 + Math.floor(elev * 30);
          data[idx + 2] = 101;
        } else if (Math.abs(lat) < 0.35 && elev < 0.25) {
          // Equatorial rainforest / savannah
          data[idx]     = 34;
          data[idx + 1] = 139;
          data[idx + 2] = 34;
        } else {
          // Temperate vegetation
          data[idx]     = 46;
          data[idx + 1] = 117;
          data[idx + 2] = 60;
        }
        data[idx + 3] = 255;
      } else {
        // Ocean (Deep blue with coastal shelves)
        const depth = continentVal / 0.48;
        data[idx]     = 10 + Math.floor(depth * 15);
        data[idx + 1] = 30 + Math.floor(depth * 45);
        data[idx + 2] = 90 + Math.floor(depth * 80);
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * 2. Earth Clouds Texture
 */
export function generateEarthClouds(w = 1024, h = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const n = fbm((x / w) * 12, (y / h) * 6, 5);
      const alpha = n > 0.52 ? Math.min(255, Math.floor((n - 0.52) * 650)) : 0;

      data[idx]     = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * 3. Jupiter Texture Generator (Zonal Bands + Great Red Spot)
 */
export function generateJupiterTexture(w = 1024, h = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  // GRS Center coordinates (normalized)
  const grsX = 0.65;
  const grsY = 0.62;

  for (let y = 0; y < h; y++) {
    const ny = y / h;
    // Fast latitudinal bands with sine turbulence
    const bandNoise = fbm(ny * 16, 0.5, 3);
    const bandVal = Math.sin(ny * 32 + bandNoise * 2.5) * 0.5 + 0.5;

    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const idx = (y * w + x) * 4;

      // Local turbulence along belts
      const turb = fbm(nx * 14, ny * 24, 4);

      // Great Red Spot Oval
      const dx = (nx - grsX) * 2.2;
      const dy = (ny - grsY) * 5.0;
      const distGRS = Math.sqrt(dx * dx + dy * dy);

      if (distGRS < 0.12) {
        // Inside the Great Red Spot storm vortex!
        const spotSwirl = Math.sin(distGRS * 40 - Math.atan2(dy, dx) * 2.0);
        data[idx]     = 200 + Math.floor(spotSwirl * 30);
        data[idx + 1] = 65 + Math.floor(spotSwirl * 20);
        data[idx + 2] = 45;
        data[idx + 3] = 255;
      } else {
        // Alternating brown/amber and cream Jovian clouds
        const blend = (bandVal * 0.7 + turb * 0.3);
        data[idx]     = Math.floor(180 + blend * 65);
        data[idx + 1] = Math.floor(115 + blend * 90);
        data[idx + 2] = Math.floor(70 + blend * 75);
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * 4. Mars Texture Generator (Ochre, Basalt Maria, Polar Caps)
 */
export function generateMarsTexture(w = 1024, h = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    const lat = (y / h - 0.5) * Math.PI;
    const isNorthPole = y < h * 0.08;
    const isSouthPole = y > h * 0.92;

    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      if (isNorthPole || isSouthPole) {
        // Polar Ice Cap
        data[idx]     = 245;
        data[idx + 1] = 240;
        data[idx + 2] = 240;
        data[idx + 3] = 255;
      } else {
        const n = fbm((x / w) * 8, (y / h) * 8, 5);
        // Dark volcanic basalt patches vs rusted ochre sands
        if (n < 0.4) {
          // Dark Mare
          data[idx]     = 95;
          data[idx + 1] = 48;
          data[idx + 2] = 38;
        } else {
          // Rusted iron oxide highland
          const redVal = Math.floor(165 + n * 65);
          data[idx]     = redVal;
          data[idx + 1] = Math.floor(redVal * 0.42);
          data[idx + 2] = Math.floor(redVal * 0.25);
        }
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * 5. Saturn High-Resolution Rings (Cassini Division + Ring Bands)
 */
export function generateSaturnRingsTexture(w = 1024, h = 2) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, w, 0);

  // Realistic radial density profile:
  // Inner C Ring (Faint translucent)
  grad.addColorStop(0.00, 'rgba(170, 140, 95, 0.0)');
  grad.addColorStop(0.12, 'rgba(185, 155, 110, 0.35)');
  // B Ring (Bright, dense, golden)
  grad.addColorStop(0.20, 'rgba(230, 200, 150, 0.95)');
  grad.addColorStop(0.56, 'rgba(240, 210, 160, 0.98)');
  // Cassini Division (True dark, empty gap)
  grad.addColorStop(0.58, 'rgba(0, 0, 0, 0.0)');
  grad.addColorStop(0.64, 'rgba(0, 0, 0, 0.0)');
  // A Ring (Medium density with subtle Encke gap)
  grad.addColorStop(0.66, 'rgba(215, 185, 140, 0.85)');
  grad.addColorStop(0.88, 'rgba(195, 165, 120, 0.65)');
  grad.addColorStop(1.00, 'rgba(160, 130, 90, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * 6. Spiral Galaxy Texture (Logarithmic arms with glowing nucleus)
 */
export function generateGalaxyTexture(colorCore = '#fff8e7', colorArm = '#818cf8', size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);

  // 1. Radiant Galactic Core Glow
  const coreGrad = ctx.createRadialGradient(center, center, 2, center, center, size * 0.45);
  coreGrad.addColorStop(0.0, colorCore);
  coreGrad.addColorStop(0.12, colorArm);
  coreGrad.addColorStop(0.45, 'rgba(140, 80, 255, 0.25)');
  coreGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Dense Logarithmic Spiral Arms
  const armPoints = 1400;
  for (let arm = 0; arm < 2; arm++) {
    const armOffset = arm * Math.PI;
    for (let i = 0; i < armPoints; i++) {
      const theta = (i / armPoints) * Math.PI * 4.5;
      const r = 8 + Math.pow(theta, 1.8) * 11;
      const spread = (Math.random() - 0.5) * (18 + r * 0.25);

      const x = center + Math.cos(theta + armOffset) * r + spread;
      const y = center + Math.sin(theta + armOffset) * (r * 0.75) + spread * 0.75;

      const alpha = Math.max(0, 1 - r / (size * 0.48));
      ctx.fillStyle = `rgba(230, 240, 255, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + Math.random() * 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 6b. The Milky Way Galaxy (Our Home) — Grand barred spiral with central stellar bar,
 *     four major arms, and marked Orion Spur (Solar System location).
 */
export function generateMilkyWayTexture(size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);

  // 1. Sagittarius A* Supermassive Black Hole & Nuclear Bulge Glow
  const coreGrad = ctx.createRadialGradient(center, center, 2, center, center, size * 0.46);
  coreGrad.addColorStop(0.0, '#ffffff');
  coreGrad.addColorStop(0.06, '#fff4cc');
  coreGrad.addColorStop(0.18, '#fed7aa');
  coreGrad.addColorStop(0.38, 'rgba(129, 140, 248, 0.28)');
  coreGrad.addColorStop(0.68, 'rgba(56, 189, 248, 0.10)');
  coreGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Central Bar (The Milky Way is a barred spiral SBbc)
  if (ctx.save) ctx.save();
  if (ctx.translate) ctx.translate(center, center);
  if (ctx.rotate) ctx.rotate(0.55); // ~32° bar angle
  const barGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, size * 0.16);
  barGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  barGrad.addColorStop(0.4, 'rgba(254, 215, 170, 0.8)');
  barGrad.addColorStop(1.0, 'rgba(251, 146, 60, 0.0)');
  ctx.fillStyle = barGrad;
  if (ctx.scale) ctx.scale(2.2, 0.7);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  if (ctx.restore) ctx.restore();

  // 3. Four Major Spiral Arms (Perseus, Scutum-Centaurus, Sagittarius, Outer)
  const armStars = 3200;
  for (let arm = 0; arm < 4; arm++) {
    const armOffset = arm * (Math.PI / 2);
    for (let i = 0; i < armStars / 4; i++) {
      const theta = (i / (armStars / 4)) * Math.PI * 4.2;
      const r = 16 + Math.pow(theta, 1.72) * 18;
      const spread = (Math.random() - 0.5) * (14 + r * 0.22);

      const x = center + Math.cos(theta + armOffset) * r + spread;
      const y = center + Math.sin(theta + armOffset) * (r * 0.88) + spread * 0.88;

      const alpha = Math.max(0, 1 - r / (size * 0.48));
      if (i % 8 === 0) {
        ctx.fillStyle = `rgba(244, 114, 182, ${alpha * 0.92})`; // H II Starburst
      } else if (i % 3 === 0) {
        ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.95})`; // Blue OB Giants
      } else {
        ctx.fillStyle = `rgba(255, 250, 230, ${alpha * 0.8})`; // Sun-like Stars
      }
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + Math.random() * 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Highlight Orion-Cygnus Spur (Location of our Solar System!)
  const solTheta = 2.4;
  const solR = size * 0.24; // ~26,000 light-years out
  const solX = center + Math.cos(solTheta) * solR;
  const solY = center + Math.sin(solTheta) * (solR * 0.88);

  const solGlow = ctx.createRadialGradient(solX, solY, 1, solX, solY, 18);
  solGlow.addColorStop(0.0, '#ffffff');
  solGlow.addColorStop(0.2, '#fde047');
  solGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.4)');
  solGlow.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = solGlow;
  ctx.beginPath();
  ctx.arc(solX, solY, 18, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 7. Andromeda Galaxy (M31) — Highly tilted giant spiral with massive golden core & dust rings
 */
export function generateAndromedaTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);

  // Core & Elliptical Disk Halo
  const radGrad = ctx.createRadialGradient(center, center, 1, center, center, size * 0.48);
  radGrad.addColorStop(0.0, '#ffffff');
  radGrad.addColorStop(0.08, '#fff2c2');
  radGrad.addColorStop(0.25, '#c7d2fe');
  radGrad.addColorStop(0.55, 'rgba(79, 70, 229, 0.22)');
  radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, size, size);

  // Concentric tilted spiral arms (77° inclination)
  const starCount = 2400;
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 6.0;
    const r = 12 + Math.pow(theta / (Math.PI * 6.0), 1.2) * (size * 0.42);
    const noiseSpread = (Math.random() - 0.5) * 16;
    
    // Elongate along X and compress along Y for 77° tilt
    const x = center + Math.cos(theta) * r + noiseSpread;
    const y = center + Math.sin(theta) * (r * 0.38) + noiseSpread * 0.38;

    const distFromCenter = Math.sqrt(Math.pow(x - center, 2) + Math.pow(y - center, 2));
    const alpha = Math.max(0.1, 1 - distFromCenter / (size * 0.48));

    ctx.fillStyle = i % 4 === 0 
      ? `rgba(165, 180, 252, ${alpha * 0.9})` // Blue star cluster
      : `rgba(255, 245, 220, ${alpha * 0.8})`; // Old population II stars
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + Math.random() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Satellite Galaxy M32 (Dense dwarf elliptical near core)
  const m32Grad = ctx.createRadialGradient(center + size * 0.15, center - size * 0.12, 1, center + size * 0.15, center - size * 0.12, 14);
  m32Grad.addColorStop(0.0, '#ffffff');
  m32Grad.addColorStop(0.5, '#fde68a');
  m32Grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = m32Grad;
  ctx.beginPath();
  ctx.arc(center + size * 0.15, center - size * 0.12, 14, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 8. Whirlpool Galaxy (M51) — Grand-design spiral with companion NGC 5195
 */
export function generateWhirlpoolTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);

  // Radiant Nucleus
  const coreGrad = ctx.createRadialGradient(center, center, 2, center, center, size * 0.42);
  coreGrad.addColorStop(0.0, '#ffffff');
  coreGrad.addColorStop(0.1, '#fef08a');
  coreGrad.addColorStop(0.35, 'rgba(168, 85, 247, 0.28)');
  coreGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.12)');
  coreGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, size, size);

  // Two sweeping grand-design spiral arms with pink HII starbursts
  const armStars = 2000;
  for (let arm = 0; arm < 2; arm++) {
    const armOffset = arm * Math.PI;
    for (let i = 0; i < armStars; i++) {
      const theta = (i / armStars) * Math.PI * 3.8;
      const r = 8 + Math.pow(theta, 1.65) * 16;
      const spread = (Math.random() - 0.5) * (14 + r * 0.18);

      const x = center + Math.cos(theta + armOffset) * r + spread;
      const y = center + Math.sin(theta + armOffset) * r + spread;

      const alpha = Math.max(0, 1 - r / (size * 0.46));
      // Interspersed pink HII nebulae and bright blue supergiant knots
      if (i % 7 === 0) {
        ctx.fillStyle = `rgba(244, 114, 182, ${alpha * 0.95})`; // Pink HII region
      } else {
        ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.85})`; // Blue stars
      }
      ctx.beginPath();
      ctx.arc(x, y, 1.4 + Math.random() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Companion dwarf galaxy NGC 5195 connected to north arm
  const compX = center + size * 0.26;
  const compY = center - size * 0.24;
  const compGrad = ctx.createRadialGradient(compX, compY, 2, compX, compY, 28);
  compGrad.addColorStop(0.0, '#ffffff');
  compGrad.addColorStop(0.3, '#fed7aa');
  compGrad.addColorStop(0.8, 'rgba(251, 146, 60, 0.3)');
  compGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = compGrad;
  ctx.beginPath();
  ctx.arc(compX, compY, 28, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 9. Sombrero Galaxy (M104) — Edge-on lenticular galaxy with colossal spherical nuclear bulge
 *    and signature elliptical equatorial dust absorption ring (Hubble Heritage PRC03-28).
 */
export function generateSombreroTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);

  // 1. Colossal Spherical Halo Bulge (Luminous stellar population)
  const bulgeGrad = ctx.createRadialGradient(center, center, 2, center, center, size * 0.45);
  bulgeGrad.addColorStop(0.0, '#ffffff');
  bulgeGrad.addColorStop(0.08, '#fffdf0');
  bulgeGrad.addColorStop(0.22, '#fde68a');
  bulgeGrad.addColorStop(0.42, 'rgba(251, 191, 36, 0.35)');
  bulgeGrad.addColorStop(0.68, 'rgba(168, 85, 247, 0.12)');
  bulgeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bulgeGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. High-Density Stellar Nuclear Core
  const coreGlow = ctx.createRadialGradient(center, center, 1, center, center, size * 0.18);
  coreGlow.addColorStop(0.0, '#ffffff');
  coreGlow.addColorStop(0.4, '#fef3c7');
  coreGlow.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = coreGlow;
  ctx.fillRect(0, 0, size, size);

  // 3. Inclined Stellar Disk Population (thousands of background old stars)
  const diskStars = 2200;
  for (let i = 0; i < diskStars; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = (size * 0.12) + Math.random() * (size * 0.34);
    const x = center + Math.cos(angle) * r;
    // Tilted disk projection (~6° inclination)
    const y = center + Math.sin(angle) * (r * 0.18) + (x - center) * 0.04;

    const alpha = Math.max(0.05, 1 - r / (size * 0.48));
    ctx.fillStyle = (i % 6 === 0)
      ? `rgba(224, 231, 255, ${alpha * 0.9})`
      : `rgba(255, 248, 220, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.0 + Math.random() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Astrophysical Signature: Curved, Clumpy Edge-On Dust Torus
  // Sombrero's dust ring is an elliptical band of cold gas/dust silhouetted against the bulge.
  if (ctx.save) ctx.save();
  if (ctx.translate) ctx.translate(center, center);
  if (ctx.rotate) ctx.rotate(-0.04); // subtle astrophysical tilt angle

  const ringRadiusX = size * 0.44;
  const ringRadiusY = size * 0.085;

  // Draw organic dark absorption dust clouds along the front ellipse rim
  const dustParticles = 1400;
  for (let i = 0; i < dustParticles; i++) {
    // Concentrate along the front half of the ellipse (theta from 0 to PI)
    const u = Math.random();
    const theta = u * Math.PI + (Math.random() - 0.5) * 0.15;
    const radialJitter = (Math.random() - 0.5) * 8.0;

    const px = Math.cos(theta) * (ringRadiusX + radialJitter);
    const py = Math.sin(theta) * (ringRadiusY + radialJitter * 0.3) + 2.0;

    // Organic clumps of cold interstellar dust
    const dustAlpha = 0.65 + Math.random() * 0.35;
    const dustRadius = 2.5 + Math.random() * 5.5;

    const dustSpot = ctx.createRadialGradient(px, py, 0, px, py, dustRadius);
    dustSpot.addColorStop(0.0, `rgba(14, 8, 4, ${dustAlpha})`);
    dustSpot.addColorStop(0.6, `rgba(24, 14, 8, ${dustAlpha * 0.7})`);
    dustSpot.addColorStop(1.0, 'rgba(10, 5, 2, 0.0)');

    ctx.fillStyle = dustSpot;
    ctx.beginPath();
    ctx.arc(px, py, dustRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Star-forming clusters and H II knots embedded along the dust ring (Hubble Heritage PRC03-28)
  for (let j = 0; j < 120; j++) {
    const theta = Math.random() * Math.PI;
    const px = Math.cos(theta) * (ringRadiusX + (Math.random() - 0.5) * 6);
    const py = Math.sin(theta) * (ringRadiusY + (Math.random() - 0.5) * 3) + 1.5;

    ctx.fillStyle = (j % 3 === 0)
      ? 'rgba(244, 114, 182, 0.85)' // pinkish young H II nebula
      : 'rgba(186, 230, 253, 0.92)'; // luminous OB blue supergiant cluster
    ctx.beginPath();
    ctx.arc(px, py, 0.8 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (ctx.restore) ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 10. Triangulum Galaxy (M33) — Cyan/pink starburst face-on flocculent spiral
 */
export function generateTriangulumTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);

  // Diffuse Cyan Core
  const coreGrad = ctx.createRadialGradient(center, center, 2, center, center, size * 0.42);
  coreGrad.addColorStop(0.0, '#ffffff');
  coreGrad.addColorStop(0.15, '#cffafe');
  coreGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.28)');
  coreGrad.addColorStop(0.75, 'rgba(147, 51, 234, 0.12)');
  coreGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, size, size);

  // Flocculent multi-arm star clouds
  const stars = 2200;
  for (let i = 0; i < stars; i++) {
    const theta = Math.random() * Math.PI * 4;
    const r = 10 + Math.pow(Math.random(), 0.7) * (size * 0.42);
    const x = center + Math.cos(theta) * r + (Math.random() - 0.5) * 22;
    const y = center + Math.sin(theta) * (r * 0.85) + (Math.random() - 0.5) * 22;

    const alpha = Math.max(0, 1 - r / (size * 0.44));
    // Mix of luminous cyan OB associations and giant pink HII knots (NGC 604)
    if (i % 8 === 0) {
      ctx.fillStyle = `rgba(251, 113, 133, ${alpha * 0.95})`; // NGC 604 giant nebula
    } else {
      ctx.fillStyle = `rgba(165, 243, 252, ${alpha * 0.8})`; // Cyan star cloud
    }
    ctx.beginPath();
    ctx.arc(x, y, 1.3 + Math.random() * 2.0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

