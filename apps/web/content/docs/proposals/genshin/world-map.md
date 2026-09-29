---
title: World map
description: Proposal — the data the world is built from. One metre-based coordinate system for the continent, fixed by a single transform from the official map. A catalogue of regions, areas and subareas as the game names them, each with its outline, weather and palette. A landmark schema placing every statue, waypoint and building as a kit with parameters. Separate layers for the places the game draws on their own map, such as Enkanomiya and the Chasm's mines. Each region's data loads only when the camera nears it.
model: claude-opus-5-5
---

# World map

This page belongs to the [Genshin](/docs/proposals/genshin) program. Its data is drawn by the [reference board](/docs/proposals/genshin/reference-board)'s authoring page. Every other page reads the world through it. [Terrain](/docs/proposals/genshin/terrain) takes its shapes from it, the [sky](/docs/proposals/genshin/sky-and-time) its weather, [vegetation](/docs/proposals/genshin/vegetation) its biomes, and [exploring](/docs/proposals/genshin/exploring) its waypoints. It is the one place a region is described, and it is organised as the game organises its own map.

## Decisions

- **Metres, one continent, one transform.** World units are metres, with x east, z south and y up. The official map's pixels map to world coordinates by one affine transform for the whole continent. The reference board's per-region measurements check it, and any mismatch is resolved in that transform, never by moving one region. Heights are metres above sea level.
- **The catalogue follows the game's hierarchy.** It runs region, then area, then subarea, then point of interest, with the names the game and its wiki use: Mondstadt's Starfell Valley holds Windrise, Liyue's Minlin holds Jueyun Karst, and so on. Each area has its outline polygon, the weather it can have, its biome palette, its grade, and its reference captures. An area is also the unit of streaming and of the region pages' build order.
- **Layers for places on their own map.** The surface is one layer. Places the game draws on a separate map, including Enkanomiya, the Chasm's underground mines and the Sea of Bygone Eras, are layers with their own terrain, sky and water settings, entered at their gates. Caves that the surface map shows stay part of the surface.
- **Landmarks are kits with parameters.** A landmark record gives its kind, its catalogue parent, its position, rotation and footprint, the region kit that builds it, the kit's parameters, and the captures it was matched against. Kinds are the Statue of The Seven, the Teleport Waypoint, the Domain entrance, buildings, bridges, towers, rock formations and landmark trees. A city is a set of landmarks along authored streets, not one monolith.
- **Waypoints and statues are ordinary landmarks.** They are placed like any building. They are also what [exploring](/docs/proposals/genshin/exploring) jumps between, as the game fast-travels between them.
- **Data is validated and split by region.** The catalogue and each region's shapes and landmarks are JSON checked against Zod schemas at load. The catalogue is imported, since every view needs it. Each region is one static JSON file at `/genshin/<region>.json`, where `<region>` is its catalogue id. It is fetched when the camera comes near the region's outline, and its parsed data is dropped when it leaves reach. It is fetched rather than imported because the browser keeps an imported module for the life of the page, so an imported region could never be released. Opening Mondstadt therefore never downloads Fontaine, and leaving it frees its memory.

## How it works

```mermaid
flowchart TD
  AUTH[Authoring page] -->|writes| RJ[Region data: shapes, paint, landmarks]
  AUTH -->|writes| CAT[Catalogue: regions, areas, subareas, layers]
  CAM[Camera position and layer] --> NEAR{Which region outlines are in reach?}
  CAT --> NEAR
  NEAR -->|newly in reach| IMP[Fetch of the region's JSON]
  IMP --> Z{Valid against the schema?}
  Z -->|no| ERR[Region not drawn; error logged]
  Z -->|yes| USE[Terrain shapes, landmarks, weather, palette]
  NEAR -->|out of reach| DROP[Region data released]
```

## Scope

**Today:** nothing in the app describes a map.

**This adds:**

1. **The schemas** for the catalogue, the shapes, the paint and the landmarks, with the continent transform.
2. **The loader** that fetches and drops regions by reach.
3. **The catalogue's names** for every region, area and subarea the game ships. The shapes and landmarks come region by region, with their pages.

## Key files

| File                                                       | Role after the change                                                 |
| :--------------------------------------------------------- | :-------------------------------------------------------------------- |
| `apps/web/app/services/agentConsole/world/getViewReach.ts` | The view-reach bound the region loader applies at a continent's scale |

New files:

```text
packages/genshin-engine/src/world/        ← schemas, continent transform, region loader
apps/web/app/assets/genshin/catalogue.json
apps/web/public/genshin/<region>.json     ← one region's shapes, paint and landmarks, named by its catalogue id
```

## Notes

- **Names are facts, and outlines are drawn.** The catalogue's names come from the game. Each outline is drawn by hand over the stencil, which is why no region's shape is imported from any map's data.
- **A schema failure hides one region, not the world.** A region whose data fails validation is not drawn and the rest of the continent loads, so a mistake in one region's authoring never blanks the page.

## Sources

- [Genshin Impact's continent](https://genshin-impact.fandom.com/wiki/Teyvat), Genshin Impact Wiki: region above area above subarea, the hierarchy the catalogue takes.
- [Map](https://genshin-impact.fandom.com/wiki/Map), Genshin Impact Wiki: areas lit on the map by their Statue of The Seven, and Enkanomiya and the Chasm's underground mines unlocked as maps of their own, which is where the layers come from.
- [Teleport Waypoint](https://genshin-impact.fandom.com/wiki/Teleport_Waypoint) and [Statue of The Seven](https://genshin-impact.fandom.com/wiki/Statue_of_The_Seven), Genshin Impact Wiki: fast travel between waypoints and statues, one statue per area.
