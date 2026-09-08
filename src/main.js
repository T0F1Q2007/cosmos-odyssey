import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cosmicAudio } from './core/audio-engine.js';
import { WaypointManager, WAYPOINTS } from './core/waypoint-manager.js';
import {
  generateEarthTexture,
  generateEarthClouds,
  generateJupiterTexture,
  generateMarsTexture,
  generateSaturnRingsTexture,
  generateAndromedaTexture,
  generateWhirlpoolTexture,
  generateSombreroTexture,
  generateTriangulumTexture,
  generateMilkyWayTexture
} from './core/texture-generator.js';

gsap.registerPlugin(ScrollTrigger);

// ─── Waypoint Manager & Audio Unlock ───────────────────────────────────────────
const waypointManager = new WaypointManager();

// Unlock Web Audio on first user interaction
['click', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach((evt) => {
  window.addEventListener(evt, () => cosmicAudio.unlock(), { once: true, passive: true });
});

// ─── Three.js Scene, Camera & Renderer ─────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010206);

// Camera begins far away at an expansive oblique perspective showing the Sun and planetary orbits
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 12.0, 24.0);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('webgl-canvas'),
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

// Post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.2;
bloomPass.strength = 1.2;
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);


// ─── High-Definition Texture Loading with Procedural Fallbacks ───────────────────
const textureLoader = new THREE.TextureLoader();

