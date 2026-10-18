## Purpose

As built — Inazuma's building kit (a raised timber floor, post-and-beam walls with plaster panels, a hipped or gabled roof with deep eaves, storeys stacked by a setback), its island palette and its region data file. Inazuma City's first building stands at a provisional place; the terrain of its islands is not yet built.

## Requirements

### Requirement: A building stacks its storeys, each set back from the one below

A building SHALL be made of a raised timber floor, corner posts with plaster panels between them, and a roof, and each storey above SHALL stand on the roof below it, set back from that roof's edge.

#### Scenario: A tower's storeys step up

- **GIVEN** a building has more than one storey
- **WHEN** it is drawn
- **THEN** each storey above is inset from the storey below
- **AND** each storey stands on the roof of the one below

#### Scenario: The roof eaves reach past the walls

- **GIVEN** a building has a roof
- **WHEN** it is drawn
- **THEN** the roof extends past the walls by its overhang

### Requirement: A roof slopes on the sides its shape calls for

A hipped roof SHALL slope on all four sides, and a gabled roof SHALL close its two ends with gables.

#### Scenario: A hipped roof slopes on four sides

- **GIVEN** a building has a hipped roof
- **WHEN** it is drawn
- **THEN** the roof slopes down on all four sides

#### Scenario: A gabled roof closes its ends with gables

- **GIVEN** a building has a gabled roof
- **WHEN** it is drawn
- **THEN** each of its two ends is closed by a gable

### Requirement: Each island is drawn in its own palette

Each island of the region SHALL be drawn in its own colours, and the building kit SHALL use its timber, plaster and tile colours.

#### Scenario: An island takes its own colours

- **GIVEN** a part of the region stands on a given island
- **WHEN** it is drawn
- **THEN** it uses that island's colours

### Requirement: Inazuma City shows one building at a provisional place

Inazuma City SHALL show its first building at a provisional place until the region's fit writes its real place.

#### Scenario: The city's building stands where the region data places it

- **GIVEN** the region data holds Inazuma City's building
- **WHEN** the city is drawn
- **THEN** the building stands at the place the region data gives it

### Requirement: Each area of the region is fetched as the camera nears it

Each area of the region SHALL take the game's own outline, and the region SHALL be fetched as the camera comes near any of its areas.

#### Scenario: Approaching an area loads the region

- **GIVEN** the camera is far from every area of the region
- **WHEN** the camera comes near one of its areas
- **THEN** the region is fetched and drawn

### Requirement: Undrawn meshes are named as undrawn

Each mesh of Inazuma City's exported scene that the parity witness does not draw SHALL be named as undrawn by its kind.

#### Scenario: A mesh the witness does not draw is named

- **GIVEN** a mesh in the exported scene is not one the witness draws
- **WHEN** the parity witness is built
- **THEN** the mesh is listed as undrawn under its kind
