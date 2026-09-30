import { PARTICLES, COLORS } from './config.js';
import { clamp } from './math.js';

// Simple particle simulation (small squares). Rendering lives in render/.
export function createParticles() {
  const list = [];

  function emitSand(x, y, impactSpeed) {
    const cfg = PARTICLES.sand;
    const count = Math.round(clamp(impactSpeed * cfg.countPerSpeed, cfg.minCount, cfg.maxCount));
    const speedScale = clamp(impactSpeed / 60, 0.4, 1.2);
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 2 - 1) * cfg.spread;
      const speed = (cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed)) * speedScale;
      list.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: cfg.life * (0.6 + Math.random() * 0.4),
        maxLife: cfg.life,
        size: cfg.size * (0.6 + Math.random() * 0.6),
        gravity: cfg.gravity,
        color: COLORS.sandParticle,
      });
    }
  }

  function update(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) list.splice(i, 1);
    }
  }

  function clear() {
    list.length = 0;
  }

  return { list, emitSand, update, clear };
}