function loadTexture(url, fallbackTex) {
  const tex = textureLoader.load(
    url,
    (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.needsUpdate = true;
    },
    undefined,
    () => {
      // Keep procedural fallback on failure
    }
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex || fallbackTex;
}

// Fallback procedural maps
const earthFallback  = generateEarthTexture(1024, 512);
const cloudsFallback = generateEarthClouds(1024, 512);
const jupiterFallback= generateJupiterTexture(1024, 512);
const marsFallback   = generateMarsTexture(1024, 512);
const saturnRingFall = generateSaturnRingsTexture(1024, 2);

// Real NASA photographic maps
const sunTex     = loadTexture('./textures/sunmap.jpg', null);
const sdo304Tex  = loadTexture('./textures/nasa_sdo_304.jpg', null);
const sdo171Tex  = loadTexture('./textures/nasa_sdo_171.jpg', null);
const mercuryTex = loadTexture('./textures/mercurymap.jpg', null);
const venusTex   = loadTexture('./textures/venusmap.jpg', null);
const earthTex   = loadTexture('./textures/earthmap1k.jpg', earthFallback);
const earthCloud = loadTexture('./textures/earthcloudmap.jpg', cloudsFallback);
const earthSpec  = loadTexture('./textures/earthspec1k.jpg', null);
const moonTex    = loadTexture('./textures/moonmap1k.jpg', null);
const marsTex    = loadTexture('./textures/marsmap1k.jpg', marsFallback);
const jupiterTex = loadTexture('./textures/jupitermap.jpg', jupiterFallback);
const saturnTex  = loadTexture('./textures/saturnmap.jpg', null);
const saturnRingTex = loadTexture('./textures/saturnringcolor.jpg', saturnRingFall);
const uranusTex  = loadTexture('./textures/uranusmap.jpg', null);
const neptuneTex = loadTexture('./textures/neptunemap.jpg', null);

// ─── Physically Realistic Space Lighting ───────────────────────────────────────
// Soft celestial starlight & zodiacal fill light (keeps dark sides distinct and visible)
const ambientLight = new THREE.AmbientLight(0x283854, 0.85);
scene.add(ambientLight);

// Primary Sun Radiance: physically based inverse-square point light at (0, 0, 0)
const sunPointLight = new THREE.PointLight(0xfff8ea, 6.0, 500, 0.35);
sunPointLight.position.set(0, 0, 0);
scene.add(sunPointLight);

// Subtle deep-space fill light
const spaceFillLight = new THREE.DirectionalLight(0x223348, 0.45);
spaceFillLight.position.set(-20, 15, -20);
scene.add(spaceFillLight);

// ─── 1. The Sun: NASA SDO Authentic Multi-Spectral Star ───────────────────────
const sunGroup = new THREE.Group();
scene.add(sunGroup);

// Solar Photosphere / Chromosphere Shader
// Blends NASA SDO AIA 304 Å chromo-plasma with continuous 3D procedural convection turbulence
const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunFragmentShader = `
  uniform sampler2D uSunMap;
  uniform sampler2D uSdo304;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // 3D procedural gradient noise (Seamless over sphere, 0 UV distortion)
  float hash3D(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3D(vec3 x) {
    vec3 p = floor(x);
    vec3 w = fract(x);
    vec3 u = w * w * (3.0 - 2.0 * w);
    float n000 = hash3D(p + vec3(0.0, 0.0, 0.0));
    float n100 = hash3D(p + vec3(1.0, 0.0, 0.0));
    float n010 = hash3D(p + vec3(0.0, 1.0, 0.0));
    float n110 = hash3D(p + vec3(1.0, 1.0, 0.0));
    float n001 = hash3D(p + vec3(0.0, 0.0, 1.0));
    float n101 = hash3D(p + vec3(1.0, 0.0, 1.0));
    float n011 = hash3D(p + vec3(0.0, 1.0, 1.0));
    float n111 = hash3D(p + vec3(1.0, 1.0, 1.0));
    return mix(
      mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
      mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
      u.z
    );
  }

  float fbm3D(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise3D(p);
      p = p * 2.08;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPosition);

    // 1. Solar differential rotation (equator faster than poles)
    float latFactor = 1.0 - 0.28 * pow(abs(p.y), 1.8);
    vec2 rotUv = vUv + vec2(uTime * 0.006 * latFactor, 0.0);
    vec4 nasaPhotosphere = texture2D(uSunMap, rotUv);
    vec4 nasaSdo = texture2D(uSdo304, vUv);

    // 2. Continuous 3D Convective Plasma Flow (Fluid boiling granulation)
    vec3 flowPos = p * 5.2 + vec3(uTime * 0.04, uTime * 0.02, -uTime * 0.035);
    float turb1 = fbm3D(flowPos);
    float turb2 = fbm3D(flowPos * 2.1 + vec3(turb1 * 0.75));
    float convection = pow(turb1 * 0.6 + turb2 * 0.4, 1.15);

    // 3. Blackbody Color Temperature Ramp:
    // Sinking intergranular channels (5,200 K) -> Granule centers (6,200 K) -> Flare incandescent (>6,800 K)
    vec3 colDarkLane = vec3(0.88, 0.22, 0.02);
    vec3 colGranule  = vec3(1.00, 0.76, 0.22);
    vec3 colHotCore  = vec3(1.00, 0.96, 0.88);

    vec3 plasmaColor = mix(colDarkLane, colGranule, convection);
    plasmaColor = mix(plasmaColor, colHotCore, pow(convection, 3.2) * 0.85);

    // 4. Blend with NASA SDO Observations
    if (nasaPhotosphere.r > 0.02) {
      plasmaColor = mix(plasmaColor, nasaPhotosphere.rgb * vec3(1.35, 1.05, 0.75), 0.42);
    }
    if (nasaSdo.r > 0.02) {
      plasmaColor += nasaSdo.rgb * vec3(0.5, 0.28, 0.08) * 0.35;
    }

    // 5. Dynamic 3D Solar Flares & Magnetic Reconnection
    float flare1 = pow(max(0.0, sin(p.x * 3.5 + p.y * 2.8 + uTime * 0.8)), 16.0);
    float flare2 = pow(max(0.0, cos(p.z * 4.0 - p.x * 2.2 + uTime * 0.6)), 18.0);
    float flareActive = (flare1 + flare2) * 2.5;
    plasmaColor += flareActive * vec3(1.0, 0.98, 0.92);

    // 6. Physical Eddington-Barbier Limb Darkening Law
    // I(mu) = 1.0 - 0.64(1 - mu) - 0.18(1 - mu)^2 where mu = cos(theta)
    float mu = max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    float limbDarkening = 1.0 - 0.64 * (1.0 - mu) - 0.18 * pow(1.0 - mu, 2.0);
    plasmaColor *= clamp(limbDarkening, 0.25, 1.0);

    // 7. Blazing Chromospheric Limb Ring (EUV 304 Å limb emission)
    plasmaColor += pow(1.0 - mu, 3.0) * vec3(1.0, 0.45, 0.08) * 3.2;

    gl_FragColor = vec4(plasmaColor, 1.0);
  }
`;

const sunMaterial = new THREE.ShaderMaterial({
  vertexShader: sunVertexShader,
  fragmentShader: sunFragmentShader,
  uniforms: {
    uSunMap: { value: sunTex },
    uSdo304: { value: sdo304Tex },
    uTime: { value: 0 }
  }
});

const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(1.68, 64, 64), sunMaterial);
sunGroup.add(sunMesh);

