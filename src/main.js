import { PHYSICS, LOOP, PARTICLES } from './config.js';
import { createGame } from './game.js';
import { createInput } from './input.js';
import { createParticles } from './particles.js';
import { createView } from './render/view.js';
import { createRenderer } from './render/renderer.js';

const canvas = document.getElementById('game');
const button = document.getElementById('new-map');

const viewApi = createView(canvas);
const game = createGame();
const particles = createParticles();
const renderer = createRenderer(canvas, viewApi);
const input = createInput(canvas, viewApi, {
  canShoot: game.canShoot,
  getBall: () => game.state.ball,
  onShoot: game.shoot,
});

function randomSeed() {
  return Math.floor(Math.random() * 0x7fffffff);
}

function startMap(seed) {
  game.newMap(seed);
  particles.clear();
}

button.addEventListener('click', () => {
  startMap(randomSeed());
  button.blur();
});

const urlSeed = Number(new URLSearchParams(location.search).get('seed'));
startMap(Number.isFinite(urlSeed) && urlSeed > 0 ? urlSeed : randomSeed());

function handleEvents(events) {
  for (const e of events) {
    if (e.type === 'land' && e.surface === 'sand' && e.speed >= PARTICLES.sand.minImpact) {
      const b = game.state.ball;
      particles.emitSand(b.x, b.y + b.r, e.speed);
    }
  }
}

let last = performance.now();
let accumulator = 0;

function frame(now) {
  const dt = Math.min((now - last) / 1000, LOOP.maxFrameTime);
  last = now;
  accumulator += dt;
  while (accumulator >= PHYSICS.fixedStep) {
    handleEvents(game.update(PHYSICS.fixedStep));
    particles.update(PHYSICS.fixedStep);
    accumulator -= PHYSICS.fixedStep;
  }
  renderer.draw(game, particles, input.getAim());
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
