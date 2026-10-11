---
title: Terrain shapes
description: Proposal — the continent's ground fitted to the game's own terrain tiles, one region at a time, by the least representation that holds its heights within the reference's noise — hills, then the sharp features hills smear, with noise only for a residual too fine to fit, matched by its statistics. The ground is painted by layers fitted to the game's own, judged against the exports, and what a heightfield cannot hold is a placed object. The terrain's tiles already stream; this is what they are generated from.
model: claude-opus-5-5
---

# Terrain shapes

This page builds on the [terrain](/docs/genshin/terrain), whose quadtree, workers and floating origin already stream the ground, and is the ground's part of the [scene derivation](/docs/genshin/scene-derivation): its heights answer the layout and shape passes, its paint the surface pass. The continent is one connected land on the game's own tiles, so every region's ground is fitted the same way, and the fit grows only where its error says hills are not enough.

## Decisions

- **The ground is fitted, never drawn.** Each 1024-metre tile's TerrainData holds its heights in metres on the game's own coordinates ([game data formats](/docs/genshin/game-data-formats)), so a region's ground is a fit to those tiles: `fitRegionGround` fits each region's hills, features and residual. The game's coordinates are the world's, so no transform from a map's pixels is needed. What ships is the fit's parameters, the region's data, never the heights themselves.
- **The least representation that holds, in order.** Hills come first, as Windrise's are. Where their error stands above the gate, the fit adds the sharp features hills smear: cliff bands with a step height, ridge lines with a profile and plateau outlines, each found where the residual is largest and fitted to it, blended in by its signed distance with its own falloff. A coastline along the waterline is [deferred](/docs/genshin/deferred/terrain-coastlines). What is left below the features' reach is filled by noise whose amplitude and scale are fitted to the residual's own spectrum, judged by its statistics as anything random is, never by its heights point for point.
- **Features stop where they stop paying for what a vertex reads.** A feature's cost is the time it adds to every vertex it reaches, about four hills' (`createTerrainShapeHeight.bench.md`), and what bytes and ready time it adds are not what binds: the record grows by kilobytes against the world screen's hundreds to spare, and the oak's surroundings, where ready waits, hold none. So a stop is judged by the extent's squared error a step takes off for each hill a vertex reads, against the hills' narrowest rung, the cheapest return the fit already pays for, and the stop is the deepest whose step still returns what that rung does: 200 a kind and 0.1% of what is left (`placeTerrainFeatures`). Over Windrise the step to it returns a little more than the rung and the step past it, to 400 a kind and 0.05%, under half; it takes about a fifth off the fitted extent's error, holds the bar within 60 metres and moves no landmark's root. A new kind of feature is added on the same terms, only where it pays at that rate.
- **Gated by the shape pass's measure.** A tile's fit is done when its height error over the tile, and its outline and depth against the exports drawn by the witness at each reference's camera, stand within the reference's noise; the fit prints both, and a test freezes the fitted parameters' error once the gate holds.
- **The ground's layers are fitted to the game's own.** A region's layers lie where a field fitted from its terrain's base maps puts them, each painting its class's mean colour ([ground paint](/docs/genshin/ground-paint)), and a rule of the slope, the height or a path's distance goes over the field only once a measure shows the field needs it. The surface pass judges both by the Ground's unlit colour against the exports'.
- **What a heightfield cannot hold is a placed object.** Overhangs, arches, stone pillars, sea stacks, caves and the floating rocks of Liyue and Inazuma are objects the game places, so they stand where their StreamGen records set them in the region's layout pass and are rebuilt in object passes, never forced into the heights.
- **The same heights serve collision.** The worker keeps each tile's heights for the `collision` module's height query, which [exploring](/docs/proposals/genshin/exploring) adds, so the camera and later the character stand on the surface that is drawn.
- **The fit's data follows reach.** A region's fitted parameters load with its region data, so the ground's data grows with what is in reach, never with the continent.

## How it works

```mermaid
flowchart TD
  TD["The region's TerrainData tiles: heights in metres, layers where held"] --> HILLS["Hills fitted, widest first"]
  HILLS --> G1{"Height error within the reference's noise?"}
  G1 -->|no| FEAT["Sharp features fitted where the residual is largest: plateaus, cliffs, ridges"]
  FEAT --> G1
  G1 -->|"yes, past the features' reach"| FD["The residual's fade: each 64 metre cell's leftover against the gate, softened"]
  FD --> NZ["Noise fitted to the leftover's spectrum where the fade draws it"]
  NZ --> SH{"Outline and depth against the exports at each reference's camera?"}
  SH -->|off| FEAT
  SH -->|"within noise, frozen"| PAINT["Ground layers fitted to the game's, by unlit colour against the exports"]
  PAINT --> WK["Terrain worker: a tile's heights and paint from the region's fitted data"]
```

## Scope

**This adds:**

1. **Each region's gate**, the bar its composed ground is held to once its features are run, in place of Windrise's.
2. **The ground layers fitted**: the weights the game's tiles hold read by the inventory and written in place of the rules', each layer's colours fitted to the game's, and the paths read from its path layer.
3. **The heights kept for collision**, when exploring's camera asks for them.
4. **Each area's outline** in the [world map](/docs/genshin/world-map)'s catalogue, read from the game's own area data where the inventory finds it and otherwise drawn round the tiles its placements stand on, in place of Galesong Hill's provisional one.

## Key files

| File                                                               | Role after the change                                                                      |
| :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/fit/fitRegionGround.ts`        | The region fit: hills, features and residual, and the gate it prints each region against   |
| `scripts/src/services/genshinAssets/fit/placeTerrainFeatures.ts`   | The greedy placement each kind of feature's fit shares, and the stop it holds each kind to |
| `scripts/src/services/genshinAssets/fit/fitTerrainResidual.ts`     | The residual's noise, its scale and amplitude matched to its statistics                    |
| `scripts/src/services/genshinAssets/fit/fitTerrainResidualFade.ts` | The residual's fade, each cell's leftover against the gate, softened                       |
| `scripts/src/services/genshinAssets/fit/fitGaussianHills.ts`       | The first rung of the fit, its error deciding whether features follow                      |
| `packages/genshin-engine/src/terrain/computeTerrainTile.ts`        | The tile generator, which samples the fitted features and noise                            |
| `packages/genshin-world/src/workers/terrainTile.worker.ts`         | The worker, which reads a region's fitted data in place of its code                        |

## Sources

- [Making maps with noise functions](https://www.redblobgames.com/maps/terrain-from-noise/), Red Blob Games: noise octaves summed into height, used here only for the residual below the fitted features, its octaves' amplitudes fitted to that residual.