// Inner Luminous K-Corona (Thomson electron scattering r^-6 falloff)
const coronaMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.76 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
      gl_FragColor = vec4(1.0, 0.68, 0.22, 1.0) * intensity * 2.8;
    }
  `,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true
});
const coronaMesh = new THREE.Mesh(new THREE.SphereGeometry(2.18, 48, 48), coronaMaterial);
sunGroup.add(coronaMesh);

// Outer Solar Wind Helmet Streamer Rays
const outerCoronaMat = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
      gl_FragColor = vec4(1.0, 0.52, 0.12, 0.6) * intensity * 1.8;
    }
  `,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true
});
const outerCoronaMesh = new THREE.Mesh(new THREE.SphereGeometry(2.82, 48, 48), outerCoronaMat);
sunGroup.add(outerCoronaMesh);

// ─── 2. Planetary System with Increased Framing Distance & Real Textures ────────
const planets = [];

function createOrbitTrack(radius) {
  const points = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.18
  });
  const line = new THREE.Line(geo, mat);
  scene.add(line);
  return line;
}

const planetDefinitions = [
  {
    id: 'mercury',
    name: 'Mercury',
    radius: 0.25,
    orbitRadius: 5.2,
    orbitalAngle: 0.6,
    orbitalSpeed: 0.052,
    camDist: 3.5,
    camElevation: 1.2,
    texture: mercuryTex,
    roughness: 0.88,
    metalness: 0.08,
    spinSpeed: 0.008,
    tilt: 0.034
  },
  {
    id: 'venus',
    name: 'Venus',
    radius: 0.40,
    orbitRadius: 7.8,
    orbitalAngle: 1.8,
    orbitalSpeed: 0.032,
    camDist: 4.0,
    camElevation: 1.3,
    texture: venusTex,
    roughness: 0.35,
    metalness: 0.05,
    spinSpeed: -0.006, // Super-rotation retrograde
    tilt: 3.1
  },
  {
    id: 'earth',
    name: 'Earth',
    radius: 0.45,
    orbitRadius: 10.8,
    orbitalAngle: 3.4,
    orbitalSpeed: 0.022,
    camDist: 4.5,
    camElevation: 1.5,
    texture: earthTex,
    specularMap: earthSpec,
    roughness: 0.45,
    metalness: 0.1,
    spinSpeed: 0.016,
    tilt: 0.41,
    hasAtmosphere: true,
    hasMoon: true
  },
  {
    id: 'mars',
    name: 'Mars',
    radius: 0.30,
    orbitRadius: 14.5,
    orbitalAngle: 4.8,
    orbitalSpeed: 0.015,
    camDist: 4.0,
    camElevation: 1.3,
    texture: marsTex,
    roughness: 0.78,
    metalness: 0.12,
    spinSpeed: 0.015,
    tilt: 0.44
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radius: 1.05,
    orbitRadius: 20.0,
    orbitalAngle: 0.2,
    orbitalSpeed: 0.0078,
    camDist: 7.5,
    camElevation: 2.5,
    texture: jupiterTex,
    roughness: 0.4,
    metalness: 0.02,
    spinSpeed: 0.028,
    tilt: 0.05
  },
  {
    id: 'saturn',
    name: 'Saturn',
    radius: 0.88,
    orbitRadius: 26.5,
    orbitalAngle: 2.3,
    orbitalSpeed: 0.0050,
    camDist: 9.0,
    camElevation: 3.0,
    texture: saturnTex,
    roughness: 0.5,
    metalness: 0.05,
    spinSpeed: 0.024,
    tilt: 0.47,
    hasRings: true
  },
  {
    id: 'uranus',
    name: 'Uranus',
    radius: 0.55,
    orbitRadius: 33.0,
    orbitalAngle: 4.0,
    orbitalSpeed: 0.0032,
    camDist: 5.2,
    camElevation: 1.8,
    texture: uranusTex,
    roughness: 0.4,
    metalness: 0.05,
    spinSpeed: 0.018,
    tilt: 1.71 // 97.8° extreme roll
  },
  {
    id: 'neptune',
    name: 'Neptune',
    radius: 0.52,
    orbitRadius: 39.0,
    orbitalAngle: 5.6,
    orbitalSpeed: 0.0022,
    camDist: 5.2,
    camElevation: 1.8,
    texture: neptuneTex,
    roughness: 0.38,
    metalness: 0.05,
    spinSpeed: 0.020,
    tilt: 0.49
  }
];

