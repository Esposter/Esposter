## Purpose

The parametric building kit: a rectangular platform, four walls standing on it and a flat or conical roof over them, built from its options as one geometry for one material. A region's tribe variants are sets of these options and a palette, and the kit knows neither.

## Requirements

### Requirement: A building is one geometry of platform, walls and roof

A building SHALL be built from its options as a platform, four walls standing on it and a roof over the walls, merged into one geometry.

#### Scenario: Flat roof builds a slab over the walls

- **GIVEN** a building's options give a flat roof
- **WHEN** the building is built
- **THEN** its platform, its four walls and a flat slab over the walls form one geometry

#### Scenario: Conical roof stands on the walls' top

- **GIVEN** a building's options give a conical roof
- **WHEN** the building is built
- **THEN** the roof is a cone standing on the top of the walls, scaled to the footprint

### Requirement: A building stands on the origin until it is placed

A building SHALL be centred on the origin and stand on it, so a caller places it by setting its position.

#### Scenario: Placing a built building

- **GIVEN** a building has been built
- **WHEN** the caller sets its position
- **THEN** the building stands on the ground at that position

### Requirement: A conical roof covers any rectangular footprint

A conical roof SHALL cover the outside edge of any rectangular footprint, not only a square.

#### Scenario: Non-square footprint

- **GIVEN** a rectangular footprint that is not square
- **WHEN** a building with a conical roof is built
- **THEN** the cone's base lies over the outside edge of the walls on all four sides

### Requirement: The kit takes only dimensions and a roof kind

The building kit SHALL build from its dimensions and roof kind alone, leaving regions, tribes and palettes to its callers.

#### Scenario: Tribe variant built by its caller

- **GIVEN** a region defines a tribe variant as building options and a palette
- **WHEN** a caller builds the variant
- **THEN** the building is built from the options alone
- **AND** the palette is not applied by the kit
