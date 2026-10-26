# Scatter

Genshin's ground carries more than its trees and grass. Between the placed trees there are small flowers and pebbles that no placement record holds, so no record places them. They are scattered: each finest terrain tile is given its key as a seed, a set of candidate points is thrown over its square in the terrain's worker, and the flowers kept are drawn on the tile (`packages/genshin-world/src/workers/terrainTile.worker.ts`, `packages/genshin-engine/src/vegetation/computeScatterPoints.ts`).

## How it works

```mermaid
flowchart TD
  SEED["Seed: the tile's, so the same square always repeats"] --> CAND["A candidate point in the square"]
  CAND --> ACC{"The ground accepts it?"}
  ACC -->|no| NEXT["Next candidate"]
  ACC -->|yes| CROWD{"A kept plant within the spacing?"}
  CROWD -->|yes| NEXT
  CROWD -->|no| KEEP["Keep it: its cell in the grid records it"]
  KEEP --> NEXT
  NEXT -->|more candidates| CAND
  NEXT -->|none left| OUT["x and z pairs relative to the square's corner"]
  OUT --> PLANT["Worker: each stood on the ground, turned, sized and coloured, as a matrix and a colour"]
  PLANT --> DRAW["The tile's mesh: one instanced draw of the flower as its child"]
```

- **Dart throwing with a fixed count.** `computeScatterPoints` draws `candidateCount` points from a seeded stream (`createSeededRandom`) over the square. A candidate is kept only when the ground accepts it and no kept plant stands closer than `spacing`, so plants are spread evenly without a visible lattice. The stream is consumed whether a candidate is kept or not, so the same options always give the same plants (`packages/genshin-engine/src/vegetation/computeScatterPoints.ts`, `packages/genshin-engine/src/random/createSeededRandom.ts`).
- **The ground decides.** The caller's `checkIsAccepted` is the ground's verdict on a point. The generator does not know what grows where; Windrise's worker accepts a point above the water whose ground is almost all grass by the [ground paint](../ground-paint/design.md)'s weights there, at the slope read across it (`computeWindrisePlants`, `packages/genshin-world/src/services/windrise/computeWindrisePlants.ts`). The ground it asks is the one the worker was loaded with as it started: its height, its layers' weights and the water's level (`WindrisePlantsGround`, `packages/genshin-world/src/workers/terrainTile.worker.ts`), built once from the records the world read before it opened ([terrain](../terrain/design.md)).
- **Only the finest tiles grow plants.** A tile past the finest level is drawn too far for a flower to show, so the worker scatters nothing on it. Each flower kept stands on the ground, turned and sized at random from a seeded stream of its own, in one of the region's colours, written as an instance matrix relative to the tile's corner and a colour, and handed back with the tile's arrays (`packages/genshin-world/src/workers/terrainTile.worker.ts`, `packages/genshin-world/src/services/windrise/computeWindrisePlants.ts`).
- **A tile's flowers are one draw, its mesh's child.** The terrain draws them as an instanced mesh of the one flower under the tile's mesh, so they show, hide and are freed with the tile (`createFlowerGeometry`, `packages/genshin-engine/src/vegetation/createFlowerTileGeometry.ts`, `packages/genshin-world/src/components/World/Terrain/Index.vue`). A flower is two cards crossed, cut to a round head on a stem, white in itself so each instance takes its own colour; like a grass blade it takes the ground's upward normal and bends with the wind by the square of its height (`createFlowerMaterial`, `packages/genshin-engine/src/vegetation/createFlowerMaterial.ts`, `packages/genshin-engine/src/vegetation/createFlowerGeometry.ts`).
- **A grid makes the spacing check cheap.** The grid's cells are a spacing over the square root of two a side, so a cell holds at most one kept plant. A candidate checks only the cells within two of its own, not every plant kept so far (`packages/genshin-engine/src/vegetation/computeScatterPoints.ts`).

## What it costs to run

- **Per square, linear in the candidates.** Each candidate costs one accept call and a check of at most twenty-five cells, so the cost follows the candidates thrown, not the plants kept (`packages/genshin-engine/src/vegetation/computeScatterPoints.ts`).
- **Nothing is stored between squares.** Each square's grid is built and dropped with the call (`packages/genshin-engine/src/vegetation/computeScatterPoints.ts`).
- **A draw for each finest tile drawn.** Tens of them round the eye, each a few dozen flowers.

## Key files

| File                                                                    | Role                                                                             |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| `packages/genshin-engine/src/vegetation/computeScatterPoints.ts`        | Seeded dart throwing with the spacing check, returning the plants' x, z          |
| `packages/genshin-engine/src/models/vegetation/ScatterOptions.ts`       | The square's side, spacing, seed, candidate count and the ground's verdict       |
| `packages/genshin-world/src/services/windrise/computeWindrisePlants.ts` | Windrise's flowers on a finest tile: where they grow, their matrices and colours |
| `packages/genshin-world/src/workers/terrainTile.worker.ts`              | The worker that scatters a finest tile's flowers beside its ground               |
| `packages/genshin-engine/src/vegetation/createFlowerMaterial.ts`        | A flower's head, its colour, its shading and its sway                            |
| `packages/genshin-engine/src/random/createSeededRandom.ts`              | The seeded stream every candidate is drawn from                                  |

## Notes

- **The flowers' spacing, sizes and colours are provisional.** Being random, they are matched to the references by their statistics, their density, sizes and colours' spread ([trees and scatter](../../../changes/genshin-trees-and-scatter/design.md)).
- **A flower stands on its tile's finest heights.** As its tile morphs toward the next level at the far end of its range, the ground under a flower can move a few centimetres from where it stands (`packages/genshin-world/src/services/windrise/computeWindrisePlants.ts`, `packages/genshin-engine/src/terrain/createTerrainMaterial.ts`), where no one sees it.

## Open

- [ ] **Genshin's ground carries small flowers and pebbles that no placement record holds** — checked against the windrise plant record `~/Esposter.noindex/cache/content/946a6e8ffbec3108e329f8b117102f33e66e3f47a69bd34808e8f4b6003d11f6`: its 15 kinds are grass and one tree stump, with no flower or pebble, and against the layout's `~/Esposter.noindex/genshin-parity/extracted/windrise/layout/04803507/GameObject/cab-6c21939a8ed5a8ffe55909e01f09c52f/Area_MdProps_Flower26_Lod0.json`, which carries a local position, and the claim is not settled by them because a placed prop is not shown to be a small ground flower.
- [ ] **A draw for each finest tile round the eye, with tens of tiles and a few dozen flowers each** — no source yet: no count of the tiles drawn round the eye or of the flowers kept per tile is recorded; `FLOWER_CANDIDATE_COUNT` (48, `packages/genshin-world/src/services/windrise/constants.ts`) caps a tile's candidates but gives no kept count.
- [ ] **The ground under a flower moves a few centimetres as its tile morphs** — no source yet: the height gap between a finest tile and the next level at the far end of its morph range is not measured.
