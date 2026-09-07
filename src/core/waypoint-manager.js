/**
 * WaypointManager — Deep Module for Celestial Navigation & Target Locking
 * Computes exact 3D focus coordinates, camera framing offsets, and target lock state
 * for all solar system bodies and distant deep-sky objects.
 */

export const WAYPOINTS = [
  {
    id: 'sun',
    name: 'The Sun',
    subtitle: 'Stellar Anchor • Solar System Overview',
    minProgress: 0.0,
    maxProgress: 0.12,
    targetProgress: 0.05,
    focusTarget: { x: 0, y: 0, z: 0 },
    cameraOffset: { x: 0, y: 8.5, z: 18.0 },
    isLocked: true,
    scale: 1.65
  },
  {
    id: 'mercury',
    name: 'Mercury',
    subtitle: 'Innermost Terrestrial • Cratered Basalt',
    minProgress: 0.12,
    maxProgress: 0.20,
    targetProgress: 0.16,
    focusTarget: { x: 2.3, y: 0.1, z: 1.6 },
    cameraOffset: { x: 4.2, y: 1.2, z: 3.5 },
    isLocked: true,
    scale: 0.25
  },
  {
    id: 'venus',
    name: 'Venus',
    subtitle: 'Greenhouse Furnace • Sulfuric Cloud Deck',
    minProgress: 0.20,
    maxProgress: 0.28,
    targetProgress: 0.24,
    focusTarget: { x: -0.9, y: 0.0, z: 4.0 },
    cameraOffset: { x: -0.2, y: 1.2, z: 6.8 },
    isLocked: true,
    scale: 0.40
  },
  {
    id: 'earth',
    name: 'Terra (Earth & Moon)',
    subtitle: 'Habitable Oasis • Dynamic Oceans & Atmosphere',
    minProgress: 0.28,
    maxProgress: 0.38,
    targetProgress: 0.33,
    focusTarget: { x: -5.4, y: 0.0, z: -1.5 },
    cameraOffset: { x: -4.0, y: 1.5, z: 1.8 },
    isLocked: true,
    scale: 0.45
  },
  {
    id: 'mars',
    name: 'Mars',
    subtitle: 'The Rust Frontier • Olympus Mons & Polar Ice',
    minProgress: 0.38,
    maxProgress: 0.46,
    targetProgress: 0.42,
    focusTarget: { x: 1.4, y: 0.0, z: 7.1 },
    cameraOffset: { x: 2.8, y: 1.2, z: 9.8 },
    isLocked: true,
    scale: 0.30
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    subtitle: 'King of Planets • Great Red Spot Anticyclone',
    minProgress: 0.46,
    maxProgress: 0.58,
    targetProgress: 0.52,
    focusTarget: { x: 9.6, y: 0.0, z: 1.9 },
    cameraOffset: { x: 7.5, y: 2.4, z: 6.8 },
    isLocked: true,
    scale: 1.05
  },
  {
    id: 'saturn',
    name: 'Saturn',
    subtitle: 'Ringed Majesty • Cassini Division & Icy Rings',
    minProgress: 0.58,
    maxProgress: 0.73,
    targetProgress: 0.65,
    focusTarget: { x: -8.7, y: 0.0, z: 9.6 },
    cameraOffset: { x: -6.5, y: 3.0, z: 15.8 },
    isLocked: true,
    scale: 0.88
  },
  {
    id: 'ice-giants',
    name: 'Uranus & Neptune',
    subtitle: 'Outer Fringe • Supersonic Methane Winds',
    minProgress: 0.73,
    maxProgress: 0.80,
    targetProgress: 0.76,
    focusTarget: { x: -9.4, y: 0.0, z: -13.6 },
    cameraOffset: { x: -7.5, y: 2.0, z: -9.8 },
    isLocked: true,
    scale: 0.55
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy (M31)',
    subtitle: '2.537 Mly • SA(s)b Tilted Giant Spiral',
    minProgress: 0.80,
    maxProgress: 0.85,
    targetProgress: 0.82,
    focusTarget: { x: -95, y: 48, z: -145 },
    cameraOffset: { x: -95, y: 50, z: -88 },
    isLocked: true,
    scale: 54.0
  },
  {
    id: 'whirlpool',
    name: 'Whirlpool Galaxy (M51)',
    subtitle: '23.16 Mly • SA(s)bc Grand-Design Spiral',
    minProgress: 0.85,
    maxProgress: 0.90,
    targetProgress: 0.87,
    focusTarget: { x: 25, y: 95, z: -170 },
    cameraOffset: { x: 25, y: 97, z: -110 },
    isLocked: true,
    scale: 56.0
  },
  {
    id: 'sombrero',
    name: 'Sombrero Galaxy (M104)',
    subtitle: '31.13 Mly • SA(s)a Dark Dust Ring Bulge',
    minProgress: 0.90,
    maxProgress: 0.94,
    targetProgress: 0.92,
    focusTarget: { x: 125, y: -55, z: -85 },
    cameraOffset: { x: 125, y: -53, z: -35 },
    isLocked: true,
    scale: 48.0
  },
  {
    id: 'triangulum',
    name: 'Triangulum Galaxy (M33)',
    subtitle: '2.73 Mly • SA(s)cd Flocculent Spiral',
    minProgress: 0.94,
    maxProgress: 0.97,
    targetProgress: 0.95,
    focusTarget: { x: -135, y: 12, z: -75 },
    cameraOffset: { x: -135, y: 14, z: -25 },
    isLocked: true,
    scale: 40.0
  },
  {
    id: 'deep-sky',
    name: 'The Milky Way Galaxy (Our Home)',
    subtitle: 'Barred Spiral • Orion Spur & Galactic Core',
    minProgress: 0.97,
    maxProgress: 1.00,
    targetProgress: 0.99,
    focusTarget: { x: 0, y: 0, z: 0 },
    cameraOffset: { x: 0, y: 115, z: 135 },
    isLocked: true,
    scale: 220.0
  }
];

export class WaypointManager {
  constructor(waypoints = WAYPOINTS) {
    this.waypoints = waypoints;
  }

  getWaypointsList() {
    return this.waypoints;
  }

  getWaypointAtProgress(progress) {
    const clamped = Math.min(1.0, Math.max(0.0, progress));
    for (let i = 0; i < this.waypoints.length; i++) {
      const wp = this.waypoints[i];
      if (clamped >= wp.minProgress && (clamped < wp.maxProgress || (i === this.waypoints.length - 1 && clamped <= wp.maxProgress))) {
        return wp;
      }
    }
    return this.waypoints[0];
  }

  getTargetPose(id) {
    const wp = this.waypoints.find(w => w.id === id);
    if (!wp) return null;
    return {
      focusTarget: { ...wp.focusTarget },
      cameraOffset: { ...wp.cameraOffset },
      name: wp.name,
      subtitle: wp.subtitle,
      isLocked: wp.isLocked
    };
  }

  getProgressForWaypoint(id) {
    const wp = this.waypoints.find(w => w.id === id);
    return wp ? wp.targetProgress : 0.0;
  }
}
