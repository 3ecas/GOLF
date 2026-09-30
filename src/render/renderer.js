import { COLORS, WORLD } from '../config.js';
import { drawWater } from './water.js';
import { drawTerrain } from './terrain.js';
import { drawHole } from './hole.js';
import { drawBall } from './ball.js';
import { drawAim } from './aim.js';
import { drawParticles } from './particles.js';
import { drawUI } from './ui.js';

export function createRenderer(canvas, viewApi) {
  const ctx = canvas.getContext('2d');

  function draw(game, particles, aim) {
    const { state } = game;
    const { view } = viewApi;

    viewApi.applyScreen(ctx);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, view.cssWidth, view.cssHeight);

    viewApi.applyWorld(ctx);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, WORLD.width, WORLD.height);
    ctx.clip();

    drawWater(ctx, state.map, state.time);
    drawTerrain(ctx, state.map);
    drawHole(ctx, state.map);
    drawParticles(ctx, particles);
    if (game.isBallVisible()) {
      drawBall(ctx, state.ball);
      drawAim(ctx, state.ball, aim);
    }
    ctx.restore();

    viewApi.applyScreen(ctx);
    drawUI(ctx, state, viewApi);
  }

  return { draw };
}
