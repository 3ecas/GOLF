export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export function length(x, y) {
  return Math.hypot(x, y);
}
