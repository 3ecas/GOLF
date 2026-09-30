# Golf

A minimalist 2D side-view golf game. HTML5 Canvas + vanilla JavaScript
(ES modules), no libraries, no build step.

## Run

Serve the folder with any static server and open `index.html`:

```sh
python3 -m http.server 8000      # or: npm start
# then open http://localhost:8000
```

Add `?seed=123` to the URL to load a specific map.

## Check the map generator

```sh
npm test                          # or: node scripts/validate-maps.mjs 300
```

Generates 300 seeded maps and asserts the beatability rules (tee and hole
on solid ground, hole never in a hazard, minimum island / platform widths,
gaps crossable by a max-power shot, hole reachable from the tee).

## Controls

Press on or near the ball, drag backwards, release to shoot. The shot goes
opposite to the drag; power grows with drag length up to a clamp. Shooting
is only possible while the ball is at rest. "New map" starts a fresh map.

## Layout

```
index.html / style.css        canvas + the single "New map" button
scripts/validate-maps.mjs     generates maps and asserts the rules
src/main.js                   bootstrap, resize, fixed-timestep loop
src/config.js                 every tunable (physics, colours, sizes, odds)
src/game.js                   state: map, ball, strokes, last shot, phase
src/input.js                  drag-to-shoot
src/particles.js              sand burst simulation
src/math.js                   tiny helpers
src/physics/ball.js           ball object, place / launch
src/physics/collision.js      circle-vs-segment resolution
src/physics/segments.js       map polygons -> collision segments
src/physics/surfaces.js       ground / sand properties
src/physics/trajectory.js     reach envelope of a max-power shot
src/physics/world.js          substepped step: gravity, wind, friction, water, rest
src/map/rng.js                seeded PRNG
src/map/archetypes.js         flat / slope / hill / tiers builders
src/map/generator.js          composes archetypes, gaps, sand, platforms, wind
src/map/geometry.js           surface height lookups
src/map/validate.js           rule checks
src/render/view.js            world <-> screen scaling (letterboxed)
src/render/renderer.js        draw order
src/render/*.js               terrain, water, hole + flag, ball, aim, particles, ui
```

## Tuning

All values live in `src/config.js`. The ones that most affect feel:

- `PHYSICS.maxShotSpeed` and `INPUT.maxDrag`: shot range vs drag distance.
- `SURFACES.*.friction`: rolling deceleration. A slope steeper than
  `asin(friction / gravity)` makes the ball roll; shallower ones let it settle.
- `PHYSICS.minBounceSpeed`, `restSpeed`, `restTime`: how bounces die out and
  when the ball is declared at rest.
- `GEN.weights`: archetype odds; `WIND.chance`; `GEN.sand.chance`.
