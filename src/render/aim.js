import { AIM, COLORS } from '../config.js';

// Dotted line from the ball in the shot direction, longer with more power.
export function drawAim(ctx, ball, aim) {
  if (!aim) return;
  const length = AIM.maxLength * aim.power;
  const radius = AIM.minDotRadius + (AIM.maxDotRadius - AIM.minDotRadius) * aim.power;
  ctx.fillStyle = COLORS.aim;
  for (let d = ball.r + AIM.dotSpacing; d <= length + ball.r; d += AIM.dotSpacing) {
    ctx.beginPath();
    ctx.arc(ball.x + aim.dirX * d, ball.y + aim.dirY * d, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
