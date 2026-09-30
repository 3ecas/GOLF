import { PHYSICS, WORLD } from '../config.js';
import { resolveCircleSegment } from './collision.js';
import { surfaceProps } from './surfaces.js';

// Advances the ball by one fixed step using substeps. Returns a list of
// events: { type: 'land', surface, speed } | { type: 'water' } |
// { type: 'out' } | { type: 'rest' }.
export function stepWorld(ball, map, segments, dt) {
  const events = [];
  if (ball.atRest) return events;

  const sdt = dt / PHYSICS.substeps;
  let strongestImpact = null;

  for (let i = 0; i < PHYSICS.substeps; i++) {
    ball.vy += PHYSICS.gravity * sdt;
    if (!ball.grounded && map.wind) ball.vx += map.wind * sdt;
    ball.x += ball.vx * sdt;
    ball.y += ball.vy * sdt;

    const contacts = collide(ball, segments);
    ball.grounded = contacts.length > 0;
    if (ball.grounded) {
      applyFriction(ball, contacts, sdt);
      for (const c of contacts) {
        if (!strongestImpact || c.impact > strongestImpact.impact) strongestImpact = c;
      }
    }

    if (touchesWater(ball, map)) {
      events.push({ type: 'water' });
      return events;
    }
    if (outOfBounds(ball)) {
      events.push({ type: 'out' });
      return events;
    }
  }

  if (strongestImpact && strongestImpact.impact > 0) {
    events.push({ type: 'land', surface: strongestImpact.type, speed: strongestImpact.impact });
  }

  updateRest(ball, dt, events);
  return events;
}

function collide(ball, segments) {
  const contacts = [];
  for (let iter = 0; iter < PHYSICS.collisionIterations; iter++) {
    for (const seg of segments) {
      const c = resolveCircleSegment(ball, seg, surfaceProps(seg.type), PHYSICS.minBounceSpeed);
      if (c) contacts.push(c);
    }
  }
  return contacts;
}

function applyFriction(ball, contacts, dt) {
  let best = contacts[0];
  let friction = surfaceProps(best.type).friction;
  for (const c of contacts) {
    const f = surfaceProps(c.type).friction;
    if (f > friction) {
      friction = f;
      best = c;
    }
  }
  const tx = -best.ny;
  const ty = best.nx;
  const vt = ball.vx * tx + ball.vy * ty;
  const dv = friction * dt;
  const change = Math.abs(vt) <= dv ? -vt : -Math.sign(vt) * dv;
  ball.vx += tx * change;
  ball.vy += ty * change;
}

function touchesWater(ball, map) {
  for (const w of map.water) {
    if (ball.x >= w.x0 && ball.x <= w.x1 && ball.y + ball.r >= w.y) return true;
  }
  return false;
}

function outOfBounds(ball) {
  const m = PHYSICS.outOfBoundsMargin;
  return ball.y > WORLD.height + m || ball.x < -m || ball.x > WORLD.width + m;
}

function updateRest(ball, dt, events) {
  const speed = Math.hypot(ball.vx, ball.vy);
  if (ball.grounded && speed < PHYSICS.restSpeed) {
    ball.restTimer += dt;
    if (ball.restTimer >= PHYSICS.restTime) {
      ball.atRest = true;
      ball.vx = 0;
      ball.vy = 0;
      events.push({ type: 'rest' });
    }
  } else {
    ball.restTimer = 0;
  }
}
