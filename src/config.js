// Every tunable value in the game lives here. Units are "world units":
// the map is WORLD.width x WORLD.height units and is scaled to the window.

export const WORLD = {
  width: 160,
  height: 90,
  landBottom: 96, // land polygons are closed below the visible area
};

export const BALL = {
  radius: 1.1,
};

export const PHYSICS = {
  fixedStep: 1 / 120,
  substeps: 6,
  gravity: 170, // units / s^2
  maxShotSpeed: 112, // units / s at full drag
  minBounceSpeed: 9, // normal speed below which an impact becomes a contact
  restSpeed: 2.2, // below this speed (while touching) the ball may settle
  restTime: 0.3, // seconds of slow contact before the ball is "at rest"
  collisionIterations: 2,
  outOfBoundsMargin: 25, // how far past the map edge counts as "fell off"
};

export const SURFACES = {
  ground: { restitution: 0.42, friction: 30 }, // friction = rolling decel, units / s^2
  sand: { restitution: 0.02, friction: 420 },
};

export const WIND = {
  chance: 1 / 3,
  minStrength: 8, // horizontal acceleration, units / s^2
  maxStrength: 22,
};

export const HOLE = {
  widthFactor: 1.6, // times ball diameter
  depthFactor: 1.0, // times notch width (square notch)
  poleHeight: 13,
  poleWidth: 0.45,
  flagWidth: 5,
  flagHeight: 3.2,
};

export const INPUT = {
  grabRadius: 7, // how close to the ball a press must be
  minDrag: 1.5, // drags shorter than this are cancelled
  maxDrag: 30, // drag length that gives full power
};

export const AIM = {
  maxLength: 24,
  dotSpacing: 1.7,
  minDotRadius: 0.22,
  maxDotRadius: 0.42,
};

export const WATER = {
  waveAmplitude: 0.55,
  waveLength: 16,
  waveSpeed: 0.6, // cycles per second
  sampleStep: 1,
};

export const GEN = {
  minY: 32, // highest terrain surface (small y = high on screen)
  maxY: 72, // lowest terrain surface
  waterLevel: 79,
  teeFlatWidth: 18,
  holeFlatWidth: 18,
  holeJitter: 3,
  holeEdgeMargin: 3, // notch distance from an island edge
  minSectionWidth: 10,
  maxSectionWidth: 30,
  weights: { flat: 30, slope: 20, hill: 9, tiers: 12, gap: 11 },
  slope: { minRise: 5, maxRise: 18, maxRatio: 0.7 },
  hill: { minHeight: 5, maxHeight: 12, samples: 12, valleyChance: 0.35 },
  tiers: { minSteps: 2, maxSteps: 4, minStep: 4, maxStep: 9, minTread: 6 },
  gap: { minWidth: 10, maxWidth: 34, minIslandWidth: 16 },
  sand: { chance: 0.45, inset: 2, minWidth: 6, maxWidth: 16, depth: 2.2 },
  platforms: {
    countWeights: [12, 30, 38, 20], // odds of 0, 1, 2, 3 platforms
    minWidth: 10,
    maxWidth: 22,
    thickness: 3,
    minClearance: 10,
    maxClearance: 24,
    topMargin: 8,
    sideMargin: 20,
    teeExclusion: 14,
    holeExclusion: 8,
    padding: 6,
    tries: 20,
  },
  reachSafety: 0.8, // fraction of max shot speed used when checking reachability
  maxAttempts: 50, // regenerations before giving up on a seed
};

export const PARTICLES = {
  sand: {
    minImpact: 6,
    countPerSpeed: 0.35,
    minCount: 4,
    maxCount: 28,
    size: 0.7,
    minSpeed: 8,
    maxSpeed: 26,
    spread: 1.1, // radians either side of straight up
    gravity: 120,
    life: 0.7,
  },
};

export const COLORS = {
  background: '#efeae2',
  ground: '#a9c39a',
  platform: '#a9c39a',
  hole: '#4e5a4a',
  sand: '#e6d3a3',
  water: '#8dbbd6',
  ball: '#ffffff',
  pole: '#6d6d6d',
  flag: '#e0836a',
  aim: 'rgba(80, 80, 80, 0.55)',
  text: '#5b5b5b',
  wind: '#7a7a7a',
  sandParticle: '#d9c28f',
};

export const UI = {
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  strokeFontUnits: 3.2, // text size in world units
  finishFontUnits: 7,
  margin: 3,
  finishDisplayTime: 4, // seconds the "holed" message stays
  resetDelay: 0.35, // pause after a water/out-of-bounds reset
  windArrowMin: 6,
  windArrowMax: 18,
  windArrowHead: 2,
  windLineWidth: 0.5,
};

export const LOOP = {
  maxFrameTime: 0.1,
};
