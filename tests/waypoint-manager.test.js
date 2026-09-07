import { describe, it, expect } from 'vitest';
import { WaypointManager, WAYPOINTS } from '../src/core/waypoint-manager.js';

describe('WaypointManager', () => {
  it('should define all celestial waypoints including solar system and individual galaxies', () => {
    expect(WAYPOINTS).toBeDefined();
    expect(WAYPOINTS.length).toBeGreaterThanOrEqual(13);
    
    const ids = WAYPOINTS.map(w => w.id);
    expect(ids).toContain('sun');
    expect(ids).toContain('mercury');
    expect(ids).toContain('venus');
    expect(ids).toContain('earth');
    expect(ids).toContain('mars');
    expect(ids).toContain('jupiter');
    expect(ids).toContain('saturn');
    expect(ids).toContain('ice-giants');
    expect(ids).toContain('andromeda');
    expect(ids).toContain('whirlpool');
    expect(ids).toContain('sombrero');
    expect(ids).toContain('triangulum');
    expect(ids).toContain('deep-sky');
  });

  it('should start with a far-away overview framing at 0% scroll', () => {
    const manager = new WaypointManager();
    const active = manager.getWaypointAtProgress(0.0);
    expect(active.id).toBe('sun');
    expect(active.name).toBe('The Sun');
    expect(active.isLocked).toBe(true);
    // Initial camera offset is elevated and far back to showcase planetary system
    const pose = manager.getTargetPose('sun');
    const dist = Math.sqrt(pose.cameraOffset.x ** 2 + pose.cameraOffset.y ** 2 + pose.cameraOffset.z ** 2);
    expect(dist).toBeGreaterThanOrEqual(8.0);
  });

  it('should identify Earth when progress is in the Earth phase (~30%)', () => {
    const manager = new WaypointManager();
    const active = manager.getWaypointAtProgress(0.32);
    expect(active.id).toBe('earth');
    expect(active.name).toContain('Earth');
    expect(active.isLocked).toBe(true);
  });

  it('should identify Saturn when progress is in the Saturn phase (~72%)', () => {
    const manager = new WaypointManager();
    const active = manager.getWaypointAtProgress(0.72);
    expect(active.id).toBe('saturn');
    expect(active.name).toBe('Saturn');
    expect(active.isLocked).toBe(true);
  });

  it('should identify individual galaxies during scroll travel', () => {
    const manager = new WaypointManager();
    expect(manager.getWaypointAtProgress(0.82).id).toBe('andromeda');
    expect(manager.getWaypointAtProgress(0.87).id).toBe('whirlpool');
    expect(manager.getWaypointAtProgress(0.92).id).toBe('sombrero');
    expect(manager.getWaypointAtProgress(0.95).id).toBe('triangulum');
    expect(manager.getWaypointAtProgress(0.99).id).toBe('deep-sky');
  });

  it('should end with a far-away cosmic macrocosm framing at 100% scroll', () => {
    const manager = new WaypointManager();
    const pose = manager.getTargetPose('deep-sky');
    const dist = Math.sqrt(
      (pose.cameraOffset.x - pose.focusTarget.x) ** 2 +
      (pose.cameraOffset.y - pose.focusTarget.y) ** 2 +
      (pose.cameraOffset.z - pose.focusTarget.z) ** 2
    );
    expect(dist).toBeGreaterThanOrEqual(50.0); // Very far away view of multiple galaxies
  });

  it('should maintain increased minimum distance to planets for majestic framing', () => {
    const manager = new WaypointManager();
    ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'].forEach((id) => {
      const pose = manager.getTargetPose(id);
      const dx = pose.cameraOffset.x - pose.focusTarget.x;
      const dy = pose.cameraOffset.y - pose.focusTarget.y;
      const dz = pose.cameraOffset.z - pose.focusTarget.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      expect(dist).toBeGreaterThanOrEqual(2.5); // Never zoom in uncomfortably close
    });
  });

  it('should return correct progress value when navigating directly to a waypoint by id', () => {
    const manager = new WaypointManager();
    const progress = manager.getProgressForWaypoint('jupiter');
    expect(progress).toBeGreaterThan(0.45);
    expect(progress).toBeLessThan(0.65);
  });
});
