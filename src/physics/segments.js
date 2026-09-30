import { WORLD } from '../config.js';
import { SURFACE_GROUND, SURFACE_SAND } from './surfaces.js';

// Turns the map's land masses and platforms into collision segments.
// Polygons are wound clockwise on screen (left->right along the top), so
// the outward normal of edge a->b is (dy, -dx).

function addPolygon(segments, poly, topCount, sand) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) continue;
    const isTop = i < topCount;
    segments.push({
      ax: a.x,
      ay: a.y,
      bx: b.x,
      by: b.y,
      nx: dy / len,
      ny: -dx / len,
      type: isTop && isSandSegment(a, b, sand) ? SURFACE_SAND : SURFACE_GROUND,
    });
  }
}

function isSandSegment(a, b, sand) {
  if (Math.abs(a.y - b.y) > 1e-6) return false;
  const mx = (a.x + b.x) / 2;
  for (const patch of sand) {
    if (mx >= patch.x0 && mx <= patch.x1 && Math.abs(patch.y - a.y) < 1e-6) return true;
  }
  return false;
}

export function buildSegments(map) {
  const segments = [];
  for (const mass of map.land) {
    const pts = mass.points;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const poly = [
      ...pts,
      { x: last.x, y: WORLD.landBottom },
      { x: first.x, y: WORLD.landBottom },
    ];
    addPolygon(segments, poly, pts.length - 1, map.sand);
  }
  for (const p of map.platforms) {
    const poly = [
      { x: p.x, y: p.y },
      { x: p.x + p.w, y: p.y },
      { x: p.x + p.w, y: p.y + p.h },
      { x: p.x, y: p.y + p.h },
    ];
    addPolygon(segments, poly, 1, map.sand);
  }
  return segments;
}
