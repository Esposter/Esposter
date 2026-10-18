## Purpose

The two building kits Nod-Krai's structures are made from, both generators over the engine's architecture parts. The dieselpunk kit merges boxes, pipework and smokestacks into one geometry for the ports, towns and Fatui works; the Frostmoon kit stands a ring of stones for the Scions' sites. Each takes its numbers as options, so the region's fitted values reach the mesh as data.

## Requirements

### Requirement: Dieselpunk structures merge into one geometry

The dieselpunk kit SHALL build a structure's boxes, pipe runs and smokestacks into one merged geometry drawn in one material.

#### Scenario: Structure with every part kind

- **GIVEN** a dieselpunk structure whose options hold boxes, pipe runs and smokestacks
- **WHEN** the structure is built
- **THEN** its boxes, pipe runs and smokestacks form one geometry
- **AND** that geometry is drawn in one material

#### Scenario: Smokestack joins the merge

- **GIVEN** a structure with a smokestack
- **WHEN** the structure is built
- **THEN** the smokestack is part of the merged geometry and is not dropped from it

### Requirement: Pipe runs stand between their two ends

The dieselpunk kit SHALL stand each pipe run as a cylinder of the given radius between its two ends, whichever direction the run points.

#### Scenario: Run pointing in any direction

- **GIVEN** a pipe run whose two ends lie in any direction from each other
- **WHEN** the structure is built
- **THEN** a cylinder of the given radius stands between the two ends, centred on the run

### Requirement: Frostmoon stones stand in an even ring

The Frostmoon kit SHALL stand its stones at even angles about the ring's centre, each standing on the ground and facing the centre.

#### Scenario: Ring built from a count and a radius

- **GIVEN** a stone circle with a count, a radius and a stone size
- **WHEN** the ring is built
- **THEN** the stones are evenly spaced about the centre
- **AND** each stone stands on the ground and faces the centre

### Requirement: Nasha Town's works take the game's own meshes

The world SHALL draw Nasha Town's dieselpunk works and ground from the game's meshes of those kinds and SHALL leave every other mesh kind undrawn.

#### Scenario: Nasha Town's export read by the parity inventory

- **GIVEN** the game's export of Nasha Town
- **WHEN** the parity inventory claims its meshes
- **THEN** its halls, cranes and pipes are drawn by the dieselpunk works
- **AND** its terrain tiles are drawn as the ground
- **AND** every other mesh kind is listed as not drawn yet

### Requirement: Kit numbers come from options supplied as data

The kits SHALL take every number they build from options supplied to them, so a region's fitted values change the mesh without changing the kit.

#### Scenario: Fitted values reach the mesh

- **GIVEN** a region's fitted values supplied as options
- **WHEN** the kit builds its structure
- **THEN** the mesh reflects those values
