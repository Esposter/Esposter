# Inazuma

The built parts of [Inazuma](../../../changes/genshin-inazuma/design.md): the building kit its towns are made of, the colours of its islands, and the region's data file. Inazuma City stands as one building of the kit at a provisional place until the fit writes it ([region buildings](../region-buildings/design.md)).

## Building kit

`createInazumaBuildingGeometry` builds a building from its proportions as three geometries, one per material: timber, plaster and roof tile. Each storey stands on the roof below, and an upper storey is inset from the one below by the setback, so a tower's storeys step up.

```mermaid
flowchart TD
  OP[InazumaBuildingOptions] --> FL[Timber floor slab on corner posts, floor height above the ground]
  FL --> WL[Corner posts and top beams, plaster panels between]
  WL --> RF[Roof on the walls, eaves past them by the overhang]
  RF -->|another storey| IN[Next storey stands on the roof, inset by the setback]
  IN --> WL
```

The roof is a convex solid: its base closes it, so a camera under the eaves sees a ceiling. Its ridge runs along the longer side, and a hipped roof slopes on all four sides while a gabled one closes its ends with gables.

## Palette

`services/inazuma/constants.ts` holds each island's colours in sRGB, chosen from the names the proposal gives each island and provisional until each island is measured against its reference. The building kit's timber, plaster and tile colours are there too.

## Region data

`data/regions/inazuma.json` is the region's data in the shape `regionDataSchema` reads, holding Inazuma City's building. Each of its areas takes the game's own outline ([world map](../world-map/design.md)), so the region is fetched as the camera nears any of them.

When the [parity](../parity/README.md) inventory draws Inazuma City's witness, the post-and-beam building stands in for the meshes named "Area_Dq_Build_", the Tenshukaku's tiers among them, and the terrain tiles are its ground; every other mesh there is named undrawn, kind by kind (`InazumaUndrawnMeshRegexMap`).

## Key files

| File                                                                           | Role                                                                   |
| :----------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| `packages/genshin-world/src/services/inazuma/createInazumaBuildingGeometry.ts` | The building kit: floors, frame, plaster and storeys                   |
| `packages/genshin-world/src/services/inazuma/createInazumaRoofGeometry.ts`     | A hipped or gabled roof as a closed convex solid                       |
| `packages/genshin-world/src/models/inazuma/InazumaBuildingOptions.ts`          | A building's proportions in metres                                     |
| `packages/genshin-world/src/services/inazuma/constants.ts`                     | The island palettes and the building colours                           |
| `packages/genshin-world/src/data/regions/inazuma.json`                         | Inazuma City's building, at a provisional place                        |
| `packages/genshin-world/src/services/inazuma/InazumaPartFamilyMeshRegexMap.ts` | Inazuma City's ground and buildings families, by the game's mesh names |
| `packages/genshin-world/src/services/inazuma/InazumaUndrawnMeshRegexMap.ts`    | Everything else in Inazuma City's export, undrawn, one entry a kind    |
