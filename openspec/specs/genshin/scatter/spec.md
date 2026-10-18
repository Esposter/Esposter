## Purpose

The plants no record places, the small flowers among a region's grass, scattered over each finest terrain tile by seeded dart throwing in the terrain's worker. Each candidate point is kept only where the ground is grass above the water and no kept plant stands closer than the spacing, so the same tile always grows the same flowers, drawn as one instanced draw a tile that shows and goes with it.

## Requirements

### Requirement: A tile always grows the same flowers

Each finest terrain tile SHALL grow the same flowers in the same places every time it is generated.

#### Scenario: A regenerated tile repeats its flowers

- **GIVEN** a finest terrain tile has grown its flowers
- **WHEN** the same tile is generated again
- **THEN** the same flowers appear in the same places

### Requirement: Flowers grow only on grass above the water and keep their spacing

Flowers SHALL grow only on grass above the water, and no two flowers SHALL stand closer together than the spacing.

#### Scenario: A candidate on bare ground or water grows no flower

- **GIVEN** a candidate point falls on bare ground or on water
- **WHEN** the tile is scattered
- **THEN** no flower grows at that point

#### Scenario: A candidate too close to a flower grows none

- **GIVEN** a flower already stands within the spacing of a candidate point
- **WHEN** the tile is scattered
- **THEN** no flower grows at the candidate point

### Requirement: Only the finest tiles grow flowers

Only the finest terrain tiles SHALL grow flowers, since a coarser tile is drawn too far away for a flower to show.

#### Scenario: A coarser tile grows no flowers

- **GIVEN** a terrain tile past the finest level is drawn
- **WHEN** the tile is scattered
- **THEN** no flowers grow on it

### Requirement: A tile's flowers show, hide and go with their tile

A tile's flowers SHALL show, hide and be removed together with the tile they grow on.

#### Scenario: Hiding a tile hides its flowers

- **GIVEN** a tile with flowers is shown
- **WHEN** the tile is hidden
- **THEN** its flowers are hidden with it

#### Scenario: Removing a tile removes its flowers

- **GIVEN** a tile with flowers is in view
- **WHEN** the tile leaves the view and is freed
- **THEN** its flowers are freed with it

### Requirement: Flowers bend with the wind more the taller they stand

Flowers SHALL sway with the wind, and the taller a flower stands the further it bends.

#### Scenario: A taller flower bends further in the wind

- **GIVEN** a flower and a taller flower stand in the same wind
- **WHEN** the wind blows
- **THEN** the taller flower bends further than the shorter one

### Requirement: Flower density and sizes are provisional until matched to references

The flowers' spacing, sizes and colours SHALL be treated as provisional until their statistics are matched to the reference screenshots.

#### Scenario: Flowers are matched to references by their statistics

- **GIVEN** a reference screenshot shows the region's flowers
- **WHEN** the flowers are compared with it
- **THEN** their density, size spread and colour spread are matched by statistics rather than by individual flowers
