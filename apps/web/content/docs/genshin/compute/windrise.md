---
title: Compute queue: Windrise
description: Windrise, the first scene: the great oak's shape, the surface's pass list and the sun's direction.
---

# Windrise

## Queue

## Waiting

- [ ] `[page]` {windrise-oak-shape} needs game-exports, parity-page — **Windrise: the great oak's envelope against its export.** Build first, then run `pnpm -C scripts genshin:parity passes windrise --pass Shape`. Reads the same reference and exports, our oak built from `createTreeSpeciesOptionsMap`'s great oak over the `windrise/oak` record. Writes nothing; prints each family's readings. Bar: the `Oak envelope` outline, depth and normal each within the floor the exports' own halves read beside it, the per-card `Oak` readings diagnostics ([scene derivation](/docs/genshin/scene-derivation), Decisions). — blocked: the crown's and the buried roots' outline is not drawn, so the outline cannot reach its floor.
- [ ] `[page]` {windrise-pass-list} needs game-exports, parity-page — **Windrise: the whole pass list run once, the statue's shape read into its snapshot.** Run `pnpm -C scripts genshin:parity passes windrise`. Reads `~/Esposter/genshin-parity/references/windrise-statue-day.png` and `extracted/windrise/`, our statue as the `windrise/statue` record. Writes the Windrise section of `ParityPasses.snapshot.md`, and prints each pass's readings. Bar: the Statue family's outline within `SHAPE_OUTLINE_GATE_PIXELS` (1 px), its depth within `SHAPE_DEPTH_GATE` and its normal within `SHAPE_NORMAL_GATE_DEGREES` (10 degrees). — blocked: the statue's normal geometry, since the normal's 10 degrees waits on a statue fit that reads it.
- [ ] `[page]` {windrise-sun-direction} needs game-exports, parity-page — **Windrise: the sun's direction at its statue, by its shadows' edges.** `pnpm -C scripts genshin:parity shadows windrise-statue-day --witness windrise`. Reads `~/Esposter/genshin-parity/references/windrise-statue-day.png` (from `captures/yt-zPDi6WBJW9Y.mp4` at 360 s) and `extracted/windrise/`. Writes `~/Esposter/genshin-parity/shadows/windrise-statue-day.png`, outside the repository, and prints the scene's direction at its held noon and the solved one. Bar: the solved direction's edges within 2 px of the recording's; on a hit the runner reports it, and the main session reads the frame's minute off it through `computeSunDirection` for its `heldMinutes`. — waits on Windrise's Shape pass: the shadows are only as right as their casters, and a solve over the red oak and statue drifted to a sun on the horizon (32.91 px).
