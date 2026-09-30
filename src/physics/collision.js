import { clamp } from '../math.js';

// Resolves a circle against one segment. Pushes the ball out along the
// contact normal and reflects the normal velocity with restitution.
// Returns a contact record, or null when there is no penetration.
export function resolveCircleSegment(ball, seg, props, minBounceSpeed) {
  const dx = seg.bx - seg.ax;
  const dy = seg.by - seg.ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((ball.x - seg.ax) * dx + (ball.y - seg.ay) * dy) / len2 : 0;
  t = clamp(t, 0, 1);
  const px = seg.ax + dx * t;
  const py = seg.ay + dy * t;
  const ex = ball.x - px;
  const ey = ball.y - py;
  const dist = Math.hypot(ex, ey);
  if (dist >= ball.r) return null;

  let nx;
  let ny;
  if (dist > 1e-6) {
    nx = ex / dist;
    ny = ey / dist;
  } else {
    nx = seg.nx;
    ny = seg.ny;
  }
  // Only resolve from the outside of the solid; the neighbouring edge
  // handles the other side of a corner.
  if (nx * seg.nx + ny * seg.ny <= 0) return null;

  const push = ball.r - dist;
  ball.x += nx * push;
  ball.y += ny * push;

  const vn = ball.vx * nx + ball.vy * ny;
  let impact = 0;
  if (vn < 0) {
    impact = -vn;
    const out = impact > minBounceSpeed ? impact * props.restitution : 0;
    ball.vx += (out - vn) * nx;
    ball.vy += (out - vn) * ny;
  }
  return { nx, ny, type: seg.type, impact };
}