planetDefinitions.forEach((def) => {
  createOrbitTrack(def.orbitRadius);

  const group = new THREE.Group();
  group.position.set(
    Math.cos(def.orbitalAngle) * def.orbitRadius,
    0,
    Math.sin(def.orbitalAngle) * def.orbitRadius
  );
  scene.add(group);

  const matConfig = {
    map: def.texture,
    roughness: def.roughness || 0.5,
    metalness: def.metalness || 0.05
  };
  if (def.specularMap) {
    matConfig.roughnessMap = def.specularMap;
  }

  const mat = new THREE.MeshStandardMaterial(matConfig);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.radius, 48, 48), mat);
  mesh.rotation.z = def.tilt;
  group.add(mesh);

  // Moons for Jupiter and Saturn
  if (def.id === 'jupiter') {
    const europaMat = new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 0.8 });
    const europaMesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), europaMat);
    europaMesh.position.set(1.8, 0, 0);
    group.add(europaMesh);
    group.userData.europa = europaMesh;
  }
  if (def.id === 'saturn') {
    const titanMat = new THREE.MeshStandardMaterial({ color: 0xeecc77, roughness: 0.9 });
    const titanMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), titanMat);
    titanMesh.position.set(3.2, 0.2, 0);
    group.add(titanMesh);
    group.userData.titan = titanMesh;
  }

  // Earth Atmosphere, Dynamic Clouds & Moon
  if (def.hasAtmosphere) {
    // 1. Dynamic Rotating Clouds Sphere
    const cloudMat = new THREE.MeshStandardMaterial({
      map: earthCloud,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(def.radius * 1.02, 48, 48), cloudMat);
    mesh.add(cloudMesh);
    group.userData.clouds = cloudMesh;

    // 2. Rayleigh Atmospheric Blue Glow Halo
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0) * intensity * 1.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmoMesh = new THREE.Mesh(new THREE.SphereGeometry(def.radius * 1.045, 48, 48), atmoMat);
    mesh.add(atmoMesh);

    // 3. Luna (The Moon) with NASA lunar map revolving around Earth
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.92,
      metalness: 0.08
    });
    const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), moonMat);
    moonMesh.position.set(1.15, 0.18, 0);
    group.add(moonMesh);
    group.userData.moon = moonMesh;
  }

  // Saturn Photorealistic Rings (with Cassini Division & Radial UVs)
  if (def.hasRings) {
    const innerR = 1.25;
    const outerR = 2.55;
    const ringGeo = new THREE.RingGeometry(innerR, outerR, 96);
    ringGeo.rotateX(Math.PI / 2);

    const posAttr = ringGeo.attributes.position;
    const uvAttr = ringGeo.attributes.uv;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const r = Math.sqrt(vx * vx + vz * vz);
      const u = (r - innerR) / (outerR - innerR);
      uvAttr.setXY(i, u, 0.5);
    }
    uvAttr.needsUpdate = true;

    const ringMat = new THREE.MeshStandardMaterial({
      map: saturnRingTex,
      emissive: new THREE.Color(0xf6e6c4),
      emissiveMap: saturnRingTex,
      emissiveIntensity: 0.88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.96,
      roughness: 0.45,
      metalness: 0.05
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.z = def.tilt;
    group.add(ringMesh);
  }

  planets.push({
    def,
    group,
    mesh,
    orbitalAngle: def.orbitalAngle
  });
});

// ─── 3. Starfield Background (Multi-spectral stellar field) ────────────────────
const starCount = 6500;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starCols = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const r = 250 + Math.random() * 500;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);

  starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPos[i * 3 + 2] = r * Math.cos(phi);

  const starType = Math.random();
  if (starType > 0.85) {
    starCols[i * 3] = 0.65; starCols[i * 3 + 1] = 0.8; starCols[i * 3 + 2] = 1.0;
  } else if (starType > 0.6) {
    starCols[i * 3] = 1.0; starCols[i * 3 + 1] = 0.85; starCols[i * 3 + 2] = 0.65;
  } else {
    starCols[i * 3] = 0.95; starCols[i * 3 + 1] = 0.95; starCols[i * 3 + 2] = 1.0;
  }
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

const starMat = new THREE.PointsMaterial({
  size: 1.1,
  vertexColors: true,
  transparent: true,
  opacity: 0.95
});
scene.add(new THREE.Points(starGeo, starMat));

