import { GEN, WORLD, BALL, HOLE, WIND, PHYSICS } from '../config.js';
import { createRng, hashSeed } from './rng.js';
import { ARCHETYPES } from './archetypes.js';
import { landYAt, splitFlatRun } from './geometry.js';
import { validateMap } from './validate.js';
import { reachHeight, safeShotSpeed } from '../physics/trajectory.js';

// Generates a map for a seed. If a candidate breaks a rule it is thrown
// away and rebuilt from a derived seed, so the result is still
// deterministic for the seed.
export function generateMap(seed) {
  let map = null;
  for (let attempt = 0; attempt < GEN.maxAttempts; attempt++) {
    map = buildMap(seed, attempt);
    map.attempts = attempt + 1;
    if (validateMap(map).length === 0) return map;
  }
  return map;
}

function buildMap(seed, attempt) {
  const rng = createRng(hashSeed(seed, attempt));
  const W = WORLD.width;
  const bounds = { minY: GEN.minY, maxY: GEN.maxY };

  const land = [];
  const water = [];
  const sections = [];

  const cursor = { x: 0, y: rng.range(bounds.minY, bounds.maxY) };
  let mass = { points: [{ ...cursor }] };
  let massWidth = 0;

  function append(kind, pts, width) {
    mass.points.push(...pts);
    sections.push({ kind, x0: cursor.x, x1: cursor.x + width, y: cursor.y, mass });
    const last = pts[pts.length - 1];
    cursor.x = last.x;
    cursor.y = last.y;
    massWidth += width;
  }

  // Tee flat
  append('tee', ARCHETYPES.flat(rng, cursor, GEN.teeFlatWidth), GEN.teeFlatWidth);
  const tee = { x: GEN.teeFlatWidth / 2, y: cursor.y };

  // Middle sections
  const endX = W - GEN.holeFlatWidth;
  while (endX - cursor.x > 1e-6) {
    const remaining = endX - cursor.x;
    let width = rng.range(GEN.minSectionWidth, GEN.maxSectionWidth);
    if (width > remaining || remaining - width < GEN.minSectionWidth) width = remaining;

    let kind = rng.weighted(GEN.weights);
    if (kind === 'gap') {
      const gapW = rng.range(GEN.gap.minWidth, Math.min(GEN.gap.maxWidth, remaining));
      if (massWidth >= GEN.gap.minIslandWidth && gapW >= GEN.gap.minWidth) {
        land.push(mass);
        water.push({ x0: cursor.x, x1: cursor.x + gapW, y: GEN.waterLevel });
        const maxUp = reachHeight(gapW, safeShotSpeed(), PHYSICS.gravity);
        const lowestAllowed = Math.max(bounds.minY, cursor.y - maxUp);
        cursor.x += gapW;
        cursor.y = rng.range(lowestAllowed, bounds.maxY);
        mass = { points: [{ ...cursor }] };
        massWidth = 0;
        sections.push({ kind: 'gap', x0: cursor.x - gapW, x1: cursor.x, y: GEN.waterLevel });
        continue;
      }
      kind = 'flat';
    }
    append(kind, ARCHETYPES[kind](rng, cursor, width, bounds), width);
  }

  // Hole flat with a square notch
  const holeW = BALL.radius * 2 * HOLE.widthFactor;
  const holeD = holeW * HOLE.depthFactor;
  const hx = W - GEN.holeFlatWidth / 2 + rng.range(-GEN.holeJitter, GEN.holeJitter);
  const hy = cursor.y;
  const holeStart = cursor.x;
  mass.points.push(
    { x: hx - holeW / 2, y: hy },
    { x: hx - holeW / 2, y: hy + holeD },
    { x: hx + holeW / 2, y: hy + holeD },
    { x: hx + holeW / 2, y: hy },
    { x: W, y: hy },
  );
  sections.push({ kind: 'hole', x0: holeStart, x1: W, y: hy, mass });
  land.push(mass);
  const hole = { x: hx, y: hy, width: holeW, depth: holeD };

  const sand = placeSand(rng, sections);
  const platforms = placePlatforms(rng, land, tee, hole);
  const wind = rng.chance(WIND.chance) ? rng.sign() * rng.range(WIND.minStrength, WIND.maxStrength) : 0;

  return {
    seed,
    width: W,
    height: WORLD.height,
    land,
    water,
    sand,
    platforms,
    tee,
    hole,
    wind,
  };
}

function placeSand(rng, sections) {
  const cfg = GEN.sand;
  const patches = [];
  for (const s of sections) {
    if (s.kind !== 'flat') continue;
    const width = s.x1 - s.x0;
    if (width < cfg.minWidth + 2 * cfg.inset) continue;
    if (!rng.chance(cfg.chance)) continue;
    const patchW = Math.min(rng.range(cfg.minWidth, cfg.maxWidth), width - 2 * cfg.inset);
    const x0 = rng.range(s.x0 + cfg.inset, s.x1 - cfg.inset - patchW);
    const patch = { x0, x1: x0 + patchW, y: s.y, depth: cfg.depth };
    if (splitFlatRun(s.mass, patch.x0, patch.x1, s.y)) patches.push(patch);
  }
  return patches;
}

function placePlatforms(rng, land, tee, hole) {
  const cfg = GEN.platforms;
  const count = rng.weighted(cfg.countWeights);
  const platforms = [];
  for (let n = 0; n < count; n++) {
    for (let t = 0; t < cfg.tries; t++) {
      const w = rng.range(cfg.minWidth, cfg.maxWidth);
      const x0 = rng.range(cfg.sideMargin, WORLD.width - cfg.sideMargin - w);
      const x1 = x0 + w;
      if (x1 > tee.x - cfg.teeExclusion && x0 < tee.x + cfg.teeExclusion) continue;
      if (x1 > hole.x - cfg.holeExclusion && x0 < hole.x + cfg.holeExclusion) continue;

      let groundTop = Infinity;
      for (let x = x0; x <= x1; x += 1) {
        const y = landYAt(land, x);
        groundTop = Math.min(groundTop, y === null ? GEN.waterLevel : y);
      }
      let top = groundTop - rng.range(cfg.minClearance, cfg.maxClearance);
      top = Math.max(top, cfg.topMargin);
      if (groundTop - top < cfg.minClearance) continue;

      const p = { x: x0, y: top, w, h: cfg.thickness };
      if (platforms.some((q) => overlaps(p, q, cfg.padding))) continue;
      platforms.push(p);
      break;
    }
  }
  return platforms;
}

function overlaps(a, b, pad) {
  return (
    a.x < b.x + b.w + pad &&
    a.x + a.w + pad > b.x &&
    a.y < b.y + b.h + pad &&
    a.y + a.h + pad > b.y
  );
}
