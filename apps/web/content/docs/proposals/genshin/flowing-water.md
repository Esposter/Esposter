---
title: Flowing water
description: Proposal — Genshin's rivers and waterfalls, re-derived from the water the game places. A river's surface is a ribbon fitted to the game's own water surface along its course, its ripples and foam carried downstream at the speed its export or a recording sets, and a waterfall is a sheet of streaks fitted to the game's, with mist and a foam pool at its foot judged by their statistics.
model: claude-opus-5-5
---

# Flowing water

This page builds on the [water](/docs/genshin/water), whose material already grades still water by depth, foams its shores and glints in the sun, and on the [scene derivation](/docs/genshin/scene-derivation)'s layout pass, which stands what the game places where it places it. Still water is one surface at a region's level. A river is not: it falls with its valley, it runs one way, and it pours over cliffs. Liyue's river valleys, Sumeru's rainforest and Mondstadt's falls all need it.

## Decisions

- **A river's course is the game's.** The water surfaces the game places along a river are read in the region's layout pass, and a river's ribbon mesh is fitted to them: its course, width and level, with texture coordinates running downstream. Its shape is gated as any shape is, by its outline and depth against the exports drawn at each reference's camera.
- **Its flow is read before it is measured.** The direction and speed its ripples and foam move at come from the game's own water material and its texture coordinates where the export holds them; what it holds without fields is measured off a recording of the river in the motion pass. Foam collects at rocks and bends.
- **Waterfalls are objects the game places.** Each sheet stands where its record sets it, a mesh with scrolling streaks fitted to the game's own in an object pass. The mist and foam pool at its foot are particles, so they are judged by their statistics against a recording, their spread, density and colour, never pixel for pixel.
- **One material with a flow.** The still water's material gains a flow direction and speed. Still water has none, so the sea and lakes are unchanged.

## How it works

```mermaid
flowchart TD
  REC["The water the region's records place"] --> R["Ribbon fitted to the game's surface: course, width, level"]
  R --> SH{"Outline and depth against the exports?"}
  SH -->|off| R
  SH -->|within noise| FLOW{"Does the export hold the flow?"}
  FLOW -->|yes| M["Water material with the game's flow"]
  FLOW -->|no| MEAS["Flow measured off a recording, motion pass"] --> M
  REC --> W["Waterfall sheet at its record, fitted to its export"]
  W --> F["Mist and foam pool, judged by their statistics"]
```

## Scope

**Today:** the [water](/docs/genshin/water) is one surface at a region's level, still, with its foam, glints and caustics.

**This adds:**

1. **River ribbons** fitted to the water the game places.
2. **Waterfall sheets** at their records, with mist and a foam pool.

## Key files

| File                                                       | Role after the change                  |
| :--------------------------------------------------------- | :------------------------------------- |
| `packages/genshin-engine/src/nodes/createWaterMaterial.ts` | The water material, which gains a flow |

New files:

```text
packages/genshin-engine/src/water/        ← river ribbons and waterfall sheets fitted to the game's water
```

## Notes

- **Swimming is play.** Moving through the water, with its stamina, waits for the phase-three character controller.