// ─── 4. High-Resolution Distant Galaxies (Dispersed across 3D Cosmic Space) ─────
const andromedaTex = generateAndromedaTexture(1024);
const whirlpoolTex = generateWhirlpoolTexture(1024);
const sombreroTex  = generateSombreroTexture(1024);
const triangulumTex= generateTriangulumTexture(1024);

// Naturally dispersed across 3D space with non-coplanar depths and varying elevations
const galaxyObjects = [
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy (M31)',
    meta: '2.537 Mly • SA(s)b Barred Spiral',
    pos: new THREE.Vector3(-95, 48, -145),
    texture: andromedaTex,
    size: 54,
    rotation: -0.35
  },
  {
    id: 'whirlpool',
    name: 'Whirlpool Galaxy (M51)',
    meta: '23.16 Mly • SA(s)bc Grand Design',
    pos: new THREE.Vector3(25, 95, -170),
    texture: whirlpoolTex,
    size: 56,
    rotation: 0.42
  },
  {
    id: 'sombrero',
    name: 'Sombrero Galaxy (M104)',
    meta: '31.13 Mly • SA(s)a Dark Dust Ring',
    pos: new THREE.Vector3(125, -55, -85),
    texture: sombreroTex,
    size: 48,
    rotation: -0.15
  },
  {
    id: 'triangulum',
    name: 'Triangulum Galaxy (M33)',
    meta: '2.73 Mly • SA(s)cd Flocculent Spiral',
    pos: new THREE.Vector3(-135, 12, -75),
    texture: triangulumTex,
    size: 40,
    rotation: 0.25
  }
];

galaxyObjects.forEach((g) => {
  const planeGeo = new THREE.PlaneGeometry(g.size, g.size);
  const planeMat = new THREE.MeshBasicMaterial({
    map: g.texture,
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.position.copy(g.pos);
  mesh.rotation.z = g.rotation || 0;
  // Face towards approaching camera flight vector
  mesh.lookAt(g.pos.x, g.pos.y + 2, g.pos.z + 60);
  scene.add(mesh);
  g.mesh = mesh;
});

// ─── 4b. The Milky Way Galaxy (Our Home Galaxy Disc) ──────────────────────────
const milkyWayTex = generateMilkyWayTexture(1024);
const milkyWayGeo = new THREE.PlaneGeometry(160, 160);
const milkyWayMat = new THREE.MeshBasicMaterial({
  map: milkyWayTex,
  transparent: true,
  opacity: 0.15,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide
});
const milkyWayMesh = new THREE.Mesh(milkyWayGeo, milkyWayMat);
milkyWayMesh.rotation.x = Math.PI / 2;
milkyWayMesh.position.set(0, -6, 0);
scene.add(milkyWayMesh);

// ─── 5. Diegetic Planetary Telemetry Cards ─────────────────────────────────────
const cardSun        = document.getElementById('card-sun');
const cardMercury    = document.getElementById('card-mercury');
const cardEarth      = document.getElementById('card-earth');
const cardMars       = document.getElementById('card-mars');
const cardJupiter    = document.getElementById('card-jupiter');
const cardSaturn     = document.getElementById('card-saturn');
const cardIce        = document.getElementById('card-ice');
const cardAndromeda  = document.getElementById('card-andromeda');
const cardWhirlpool  = document.getElementById('card-whirlpool');
const cardSombrero   = document.getElementById('card-sombrero');
const cardTriangulum = document.getElementById('card-triangulum');
const cardDeepSky    = document.getElementById('card-deep-sky');

const cardsMap = {
  'sun': cardSun,
  'mercury': cardMercury,
  'venus': cardMercury,
  'earth': cardEarth,
  'mars': cardMars,
  'jupiter': cardJupiter,
  'saturn': cardSaturn,
  'ice-giants': cardIce,
  'andromeda': cardAndromeda,
  'whirlpool': cardWhirlpool,
  'sombrero': cardSombrero,
  'triangulum': cardTriangulum,
  'deep-sky': cardDeepSky
};

const scrollFill = document.getElementById('scrollProgressFill');
const scrollHint = document.getElementById('scrollHint');

let activeWaypointId = 'overview';

function updateWaypointUI(progress) {
  // If at the initial overview before scrolling into the Sun:
  if (progress < 0.025) {
    Object.values(cardsMap).forEach((c) => {
      if (c) c.classList.remove('active');
    });
    if (activeWaypointId !== 'overview') {
      activeWaypointId = 'overview';
      cosmicAudio.setCelestialBody('sun');
    }
    return;
  }

  const currentWp = waypointManager.getWaypointAtProgress(progress);

  // Update Active Telemetry Card
  Object.values(cardsMap).forEach((c) => {
    if (c) c.classList.remove('active');
  });
  const activeCard = cardsMap[currentWp.id];
  if (activeCard) {
    activeCard.classList.add('active');
  }

  // Dynamic Audio Profile Morphing
  if (activeWaypointId !== currentWp.id) {
    activeWaypointId = currentWp.id;
    cosmicAudio.setCelestialBody(currentWp.id);
  }
}

// ─── 6. Dynamic Camera Navigation & Sunlit Planetary Framing ───────────────────
const cameraLookAt = new THREE.Vector3(0, 0, 0);
let scrollProgress = 0;
let smoothScrollProgress = 0;

ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.2,
  onUpdate: (self) => {
    scrollProgress = self.progress;
    if (scrollFill) {
      scrollFill.style.height = `${self.progress * 100}%`;
    }
    if (scrollHint) {
      scrollHint.style.opacity = self.progress > 0.02 ? '0' : '0.85';
    }
    updateWaypointUI(self.progress);
  }
});

