import { COLORS, WATER, WORLD } from '../config.js';

export function drawWater(ctx, map, time) {
  ctx.fillStyle = COLORS.water;
  const phase = time * WATER.waveSpeed * Math.PI * 2;
  for (const w of map.water) {
    ctx.beginPath();
    ctx.moveTo(w.x0, WORLD.height);
    for (let x = w.x0; x < w.x1 + WATER.sampleStep; x += WATER.sampleStep) {
      const xx = Math.min(x, w.x1);
      const y = w.y + Math.sin((xx / WATER.waveLength) * Math.PI * 2 + phase) * WATER.waveAmplitude;
      ctx.lineTo(xx, y);
    }
    ctx.lineTo(w.x1, WORLD.height);
    ctx.closePath();
    ctx.fill();
  }
}
