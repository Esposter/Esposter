# Regions and kits

Read when adding a region, a region's data or landmarks, a character's kit, or a building's kit. The one-line rule is in `SKILL.md`; this page is its reasoning.

- **Region data and kits are the world package's**: heights, colours, look and a region's own kits live in `packages/genshin-world/src/services/<place>/` with their models in `src/models/<place>/`, its landmarks in `src/data/regions/<region>.json` (served by the app's server at `GENSHIN_REGION_DATA_BASE_URL`), and the engine keeps only the generic primitives they are built from (`kits/architecture`, the tree, the statue). Every region shares the world's one barrel, so a region's exports carry its name (`createLiyueBuildingGeometries`, `FONTAINE_STOREY_HEIGHT`): two regions exporting one name is a `TS2308` in the build. A building landmark names its region's kit, and `BuildingKitPartsMap` is where a kit is drawn (`apps/web/content/docs/genshin/region-buildings.md`).
- **A character's kit is one module, and its map is derived, never written by hand** (`apps/web/content/docs/genshin/kits/index.md`).