// Helper: Compute sunlit camera position for an orbiting planet
// Approaches from ~40° terminator phase angle so the planet's sunlit hemisphere is always front and center
function computeSunlitCamPos(p) {
  const pos = p.group.position;
  const r = pos.clone().normalize(); // Vector from Sun (0,0,0) to planet
  const t = new THREE.Vector3(-r.z, 0, r.x); // Orbital tangent
  // Offset backwards toward the Sun (-0.55), along tangent (0.75), and elevated (+y)
  return pos.clone()
    .add(r.clone().multiplyScalar(-p.def.camDist * 0.55))
    .add(t.clone().multiplyScalar(p.def.camDist * 0.75))
    .add(new THREE.Vector3(0, p.def.camElevation, 0));
}

const waypointTimelineSchedule = [
  { id: 'sun', p: 0.04 },
  { id: 'mercury', p: 0.16 },
  { id: 'venus', p: 0.24 },
  { id: 'earth', p: 0.33 },
  { id: 'mars', p: 0.42 },
  { id: 'jupiter', p: 0.52 },
  { id: 'saturn', p: 0.65 },
  { id: 'ice-giants', p: 0.76 },
  { id: 'andromeda', p: 0.82 },
  { id: 'whirlpool', p: 0.87 },
  { id: 'sombrero', p: 0.92 },
  { id: 'triangulum', p: 0.95 },
  { id: 'deep-sky', p: 0.99 }
];

function getPoseForWaypoint(id, prog) {
  if (id === 'sun') {
    const target = new THREE.Vector3(0, 0, 0);
    // Smooth transition from initial wide overview (0, 12.0, 24.0) to stellar focus (0, 2.5, 9.5)
    const t = Math.min(1.0, Math.max(0.0, (prog - 0.012) / 0.045));
    const camPos = new THREE.Vector3(0, 12.0, 24.0).lerp(new THREE.Vector3(0, 2.5, 9.5), t);
    return { target, camPos };
  }

  if (id === 'deep-sky') {
    // Macroscopic vantage point overlooking The Milky Way Galaxy (Our Home) from above
    return {
      target: new THREE.Vector3(0, 0, 0),
      camPos: new THREE.Vector3(0, 115, 135)
    };
  }

  // Check galaxies
  const galaxy = galaxyObjects.find((g) => g.id === id);
  if (galaxy) {
    const wp = waypointManager.getTargetPose(id);
    return {
      target: new THREE.Vector3(wp.focusTarget.x, wp.focusTarget.y, wp.focusTarget.z),
      camPos: new THREE.Vector3(wp.cameraOffset.x, wp.cameraOffset.y, wp.cameraOffset.z)
    };
  }

  if (id === 'ice-giants') {
    const uranus = planets.find((p) => p.def.id === 'uranus');
    if (uranus) {
      return {
        target: uranus.group.position.clone(),
        camPos: computeSunlitCamPos(uranus)
      };
    }
  }

  // Planet
  const planet = planets.find((p) => p.def.id === id);
  if (planet) {
    return {
      target: planet.group.position.clone(),
      camPos: computeSunlitCamPos(planet)
    };
  }

  return {
    target: new THREE.Vector3(0, 0, 0),
    camPos: new THREE.Vector3(0, 12.0, 24.0)
  };
}

