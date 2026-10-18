## Purpose

Mondstadt's house kit, a parametric building of four materials. A stone ground floor, one to three storeys of plaster in a timber frame that overhang the one below, and a steep gable with dormers and a chimney, generated as one geometry per material from a footprint and its parameters.

## Requirements

### Requirement: House generated from its parameters

A Mondstadt house SHALL be generated from its footprint and parameters alone, as one geometry for each of its four materials, so that a house is one draw per material.

#### Scenario: House is drawn

- **WHEN** a house is drawn
- **THEN** it takes four draws, one for each material

### Requirement: Stone ground floor

A house SHALL have a stone ground floor the full size of its footprint and of the height given.

#### Scenario: Ground floor

- **WHEN** a house is built
- **THEN** its ground floor is a stone box the footprint's full size

### Requirement: Storeys overhang by one jetty each

Each storey SHALL be plaster, its front and back walls overhanging the storey beneath by one jetty, so that the overhang accumulates by one jetty per storey, while its gable walls do not overhang.

#### Scenario: Three storeys

- **WHEN** a house has three storeys
- **THEN** the top storey overhangs the ground floor by three jetties on its front and back walls

#### Scenario: Gable walls

- **WHEN** a storey is built
- **THEN** its gable walls stay flush with the storey beneath

### Requirement: Timber frame stands proud of the plaster

Each storey SHALL show a timber post at each corner and a beam along the top of each wall, standing a few centimetres proud of the plaster.

#### Scenario: Timber on a storey

- **WHEN** a storey is shown
- **THEN** its corner posts and top beams stand proud of the plaster

### Requirement: Gable roof with dormers and chimney

The roof SHALL be a gable running along the width with eaves overhanging the top storey, dormers evenly spaced at the middle of each slope, and a chimney a quarter of the way along the width rising past the ridge.

#### Scenario: Roof with dormers

- **WHEN** a house has dormers
- **THEN** they are evenly spaced at each slope's middle with their bases sunk into the roof

#### Scenario: Chimney

- **WHEN** a house is built
- **THEN** its stone chimney rises past the ridge a quarter of the way along the width

### Requirement: Dressing not yet built

A house SHALL not yet have window boxes, shutters, lanterns or banners, and the windmill, the city wall, the gate bridge and the cathedral SHALL not yet be built.

#### Scenario: House without dressing

- **WHEN** a house is shown
- **THEN** it has no window boxes, shutters, lanterns or banners
