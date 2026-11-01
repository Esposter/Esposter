## Purpose

The parametric building kit that builds Liyue's towns, and the palette its materials are drawn in. A building is a stone terrace, red lacquer columns and beams with openwork lattice between them, and one to three roof tiers, each with upturned eaves and ridge ornaments. It is merged into one geometry per material, so a building is three draws.

## Requirements

### Requirement: Building form

A Liyue building SHALL be a stone terrace with lacquered columns and beams, and one to three roof tiers stacked above its walls.

#### Scenario: Three tiers stack upward

- **WHEN** a building is built with three roof tiers
- **THEN** each tier above the first is raised one tier height above the one below

#### Scenario: Single tier

- **WHEN** a building is built with one roof tier
- **THEN** its roof rises from the top of its walls (`packages/genshin-world/src/services/liyue/createLiyueBuildingGeometries.ts` lines 115 to 118, where tier 0's `baseY` is `wallTop`, set on line 37)

### Requirement: Bays and columns

Along each wall a building's bays SHALL be the fewest that keep each no wider than three metres, spread evenly, with a column at each bay's start and at the far end.

#### Scenario: Wall wider than a bay

- **WHEN** a wall is longer than three metres
- **THEN** it is divided into the fewest evenly spaced bays, none wider than three metres (`packages/genshin-world/src/services/liyue/getLiyueBays.ts` lines 7 to 8, with `LIYUE_BAY_WIDTH` at 3 in `packages/genshin-world/src/services/liyue/constants.ts` line 18), and a column stands at each bay's start and at the far end of the front and back walls (`packages/genshin-world/src/services/liyue/createLiyueBuildingGeometries.ts` lines 43 to 52)

### Requirement: Lattice openwork

Each bay between two columns SHALL carry a lattice panel with a rail at its sill and at its head and a bar every cell between them.

#### Scenario: Lattice between columns

- **WHEN** a bay lies between two columns
- **THEN** its lattice shows bars standing flat to the wall (`packages/genshin-world/src/services/liyue/createLiyueLatticeBoxes.ts` lines 15 to 24 draw each bar as a box `LIYUE_LATTICE_BAR_SIZE` (0.06 metres, `packages/genshin-world/src/services/liyue/constants.ts` line 29) square in section, and `packages/genshin-world/src/services/liyue/createLiyueWallBox.ts` lines 13 to 16 centre it on the wall's face, so it lies in the wall's plane)

### Requirement: Upturned eaves and finials

Each roof tier SHALL rise in a shell that is steep at the eave and levels toward the top, with its eave corners lifted and a finial on each top corner.

#### Scenario: Eave corners lift

- **WHEN** a roof tier is drawn
- **THEN** its eave corners curl upward past its middle (`packages/genshin-world/src/services/liyue/createLiyueRoofTierGeometry.ts` line 51 lifts each eave point by its squared distance from the centre, so a corner, at 2, lifts more than a side's middle, at 1, with `LIYUE_ROOF_EAVE_CURL` at 0.9 in `packages/genshin-world/src/services/liyue/constants.ts` line 32)

### Requirement: One geometry per material

A building SHALL be merged into one geometry per material, so that it is drawn in three draws.

#### Scenario: Building is drawn

- **WHEN** a building is drawn
- **THEN** it takes three draws, one for each material (`packages/genshin-world/src/services/world/BuildingKitPartsMap.ts` lines 44 to 51 returns three parts, and `packages/genshin-world/src/components/World/Landmark/Building/Index.vue` lines 26 to 34 makes one mesh of each)

### Requirement: Palette hues

The building palette SHALL draw lacquer in red and gold and terraces in stone, with these hues provisional until fitted against the reference.

#### Scenario: Building colours

- **WHEN** a building is shown
- **THEN** its columns and beams read red and gold and its terrace reads as stone

## Open

- [ ] **Columns and beams read red and gold, and the terrace reads as stone** — contradicted by `packages/genshin-world/src/services/liyue/constants.ts` lines 11 and 12: the lacquer that holds the columns, beams and lattice (`packages/genshin-world/src/services/liyue/createLiyueBuildingGeometries.ts` line 124) is red (`LIYUE_LACQUER_COLOR`, 0xa8262a), and the gold is the roof's (`LIYUE_ROOF_COLOR`, 0xd8a33a), each given its part by `packages/genshin-world/src/services/world/BuildingKitPartsMap.ts` lines 48 and 49, where the page holds the columns and beams as red and gold. The hosted palette record, `regions/liyue/palette`, replaces these where it samples them, and it is not on disk.
