# COSMOS — The Celestial Odyssey

[![Deploy to GitHub Pages](https://github.com/T0F1Q2007/cosmos-odyssey/actions/workflows/deploy.yml/badge.svg)](https://github.com/T0F1Q2007/cosmos-odyssey/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-live%20site-38bdf8?style=flat&logo=google-chrome&logoColor=white)](https://t0f1q2007.github.io/cosmos-odyssey/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/tests-15%20passed-success?logo=vitest&logoColor=white)](https://vitest.dev/)

An interactive, scroll-driven 3D cosmic journey traversing our Solar System and into the deep field of the Cosmic Web. Built with Three.js, GSAP ScrollTrigger, and the Web Audio API.

**[Explore the Live Interactive Experience](https://t0f1q2007.github.io/cosmos-odyssey/)**

---

## Overview

COSMOS Odyssey bridges scientific fidelity and cinematic interactive design. As the user navigates down the scroll timeline, the camera smoothly transitions from an expansive overview of the Solar System into close orbital tracking of every major celestial body, before climbing into macroscopic vantage points framing the Milky Way Galaxy and distant deep-sky spirals.

```
       [ Sun ] ──► [ Terrestrial Worlds ] ──► [ Gas & Ice Giants ] ──► [ Deep-Sky Cosmic Web ]
          │                  │                         │                          │
    NASA SDO AIA     Keplerian Orbits &         Cassini Rings &           M31, M51, M104, M33 &
  Plasma Granulation   Rayleigh Haloes           Methane Winds           Milky Way Barred Core
```

---

## Key Features

### 1. Multi-Spectral Solar Engine (NASA SDO Integration)
- **Photosphere & Chromosphere Shader**: Multi-spectral blending of NASA SDO AIA 304 Å (EUV He II plasma) and AIA 171 Å corona data.
- **Continuous 3D Convective Granulation**: Procedural 3D gradient simplex noise flowing across the solar surface without 2D UV seams or polar distortion.
- **Physical Limb Darkening**: Evaluated via the Eddington-Barbier solar law:
  $$I(\mu) = 1.0 - 0.64(1 - \mu) - 0.18(1 - \mu)^2 \quad \text{where } \mu = \cos(\theta)$$
- **Solar Flare Reconnection & Corona**: Volumetric Thomson electron scattering K-corona and coronal streamer helmet rays with dynamic additive blending.

### 2. Gravitational Keplerian Orbital Dynamics
- **Real-Time Orbital Revolution**: Planets revolve continuously around the Sun according to Kepler's Third Law:
  $$\omega(r) \propto r^{-3/2}$$
- **Natural Planetary Spacing**: Proportional orbital scaling preventing occlusion:
  - Mercury ($r = 5.2$), Venus ($r = 7.8$), Earth & Moon ($r = 10.8$), Mars ($r = 14.5$)
  - Jupiter ($r = 20.0$), Saturn ($r = 26.5$), Uranus ($r = 33.0$), Neptune ($r = 39.0$)
- **Dynamic Orbit-Locked Camera**: Camera computes dynamic sunlit approach vectors maintaining ~40° terminator phase angles, ensuring illuminated surface features remain in focus.

### 3. Luminous Icy Rings & Planetary Atmospheres
- **Saturn Ring Radiance**: Custom double-sided ring geometry featuring the Cassini Division with calibrated emissive scattering (`0xf6e6c4`), rendering ice particle forward/back-scattering visible across all camera elevations.
- **Earth Rayleigh Halo**: Custom atmospheric vertex/fragment shader simulating molecular blue Rayleigh scattering alongside rotating high-altitude cloud layers.

### 4. 3D Galactic Web & The Milky Way Finale
- **Non-Coplanar Galaxy Field**: Four distant galaxies dispersed across natural 3D celestial coordinates:
  - **Andromeda Galaxy (M31)**: Barred spiral approaching at blueshift inclination.
  - **Whirlpool Galaxy (M51)**: Grand-design spiral with H II starburst nurseries and dwarf companion NGC 5195.
  - **Sombrero Galaxy (M104)**: Massive nuclear bulge bisected by an organic cold dust absorption torus.
  - **Triangulum Galaxy (M33)**: Cyan flocculent spiral housing giant nebula NGC 604.
- **Milky Way Galaxy Focus (Our Home)**: Final scroll waypoint ascends to $(0, 115, 135)$ looking down at our home barred spiral galaxy, complete with the Sagittarius A* core and marked Orion-Cygnus Spur beacon.

### 5. Harmonic Ambient Web Audio Synthesizer
- **Pure Celestial Timbres**: Uses sine and soft triangle oscillators with Pythagorean harmonic intervals (pure fifths and octaves: 108 Hz, 162 Hz, 216 Hz).
- **Smooth Filter Dynamics**: Gentle 2-pole biquad lowpass filtering ($f_c \le 480$ Hz, $Q \le 0.9$) and subtle stellar breath pink noise floor ($\le 0.03$).
- **Context-Aware Audio Morphing**: Dynamically crossfades soundscape parameters as the user travels between planets and galaxies.

---

## Technical Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Core 3D Engine** | [Three.js r174](https://threejs.org/) | WebGL rendering, custom GLSL shaders, camera projection |
| **Scroll Animation** | [GSAP 3.12](https://gsap.com/) + ScrollTrigger | Smooth scrubbing, interpolation, waypoint triggers |
| **Audio Engine** | Web Audio API | Procedural soundscape synthesis without external audio files |
| **Bundler / Dev Server** | [Vite 5.4](https://vitejs.dev/) | HMR, production bundling, relative asset paths |
| **Testing** | [Vitest 2.1](https://vitest.dev/) | Automated unit testing for waypoints, audio profiles, shaders |
| **Deployment** | GitHub Actions & Pages | Automated CI/CD build and static hosting |

---

## Project Structure

```
cosmos-odyssey/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── docs/
│   └── solar_surface_and_corona_research.md # Astrophysical reference documentation
├── public/
│   └── textures/               # High-resolution photographic NASA textures
├── src/
│   ├── core/
│   │   ├── audio-engine.js     # Web Audio API celestial synthesizer
│   │   ├── texture-generator.js# Procedural texture generators & fallbacks
│   │   └── waypoint-manager.js # 3D camera navigation & waypoint scheduler
│   ├── main.js                 # Three.js scene, shaders, orbits & scroll loop
│   └── style.css               # Kinetic dark space typography & HUD styling
├── tests/
│   ├── audio-engine.test.js    # Unit tests for sound engine & profiles
│   ├── texture-generator.test.js# Tests for canvas procedural texture maps
│   └── waypoint-manager.test.js# Tests for waypoint navigation & camera poses
├── index.html                  # HTML entrypoint & diegetic telemetry cards
├── package.json
└── vite.config.js              # Vite configuration (base: './' for Pages)
```

---

## Getting Started

### Prerequisites
- Node.js 18.0 or newer
- npm 9.0 or newer

### Installation
```bash
# Clone repository
git clone https://github.com/T0F1Q2007/cosmos-odyssey.git

# Navigate into project
cd cosmos-odyssey

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Unit Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```
The compiled static assets will be output to the `dist/` directory.

---

## Deployment

> [!NOTE]
> This project is configured with `base: './'` in `vite.config.js`, enabling it to run seamlessly on any static host or subdirectory without path modifications.

Deployment to **GitHub Pages** is fully automated via GitHub Actions on every push to `main`:
1. Checks out repository and installs Node.js.
2. Executes production build (`npm run build`).
3. Packages and uploads `dist/` as a GitHub Pages artifact.
4. Deploys directly to the live environment.