function computeCameraTargetAndPos(prog) {
  const sched = waypointTimelineSchedule;

  if (prog <= sched[0].p) {
    return getPoseForWaypoint(sched[0].id, prog);
  }
  if (prog >= sched[sched.length - 1].p) {
    return getPoseForWaypoint(sched[sched.length - 1].id, prog);
  }

  for (let i = 0; i < sched.length - 1; i++) {
    if (prog >= sched[i].p && prog <= sched[i + 1].p) {
      const wA = sched[i];
      const wB = sched[i + 1];
      const rawT = (prog - wA.p) / (wB.p - wA.p);
      // Smooth Hermite cubic ease
      const s = rawT * rawT * (3.0 - 2.0 * rawT);

      const poseA = getPoseForWaypoint(wA.id, prog);
      const poseB = getPoseForWaypoint(wB.id, prog);

      const target = poseA.target.clone().lerp(poseB.target, s);
      const camPos = poseA.camPos.clone().lerp(poseB.camPos, s);
      return { target, camPos };
    }
  }

  return getPoseForWaypoint('sun', 0);
}

// ─── 7. 15-Second Deep Sky Discovery Engine ───────────────────────────────────
const discoveryToast = document.getElementById('discoveryToast');
const deepSkyMarkers = document.querySelectorAll('.galaxy-reticle-marker');

let elapsedSeconds = 0;
let surveyActive = false;

setInterval(() => {
  elapsedSeconds++;

  if (elapsedSeconds >= 15 && !surveyActive) {
    surveyActive = true;
    if (discoveryToast) {
      discoveryToast.classList.add('show');
      setTimeout(() => discoveryToast.classList.remove('show'), 6000);
    }
    deepSkyMarkers.forEach((m) => m.classList.add('visible'));
  }
}, 1000);

const projVec = new THREE.Vector3();

function updateScreenTracking() {
  if (surveyActive) {
    galaxyObjects.forEach((g) => {
      const el = document.getElementById(`marker-${g.id}`);
      if (!el) return;
      projVec.copy(g.mesh.position);
      projVec.project(camera);
      if (projVec.z < 1.0) {
        const sx = (projVec.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-(projVec.y * 0.5) + 0.5) * window.innerHeight;
        el.style.left = `${sx}px`;
        el.style.top = `${sy}px`;
      }
    });
  }
}

// ─── 8. Web Audio Mute Button & Volume Slider Integration ─────────────────────
const audioBtn = document.getElementById('audioToggleBtn');
const audioStatus = document.getElementById('audioStatus');
const audioVolSlider = document.getElementById('audioVolSlider');

if (audioBtn) {
  audioBtn.addEventListener('click', () => {
    const isPlaying = cosmicAudio.toggle();
    if (isPlaying) {
      audioBtn.classList.add('playing');
      if (audioStatus) audioStatus.innerText = 'AUDIO: LIVE';
    } else {
      audioBtn.classList.remove('playing');
      if (audioStatus) audioStatus.innerText = 'AUDIO: MUTED';
    }
  });
}

if (audioVolSlider) {
  audioVolSlider.addEventListener('input', (e) => {
    cosmicAudio.setVolume(parseFloat(e.target.value));
  });
}

// ─── Asteroid Belt & Comets ───────────────────────────────────────────────────
const asteroidCount = 1200;
const asteroidGeo = new THREE.DodecahedronGeometry(0.04, 0);
const asteroidMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, metalness: 0.1 });
const asteroidMesh = new THREE.InstancedMesh(asteroidGeo, asteroidMat, asteroidCount);
const dummy = new THREE.Object3D();
const asteroidData = [];
for (let i = 0; i < asteroidCount; i++) {
  const r = 12.0 + Math.random() * 2.0;
  const theta = Math.random() * Math.PI * 2;
  const y = (Math.random() - 0.5) * 0.8;
  const speed = (0.01 + Math.random() * 0.01);
  asteroidData.push({ r, theta, y, speed });
  dummy.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
  dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  const scale = 0.5 + Math.random();
  dummy.scale.set(scale, scale, scale);
  dummy.updateMatrix();
  asteroidMesh.setMatrixAt(i, dummy.matrix);
}
scene.add(asteroidMesh);

