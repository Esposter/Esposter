---
title: Buildings
description: The parametric building kit: a rectangular platform, four walls standing on it and a flat or conical roof over them, built from its options as one geometry for one material. A region's tribe variants are sets of these options and a palette, and the kit knows neither.
---

# Buildings

A region's settlements are built from a small set of pieces that repeat, so the kit builds a building from its dimensions rather than from a stored mesh. One building is a platform the walls stand on, four walls and a roof, each given in metres from the ground. Its geometry is one mesh, so a building is one draw for its material.

## How it works

```mermaid
flowchart TD
  OP[Building options: footprint, heights, wall thickness, roof kind] --> PL[Platform: a slab from the ground to the platform's top]
  PL --> WL[Four walls on the platform, each a box of the wall thickness]
  WL --> RK{Roof kind}
  RK -->|Flat| FR[A slab over the walls]
  RK -->|Conical| CR[A cone scaled to the footprint, standing on the walls' top]
  FR --> MG[Merged into one geometry]
  CR --> MG
```

- **The pieces are boxes, and the walls are the boxes' inner ring.** The platform spans the whole footprint. Each wall is a box along one edge, the two long walls running the full width and the two short walls fitting between them, so the four boxes meet at the corners without overlapping (`createBoxesGeometry`).
- **A flat roof is one more box** over the walls, its thickness its roof height.
- **A conical roof is a cone scaled to the footprint.** A unit cone is stretched to half the footprint's width and depth, so its base lies over the walls' outside edge on any rectangle, not only a square. Its apex stands the roof height above the walls.
- **The result is merged** into one geometry, the parts freed once merged (`mergeGeometryParts`).

The building is centred on the origin and stands on it, so a caller places it on the ground with its position.

## Key files

| File                                                                    | Role                                                              |
| :---------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `packages/genshin-engine/src/kits/architecture/createBuildingGeometry.ts` | Builds a building's platform, walls and roof as one geometry     |
| `packages/genshin-engine/src/models/kits/architecture/BuildingOptions.ts` | The dimensions a building is built from, in metres               |
| `packages/genshin-engine/src/models/kits/architecture/RoofKind.ts`      | The roof a building is capped with: flat or conical              |
| `packages/genshin-engine/src/kits/architecture/createBoxesGeometry.ts`  | The box builder the walls and platform are made from             |
