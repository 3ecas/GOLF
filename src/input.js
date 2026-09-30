import { INPUT, PHYSICS } from './config.js';
import { clamp } from './math.js';

// Slingshot input: press near the ball, drag back, release to shoot.
// The shot goes opposite to the drag; power scales with drag length.
export function createInput(canvas, view, { canShoot, getBall, onShoot }) {
  let dragging = false;
  let pointerId = null;
  let current = { x: 0, y: 0 };

  function computeAim() {
    const ball = getBall();
    const dx = current.x - ball.x;
    const dy = current.y - ball.y;
    const len = Math.hypot(dx, dy);
    if (len < INPUT.minDrag) return null;
    const power = clamp(len, 0, INPUT.maxDrag) / INPUT.maxDrag;
    return { dirX: -dx / len, dirY: -dy / len, power };
  }

  function onDown(e) {
    if (!canShoot() || dragging) return;
    const p = view.toWorld(e.clientX, e.clientY);
    const ball = getBall();
    if (Math.hypot(p.x - ball.x, p.y - ball.y) > INPUT.grabRadius) return;
    dragging = true;
    pointerId = e.pointerId;
    current = p;
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    current = view.toWorld(e.clientX, e.clientY);
  }

  function onUp(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    current = view.toWorld(e.clientX, e.clientY);
    const aim = computeAim();
    dragging = false;
    pointerId = null;
    if (aim && canShoot()) {
      const speed = aim.power * PHYSICS.maxShotSpeed;
      onShoot(aim.dirX * speed, aim.dirY * speed);
    }
  }

  function onCancel(e) {
    if (e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);

  return {
    // null when not dragging; otherwise { dirX, dirY, power }
    getAim() {
      return dragging ? computeAim() : null;
    },
  };
}
