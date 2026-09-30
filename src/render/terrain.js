import { COLORS, WORLD } from '../config.js';

export function drawTerrain(ctx, map) {
  ctx.fillStyle = COLORS.ground;
  for (const mass of map.land) {
    const pts = mass.points;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[pts.length - 1].x, WORLD.landBottom);
    ctx.lineTo(pts[0].x, WORLD.landBottom);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = COLORS.sand;
  for (const s of map.sand) ctx.fillRect(s.x0, s.y, s.x1 - s.x0, s.depth);

  ctx.fillStyle = COLORS.platform;
  for (const p of map.platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
}
