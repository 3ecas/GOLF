import { GEN } from '../config.js';
import { clamp } from '../math.js';

// Each archetype returns the polyline points that follow `cursor`
// (which is the last point already on the land mass), spanning `width`.
// Screen y grows downwards, so "up" means a smaller y.

function flat(rng, cursor, width) {
  return [{ x: cursor.x + width, y: cursor.y }];
}

function slope(rng, cursor, width, bounds) {
  const cfg = GEN.slope;
  const maxRise = Math.max(cfg.minRise, Math.min(cfg.maxRise, width * cfg.maxRatio));
  const rise = rng.range(cfg.minRise, maxRise);
  let dir = rng.sign(); // +1 = up
  let y = cursor.y - dir * rise;
  if (y < bounds.minY || y > bounds.maxY) {
    dir = -dir;
    y = cursor.y - dir * rise;
  }
  y = clamp(y, bounds.minY, bounds.maxY);
  return [{ x: cursor.x + width, y }];
}

function hill(rng, cursor, width, bounds) {
  const cfg = GEN.hill;
  let h = rng.range(cfg.minHeight, cfg.maxHeight);
  if (rng.chance(cfg.valleyChance)) h = -h;
  const peakY = clamp(cursor.y - h, bounds.minY, bounds.maxY);
  h = cursor.y - peakY;
  const pts = [];
  for (let i = 1; i <= cfg.samples; i++) {
    const t = i / cfg.samples;
    const bump = (1 - Math.cos(2 * Math.PI * t)) / 2;
    pts.push({ x: cursor.x + width * t, y: i === cfg.samples ? cursor.y : cursor.y - h * bump });
  }
  return pts;
}

function tiers(rng, cursor, width, bounds) {
  const cfg = GEN.tiers;
  let steps = rng.int(cfg.minSteps, cfg.maxSteps);
  steps = Math.max(1, Math.min(steps, Math.floor(width / cfg.minTread) - 1));
  const treadW = width / (steps + 1);
  let stepH = rng.range(cfg.minStep, cfg.maxStep);
  let dir = rng.sign(); // +1 = up
  const room = (d) => (d > 0 ? cursor.y - bounds.minY : bounds.maxY - cursor.y);
  if (room(dir) < stepH * steps) dir = -dir;
  stepH = Math.min(stepH, room(dir) / steps);
  const pts = [];
  let y = cursor.y;
  for (let i = 0; i < steps; i++) {
    const xEnd = cursor.x + treadW * (i + 1);
    pts.push({ x: xEnd, y });
    y -= dir * stepH;
    pts.push({ x: xEnd, y });
  }
  pts.push({ x: cursor.x + width, y });
  return pts;
}

export const ARCHETYPES = { flat, slope, hill, tiers };
