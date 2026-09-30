import { COLORS, UI, WIND, WORLD } from '../config.js';

// Stroke counter, wind arrow and the "holed" message, drawn in screen
// space (sizes derived from the world scale so they track the window).
export function drawUI(ctx, state, viewApi) {
  const { view } = viewApi;
  const s = view.scale;
  const margin = UI.margin * s;

  ctx.fillStyle = COLORS.text;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = `${UI.strokeFontUnits * s}px ${UI.fontFamily}`;
  const origin = viewApi.toScreen(0, 0);
  ctx.fillText(`Strokes ${state.strokes}`, origin.x + margin, origin.y + margin);

  if (state.map.wind) drawWind(ctx, state.map.wind, viewApi);

  if (state.phase === 'holed' && state.time - state.finishedAt < UI.finishDisplayTime) {
    const c = viewApi.toScreen(WORLD.width / 2, WORLD.height * 0.4);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${UI.finishFontUnits * s}px ${UI.fontFamily}`;
    const n = state.strokes;
    ctx.fillText(`Holed in ${n} ${n === 1 ? 'stroke' : 'strokes'}`, c.x, c.y);
  }
}

function drawWind(ctx, wind, viewApi) {
  const { view } = viewApi;
  const s = view.scale;
  const t = (Math.abs(wind) - WIND.minStrength) / (WIND.maxStrength - WIND.minStrength);
  const len = (UI.windArrowMin + (UI.windArrowMax - UI.windArrowMin) * t) * s;
  const head = UI.windArrowHead * s;
  const dir = Math.sign(wind);
  const c = viewApi.toScreen(WORLD.width / 2, 0);
  const y = c.y + UI.margin * s + (UI.strokeFontUnits * s) / 2;
  const x0 = c.x - (dir * len) / 2;
  const x1 = c.x + (dir * len) / 2;

  ctx.strokeStyle = COLORS.wind;
  ctx.fillStyle = COLORS.wind;
  ctx.lineWidth = UI.windLineWidth * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1 - dir * head, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x1 - dir * head, y - head * 0.7);
  ctx.lineTo(x1 - dir * head, y + head * 0.7);
  ctx.closePath();
  ctx.fill();
}
