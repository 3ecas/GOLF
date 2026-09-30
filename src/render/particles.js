export function drawParticles(ctx, particles) {
  for (const p of particles.list) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife * 1.5));
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}
