import { PHYSICS, GEN } from '../config.js';

// Highest point (relative to launch, positive = up) a projectile launched at
// `speed` can reach at horizontal distance `dx`, ignoring wind.
export function reachHeight(dx, speed, gravity) {
  return (speed * speed) / (2 * gravity) - (gravity * dx * dx) / (2 * speed * speed);
}

export function reachable(dx, up, speed, gravity) {
  return up <= reachHeight(dx, speed, gravity);
}

export function safeShotSpeed() {
  return PHYSICS.maxShotSpeed * GEN.reachSafety;
}
