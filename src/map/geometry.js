// Height lookups on the land polylines (no physics, no rendering).

// Topmost land surface y at x, or null over a gap.
export function landYAt(land, x) {
  let best = null;
  for (const mass of land) {
    const pts = mass.points;
    if (x < pts[0].x || x > pts[pts.length - 1].x) continue;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (x < Math.min(a.x, b.x) || x > Math.max(a.x, b.x)) continue;
      const w = b.x - a.x;
      const y = Math.abs(w) < 1e-9 ? Math.min(a.y, b.y) : a.y + ((x - a.x) / w) * (b.y - a.y);
      if (best === null || y < best) best = y;
    }
  }
  return best;
}

export function massBounds(mass) {
  const pts = mass.points;
  return { x0: pts[0].x, x1: pts[pts.length - 1].x };
}

// Insert two vertices on a horizontal run of the polyline so a sand patch
// gets its own segment.
export function splitFlatRun(mass, x0, x1, y) {
  const pts = mass.points;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (Math.abs(a.y - y) > 1e-6 || Math.abs(b.y - y) > 1e-6) continue;
    if (a.x <= x0 + 1e-6 && b.x >= x1 - 1e-6) {
      pts.splice(i + 1, 0, { x: x0, y }, { x: x1, y });
      return true;
    }
  }
  return false;
}
