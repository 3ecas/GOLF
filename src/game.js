import { UI } from './config.js';
import { generateMap } from './map/generator.js';
import { buildSegments } from './physics/segments.js';
import { createBall, placeBall, launchBall } from './physics/ball.js';
import { stepWorld } from './physics/world.js';

// Game state and transitions. Phases:
//   aim     ball at rest, waiting for a shot
//   flight  ball moving
//   reset   short pause after water / falling off, then back to last shot
//   holed   ball settled inside the notch
export function createGame() {
  const game = {
    map: null,
    segments: [],
    ball: createBall(0, 0),
    strokes: 0,
    lastShot: { x: 0, y: 0 },
    phase: 'aim',
    time: 0,
    finishedAt: 0,
    resetTimer: 0,
  };

  function newMap(seed) {
    game.map = generateMap(seed);
    game.segments = buildSegments(game.map);
    game.strokes = 0;
    const { tee } = game.map;
    placeBall(game.ball, tee.x, tee.y - game.ball.r);
    game.lastShot = { x: game.ball.x, y: game.ball.y };
    game.phase = 'aim';
  }

  function canShoot() {
    return game.phase === 'aim' && game.ball.atRest;
  }

  function shoot(vx, vy) {
    if (!canShoot()) return;
    game.strokes++;
    game.lastShot = { x: game.ball.x, y: game.ball.y };
    launchBall(game.ball, vx, vy);
    game.phase = 'flight';
  }

  function isBallInHole() {
    const { hole } = game.map;
    const b = game.ball;
    return Math.abs(b.x - hole.x) < hole.width / 2 && b.y > hole.y;
  }

  function update(dt) {
    game.time += dt;
    if (game.phase === 'reset') {
      game.resetTimer -= dt;
      if (game.resetTimer <= 0) {
        placeBall(game.ball, game.lastShot.x, game.lastShot.y);
        game.phase = 'aim';
      }
      return [];
    }
    if (game.phase !== 'flight') return [];

    const events = stepWorld(game.ball, game.map, game.segments, dt);
    for (const e of events) {
      if (e.type === 'water' || e.type === 'out') {
        game.phase = 'reset';
        game.resetTimer = UI.resetDelay;
      } else if (e.type === 'rest') {
        if (isBallInHole()) {
          game.phase = 'holed';
          game.finishedAt = game.time;
        } else {
          game.phase = 'aim';
        }
      }
    }
    return events;
  }

  function isBallVisible() {
    return game.phase !== 'reset';
  }

  return { state: game, newMap, canShoot, shoot, update, isBallVisible };
}
