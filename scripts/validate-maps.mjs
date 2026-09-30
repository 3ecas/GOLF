// Generates a few hundred maps and asserts the beatability rules hold.
// Run with: node scripts/validate-maps.mjs [count]

import { generateMap } from '../src/map/generator.js';
import { validateMap } from '../src/map/validate.js';

const count = Number(process.argv[2]) || 300;
const stats = { water: 0, sand: 0, platforms: 0, platformTotal: 0, wind: 0, retries: 0, maxAttempts: 0 };
let failures = 0;

for (let seed = 1; seed <= count; seed++) {
  const map = generateMap(seed);
  const errors = validateMap(map);
  if (errors.length) {
    failures++;
    console.error(`seed ${seed}: ${errors.join('; ')}`);
  }
  if (map.water.length) stats.water++;
  if (map.sand.length) stats.sand++;
  if (map.platforms.length) stats.platforms++;
  stats.platformTotal += map.platforms.length;
  if (map.wind) stats.wind++;
  stats.retries += map.attempts - 1;
  stats.maxAttempts = Math.max(stats.maxAttempts, map.attempts);
}

console.log(`checked ${count} maps, ${failures} failed`);
console.log(
  `with water: ${stats.water}, sand: ${stats.sand}, platforms: ${stats.platforms}, wind: ${stats.wind}`,
);
console.log(`platforms per map: ${(stats.platformTotal / count).toFixed(2)}`);
console.log(`regenerations: ${stats.retries} (max attempts for one seed: ${stats.maxAttempts})`);

if (failures) process.exit(1);
