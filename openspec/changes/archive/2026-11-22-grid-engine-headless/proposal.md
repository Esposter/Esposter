# grid-engine-headless

Replace the grid-engine Phaser plugin with a headless grid movement package of ours, drawn on Phaser by a thin binding in the dungeon world.

## Why

The dungeon world walks its characters with grid-engine, a Phaser plugin. The dependency ledger marks it for absorption, and the app uses only a small part of it: the create call, four character calls, a handful of movement and position calls, and five of its streams. The rest is a surface of about seventy methods that the app never reaches.

The package is not cheap to keep. It brings three runtime dependencies of its own, rxjs, mnemonist and tiled-property-flattener, and its single entry imports Phaser at module scope, so nothing that imports it can run without a window. The app works around that with a mirror of its direction enum that shared code can import, a test mock of the whole module, and types extracted from its stream signatures.

## What changes

- A new workspace package, `grid-engine-headless`, that holds the grid state: tile collision, characters on integer tiles, four-direction steps timed by the frame delta, and five typed events. It imports no Phaser, no rxjs, and no runtime dependency except neverthrow, which the client already ships.
- A thin Phaser binding in the app's dungeon services. It owns the sprites, and it writes each character's pixel, depth and walking frame from the engine's state, using the same rules grid-engine applies.
- One swap commit that moves the world's call sites onto the new API, deletes the direction mirror, its maps, the derived event types and the test mock, and removes the catalog entry and its lockfile records, together with the residue sweep.

No user-visible behaviour change is intended. Each deliberate difference from grid-engine is listed in the design with its reason.

## Capabilities

- `grid-engine-headless`, the new package's area. Its spec is written by the build change, when the package exists.
- `dungeons/world`, whose movement wording is rewritten as built at the swap.
- `architecture/dependency-admission`, which gains the package in its precedent section once the swap lands.

No capability's behaviour changes in this change. Nothing ships here, so `skip_specs` is set: the spec delta is the built package's requirements, and the build change writes it.

## Scope of this change

This change is the design and its build checklist. It adds no code, no package, no catalog entry and no lockfile change. The build starts only after this design is accepted, and the checklist in `tasks.md` is its order.
