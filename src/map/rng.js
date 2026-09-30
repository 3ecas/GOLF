// Small seeded PRNG (mulberry32) so a seed always produces the same map.

export function hashSeed(...parts) {
  let h = 1779033703 ^ parts.length;
  for (const p of parts) {
    h = Math.imul(h ^ (p | 0), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function createRng(seed) {
  let a = seed >>> 0;

  function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function range(min, max) {
    return min + (max - min) * next();
  }

  function int(min, max) {
    return Math.floor(range(min, max + 1));
  }

  function chance(p) {
    return next() < p;
  }

  function pick(arr) {
    return arr[Math.floor(next() * arr.length)];
  }

  function sign() {
    return next() < 0.5 ? -1 : 1;
  }

  // weights: { key: weight } or [w0, w1, ...]; returns key or index
  function weighted(weights) {
    const keys = Object.keys(weights);
    let total = 0;
    for (const k of keys) total += weights[k];
    let r = next() * total;
    for (const k of keys) {
      r -= weights[k];
      if (r < 0) return Array.isArray(weights) ? Number(k) : k;
    }
    const last = keys[keys.length - 1];
    return Array.isArray(weights) ? Number(last) : last;
  }

  return { next, range, int, chance, pick, sign, weighted };
}
