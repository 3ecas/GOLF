import { WORLD } from '../config.js';

// Maps world units to the canvas. The whole map always fits on screen,
// letterboxed and centred.
export function createView(canvas) {
  const view = { scale: 1, ox: 0, oy: 0, dpr: 1, cssWidth: 0, cssHeight: 0 };

  function resize() {
    view.dpr = window.devicePixelRatio || 1;
    view.cssWidth = window.innerWidth;
    view.cssHeight = window.innerHeight;
    canvas.width = Math.round(view.cssWidth * view.dpr);
    canvas.height = Math.round(view.cssHeight * view.dpr);
    canvas.style.width = `${view.cssWidth}px`;
    canvas.style.height = `${view.cssHeight}px`;
    view.scale = Math.min(view.cssWidth / WORLD.width, view.cssHeight / WORLD.height);
    view.ox = (view.cssWidth - WORLD.width * view.scale) / 2;
    view.oy = (view.cssHeight - WORLD.height * view.scale) / 2;
  }

  function toWorld(clientX, clientY) {
    return { x: (clientX - view.ox) / view.scale, y: (clientY - view.oy) / view.scale };
  }

  function toScreen(x, y) {
    return { x: view.ox + x * view.scale, y: view.oy + y * view.scale };
  }

  function applyWorld(ctx) {
    const s = view.dpr * view.scale;
    ctx.setTransform(s, 0, 0, s, view.dpr * view.ox, view.dpr * view.oy);
  }

  function applyScreen(ctx) {
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  return { view, resize, toWorld, toScreen, applyWorld, applyScreen };
}