const cometCount = 5;
const comets = [];
for (let i = 0; i < cometCount; i++) {
  const cometGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const cometMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x2288ff });
  const comet = new THREE.Mesh(cometGeo, cometMat);
  comet.userData = {
    angle: Math.random() * Math.PI * 2,
    speed: 0.005 + Math.random() * 0.005,
    a: 25 + Math.random() * 10, // semi-major axis
    e: 0.6 + Math.random() * 0.3, // eccentricity
    tilt: (Math.random() - 0.5) * 0.5 // orbital tilt
  };
  comets.push(comet);
  scene.add(comet);
}

// ─── 9. Real-Time Animation Loop (Gravitation & Orbital Tracking) ─────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // 1. Animate Sun Photosphere Shader & Solar Rotation
  sunMaterial.uniforms.uTime.value = time;
  sunGroup.rotation.y = time * 0.025;

  // 2. Gravitational Keplerian Orbital Revolution & Axial Spin for Planets
  planets.forEach((p) => {
    p.orbitalAngle += p.def.orbitalSpeed * (delta * 60) * 0.005;
    p.group.position.set(
      Math.cos(p.orbitalAngle) * p.def.orbitRadius,
      0,
      Math.sin(p.orbitalAngle) * p.def.orbitRadius
    );
    p.mesh.rotation.y += p.def.spinSpeed * (delta * 60);

    // Dynamic Earth Clouds & Revolving Moon
    if (p.group.userData.clouds) {
      p.group.userData.clouds.rotation.y += 0.0018;
    }
    if (p.group.userData.moon) {
      const moonAngle = time * 0.45;
      p.group.userData.moon.position.set(
        Math.cos(moonAngle) * 1.15,
        Math.sin(moonAngle * 0.25) * 0.18,
        Math.sin(moonAngle) * 1.15
      );
      p.group.userData.moon.rotation.y += 0.005;
    }

    if (p.group.userData.europa) {
      const europaAngle = time * 0.6;
      p.group.userData.europa.position.set(
        Math.cos(europaAngle) * 1.8,
        0,
        Math.sin(europaAngle) * 1.8
      );
    }
    if (p.group.userData.titan) {
      const titanAngle = time * 0.35;
      p.group.userData.titan.position.set(
        Math.cos(titanAngle) * 3.2,
        0.2,
        Math.sin(titanAngle) * 3.2
      );
    }
  });

  // Animate Asteroids
  for (let i = 0; i < asteroidCount; i++) {
    const data = asteroidData[i];
    data.theta += data.speed * delta;
    dummy.position.set(Math.cos(data.theta) * data.r, data.y, Math.sin(data.theta) * data.r);
    asteroidMesh.getMatrixAt(i, dummy.matrix);
    dummy.updateMatrix();
    asteroidMesh.setMatrixAt(i, dummy.matrix);
  }
  asteroidMesh.instanceMatrix.needsUpdate = true;

  // Animate Comets
  comets.forEach(comet => {
    comet.userData.angle += comet.userData.speed * delta * 60;
    const a = comet.userData.a;
    const e = comet.userData.e;
    const theta = comet.userData.angle;
    const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
    comet.position.set(
      Math.cos(theta) * r,
      Math.sin(theta) * r * comet.userData.tilt,
      Math.sin(theta) * r
    );
  });

  // 3. Smooth Camera Navigation Locked to Active Orbiting Targets
  smoothScrollProgress += (scrollProgress - smoothScrollProgress) * 0.06;
  const { target, camPos } = computeCameraTargetAndPos(smoothScrollProgress);
  camera.position.lerp(camPos, 0.08);
  cameraLookAt.lerp(target, 0.08);
  camera.lookAt(cameraLookAt);

  // Dynamic Milky Way disc opacity based on camera altitude / scroll progress
  if (smoothScrollProgress > 0.75) {
    const fade = Math.min(1.0, (smoothScrollProgress - 0.75) / 0.22);
    milkyWayMat.opacity = 0.15 + 0.80 * fade;
  } else {
    milkyWayMat.opacity = 0.15;
  }
  milkyWayMesh.rotation.z += 0.0003;

  // 4. Update Screen Tracking for Galaxy Reticles
  updateScreenTracking();

  composer.render();
}

animate();

// Window resize handler
window.addEventListener('resize', () => {
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if(typeof composer !== 'undefined') composer.setSize(window.innerWidth, window.innerHeight);

});


