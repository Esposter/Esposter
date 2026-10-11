---
title: Ground detail
description: Proposal — the ground's fine detail at each region's own scale. Each texture's metres per texel is read off the base map in place of one constant shared by every texture, so the detail's size matches the game's on every region's ground layers.
model: claude-opus-5-5
needs: [game-exports]
touches:
  [
    "packages/genshin-engine/src/terrain/createGroundPaintColor.ts",
    "packages/genshin-engine/src/models/terrain/GroundPaint.ts",
    "packages/genshin-world/src/components/World/Screen/Ground.reference.ts",
  ]
---

# Ground detail

The [ground paint](/docs/genshin/ground-paint) page keeps the layers and their colours as built. Its detail textures still share one metres-per-texel constant, so their size on the ground is a guess rather than a read.

## Decisions

- **Each texture's scale is read from its base map.** The base map shows the texture's own extent, so its metres per texel is measured from it, one value for each texture rather than one for all.
- **The ground's layers keep their fitted field.** Only the detail's scale changes; where each layer lies stays as the paint fits it from the terrain tiles.

## Scope

1. Measure each ground texture's metres per texel from its base map.
2. Replace the shared constant with the measured value, one per texture, on Windrise first and then each region's ground layers.
3. Hold the change by the ground's own reference frame, checked by eye.

## Key files

| File                                                                     | Role                                                                |
| :----------------------------------------------------------------------- | :------------------------------------------------------------------ |
| `packages/genshin-engine/src/terrain/createGroundPaintColor.ts`          | Blends each layer's colour at a vertex by its weight                |
| `packages/genshin-engine/src/models/terrain/GroundPaint.ts`              | Holds one biome's layers, their patches and their rules             |
| `packages/genshin-world/src/components/World/Screen/Ground.reference.ts` | The ground's reference frame and the measures it was scored against |
