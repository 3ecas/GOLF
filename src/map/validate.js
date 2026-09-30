import { GEN, PHYSICS } from '../config.js';
import { landYAt, massBounds } from './geometry.js';
import { reachable, safeShotSpeed } from '../physics/trajectory.js';

const EPS = 1e-6;

// Returns a list of rule violations (empty when the map is beatable).
export function validateMap(map) {
  const errors = [];
  const speed = safeShotSpeed();
  const g = PHYSICS.gravity;

  checkTee(map, errors);
  checkHole(map, errors);
  checkWidths(map, errors);
  checkGaps(map, errors, speed, g);
  checkShape(map, errors);
  checkReachability(map, errors, speed, g);

  return errors;
}

function inSand(map, x0, x1) {
  return map.sand.some((s) => x1 > s.x0 && x0 < s.x1);
}

function inWater(map, x0, x1) {
  return map.water.some((w) => x1 > w.x0 && x0 < w.x1);
}

function checkTee(map, errors) {
  const { x, y } = map.tee;
  const surface = landYAt(map.land, x);
  if (surface === null || Math.abs(surface - y) > EPS) errors.push('tee is not on solid ground');
  if (inWater(map, x, x)) errors.push('tee is over water');
  if (inSand(map, x, x)) errors.push('tee is in sand');
}

function checkHole(map, errors) {
  const h = map.hole;
  const left = h.x - h.width / 2;
  const right = h.x + h.width / 2;
  const margin = GEN.holeEdgeMargin;

  const owner = map.land.find((m) => {
    const b = massBounds(m);
    return b.x0 <= left - margin && b.x1 >= right + margin;
  });
  if (!owner) errors.push('hole is not on solid ground with an edge margin');

  const lipL = landYAt(map.land, left - 1);
  const lipR = landYAt(map.land, right + 1);
  if (lipL === null || lipR === null || Math.abs(lipL - h.y) > EPS || Math.abs(lipR - h.y) > EPS) {
    errors.push('hole lips are not level');
  }
  const floor = landYAt(map.land, h.x);
  if (floor === null || Math.abs(floor - (h.y + h.depth)) > EPS) errors.push('hole notch is missing');

  if (inWater(map, left - margin, right + margin)) errors.push('hole is in water');
  if (inSand(map, left - margin, right + margin)) errors.push('hole is in sand');
}

function checkWidths(map, errors) {
  for (const mass of map.land) {
    const b = massBounds(mass);
    if (b.x1 - b.x0 < GEN.gap.minIslandWidth - EPS) errors.push('island narrower than minimum');
  }
  for (const p of map.platforms) {
    if (p.w < GEN.platforms.minWidth - EPS) errors.push('platform narrower than minimum');
  }
}

function checkGaps(map, errors, speed, g) {
  for (const w of map.water) {
    const width = w.x1 - w.x0;
    if (width > GEN.gap.maxWidth + EPS) errors.push('gap wider than maximum');
    const yl = landYAt(map.land, w.x0 - EPS);
    const yr = landYAt(map.land, w.x1 + EPS);
    if (yl === null || yr === null) {
      errors.push('gap is not bordered by land');
      continue;
    }
    if (!reachable(width, yl - yr, speed, g)) errors.push('gap cannot be crossed by a max-power shot');
  }
}

function checkShape(map, errors) {
  for (const mass of map.land) {
    const pts = mass.points;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p.y < GEN.minY - EPS || p.y > GEN.maxY + map.hole.depth + EPS) errors.push('terrain out of vertical bounds');
      if (i > 0 && p.x < pts[i - 1].x - EPS) errors.push('terrain polyline goes backwards');
    }
  }
  for (const p of map.platforms) {
    const ground = landYAt(map.land, p.x + p.w / 2);
    if (ground !== null && p.y + p.h > ground) errors.push('platform intersects the ground');
  }
}

// Coarse beatability: can a chain of max-power shots (with safety margin)
// hop from the tee across terrain vertices and platforms to the hole?
function checkReachability(map, errors, speed, g) {
  const nodes = [{ x: map.tee.x, y: map.tee.y }];
  for (const mass of map.land) nodes.push(...mass.points);
  for (const p of map.platforms) nodes.push({ x: p.x, y: p.y }, { x: p.x + p.w, y: p.y });
  const target = nodes.length;
  nodes.push({ x: map.hole.x, y: map.hole.y });

  const seen = new Array(nodes.length).fill(false);
  const queue = [0];
  seen[0] = true;
  while (queue.length) {
    const i = queue.shift();
    if (i === target) return;
    const a = nodes[i];
    for (let j = 0; j < nodes.length; j++) {
      if (seen[j]) continue;
      const b = nodes[j];
      if (reachable(Math.abs(b.x - a.x), a.y - b.y, speed, g)) {
        seen[j] = true;
        queue.push(j);
      }
    }
  }
  errors.push('hole is not reachable from the tee');
}
