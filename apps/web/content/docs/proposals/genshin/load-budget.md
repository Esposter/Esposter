---
title: Load budget
description: Proposal — what a screen loads before it shows, trimmed step by step against its measured budget, until the world loads only what its first frame needs. The meter is built; this page is the trims it is held to.
model: claude-haiku-5-5
needs: [parity-page]
touches:
  [
    "packages/genshin-world/parity/**",
    "scripts/src/services/genshinParity/**",
    "packages/genshin-world/src/components/World/**",
    "packages/genshin-world/src/components/Game/**",
    "apps/web/app/components/Genshin/**",
    "packages/genshin-engine/src/collision/**",
  ]
---

# Load budget

Miliastra Wonderland meters a stage's load as its author builds it: every placed object takes its share of a fixed budget, and the meter says how much is left. The recreation has the same need. A screen's loading time grows with every dataset, region and warm-up added to its gate, and the [load budget](/docs/genshin/load-budget) meter says which step took the time and whether a change made it worse. What it does not yet do is lower that time.

## Decisions

- **Each trim is measured before and after.** A trim is run with `pnpm -C scripts genshin:parity load <screen>` on both sides of the change, and lowers its screen's budget in the same commit, so the meter only tightens.

## Scope and order

1. **Trim, one step at a time, each measured before and after with `load`:**
   - Read only the region ground in the first view at the gate, and the rest after the world shows. `readWindriseData` reads all seven region grounds and the base ground at the gate.
   - Leave the far terrain rings out of `ready`, so the first frame waits on the near tiles only. Built as the finest level only, `checkIsFirstFrameSettled`, as the [as-built page](/docs/genshin/load-budget) gives.
   - A worker that imports only the terrain functions, the candidate the terrain's measure named. Built as the engine's `genshin-engine/terrainWorker` entry, as the [as-built page](/docs/genshin/load-budget) gives; it moved neither median, since that measure is mostly the main thread's wait rather than the tiles'.
   - Build the landmark collider's octrees without holding the main thread through the load. `createLandmarkCollider` builds each landmark's octree on the main thread as its region arrives, and the two largest landmarks' builds are most of the world's ready, as the as-built page's decision on the terrain worker measures. Every triangle a landmark draws still collides, the crown's leaves too, as the [character controller](/docs/genshin/character-controller) gives, so the trim is where or how the octree is built, never what it holds. A tile's compile is not the cost, so it is not a candidate.
   - Compile the first view's materials before ready, and the rest after. Built as the view alone: the rest, compiled after ready, was a frame of seconds and built programs no turn or walk then drew, so nothing compiles it, as the [as-built page](/docs/genshin/load-budget) gives.
   - Read each name-text and stat table when its first reader needs it, rather than all of them at the world gate. Built: the Frostbearing Tree's levels are read by the offer, the tables an artifact is rolled and enhanced from by nothing yet, and the names and the other stat tables stay at the gate, since the first frame's bag and combatants read them, as the [as-built page](/docs/genshin/load-budget) gives.
   - Read each region's palette with its region's data, as the region comes in reach, rather than every region's at the gate. Only Mondstadt's buildings are in reach of Windrise, so every other region's palette is read for nothing. The region's read carries its palette, so the world's ready still waits on the palette its buildings are drawn in.
2. **Hold.** Each trim lowers its screen's budget in the same commit, so the meter only tightens.

## Key files

| File                                                               | Role                                                       |
| :----------------------------------------------------------------- | :--------------------------------------------------------- |
| `packages/genshin-world/parity/benchScene.ts`                      | The scene bench whose counts the load bench takes at ready |
| `scripts/src/services/genshinParity/commands/benchCommand.ts`      | The frame bench's command, which `load` stands beside      |
| `packages/genshin-world/src/components/World/Screen/Index.vue`     | The world's gate of reads before it shows                  |
| `packages/genshin-world/src/services/windrise/readWindriseData.ts` | The region grounds read at the gate                        |
| `packages/genshin-world/src/components/World/Terrain/Index.vue`    | The tiles whose arrival the world's ready waits on         |
| `packages/genshin-engine/src/collision/createLandmarkCollider.ts`  | The landmarks' octrees, built on the main thread at load   |

## Sources

- [Performance: mark() and measure()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure), MDN: named measures the browser keeps and DevTools draws on its Timings track.
- [PerformanceResourceTiming](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming), MDN: every fetch's transfer size, read without a counter of our own.
