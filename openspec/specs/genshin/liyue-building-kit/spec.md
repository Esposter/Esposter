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
- **THEN** its roof rises from the top of its walls

### Requirement: Bays and columns

Along each wall a building's bays SHALL be the fewest that keep each no wider than three metres, spread evenly, with a column at each bay's start and at the far end.

#### Scenario: Wall wider than a bay

- **WHEN** a wall is longer than three metres
- **THEN** it is divided into the fewest evenly spaced bays, none wider than three metres

### Requirement: Lattice openwork

Each bay between two columns SHALL carry a lattice panel with a rail at its sill and at its head and a bar every cell between them.

#### Scenario: Lattice between columns

- **WHEN** a bay lies between two columns
- **THEN** its lattice shows bars standing flat to the wall

### Requirement: Upturned eaves and finials

Each roof tier SHALL rise in a shell that is steep at the eave and levels toward the top, with its eave corners lifted and a finial on each top corner.

#### Scenario: Eave corners lift

- **WHEN** a roof tier is drawn
- **THEN** its eave corners curl upward past its middle

### Requirement: One geometry per material

A building SHALL be merged into one geometry per material, so that it is drawn in three draws.

#### Scenario: Building is drawn

- **WHEN** a building is drawn
- **THEN** it takes three draws, one for each material

### Requirement: Palette hues

The building palette SHALL draw lacquer in red and gold and terraces in stone, with these hues provisional until fitted against the reference.

#### Scenario: Building colours

- **WHEN** a building is shown
- **THEN** its columns and beams read red and gold and its terrace reads as stone
