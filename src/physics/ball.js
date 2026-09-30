import { BALL } from '../config.js';

export function createBall(x, y) {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    r: BALL.radius,
    grounded: false,
    atRest: true,
    restTimer: 0,
  };
}

export function placeBall(ball, x, y) {
  ball.x = x;
  ball.y = y;
  ball.vx = 0;
  ball.vy = 0;
  ball.grounded = true;
  ball.atRest = true;
  ball.restTimer = 0;
}

export function launchBall(ball, vx, vy) {
  ball.vx = vx;
  ball.vy = vy;
  ball.atRest = false;
  ball.grounded = false;
  ball.restTimer = 0;
}
