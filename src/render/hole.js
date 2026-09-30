import { COLORS, HOLE } from '../config.js';

export function drawHole(ctx, map) {
  const h = map.hole;
  ctx.fillStyle = COLORS.hole;
  ctx.fillRect(h.x - h.width / 2, h.y, h.width, h.depth);

  const top = h.y - HOLE.poleHeight;
  ctx.fillStyle = COLORS.pole;
  ctx.fillRect(h.x - HOLE.poleWidth / 2, top, HOLE.poleWidth, HOLE.poleHeight + h.depth);

  const dir = map.wind < 0 ? -1 : 1;
  ctx.fillStyle = COLORS.flag;
  ctx.beginPath();
  ctx.moveTo(h.x, top);
  ctx.lineTo(h.x + dir * HOLE.flagWidth, top + HOLE.flagHeight / 2);
  ctx.lineTo(h.x, top + HOLE.flagHeight);
  ctx.closePath();
  ctx.fill();
}
