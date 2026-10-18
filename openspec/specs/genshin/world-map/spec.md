## Purpose

The data the Genshin world is built from. A catalogue of every region, area and subarea the game ships, organised as the game organises its own map, with the separate maps as layers. Each region's authored data (its landmarks now, its shapes as they are drawn) is a JSON file fetched when the camera comes within reach of its areas and released when it leaves, validated against its schema on the way in.

## Requirements

### Requirement: Catalogue follows the game's own hierarchy

The world SHALL organise its regions, areas and subareas as the game does, with the separate maps as layers of their own.

#### Scenario: Windrise as a subarea

- **GIVEN** the catalogue is read
- **WHEN** Windrise is looked up
- **THEN** Windrise is a subarea of Galesong Hill in Mondstadt

#### Scenario: Separate map as a layer

- **GIVEN** Enkanomiya is a separate map of its own
- **WHEN** the catalogue is read
- **THEN** Enkanomiya is held as a layer of its own

### Requirement: Region loads only within reach of its outlined areas

A region SHALL load only when the camera comes within reach of one of its outlined areas, and a region with no outlined area SHALL never load.

#### Scenario: Camera comes within reach

- **GIVEN** the camera moves to within reach of an outlined area of a region
- **WHEN** the region is checked
- **THEN** the region's data is fetched and its landmarks appear

#### Scenario: Region with no outline

- **GIVEN** a region has no outlined area
- **WHEN** the camera moves anywhere
- **THEN** the region never loads

### Requirement: Region released when the camera leaves its reach

A region SHALL be released when the camera leaves its reach, except its ground, which SHALL stay once it has arrived.

#### Scenario: Camera leaves reach

- **GIVEN** a region's data is loaded
- **WHEN** the camera leaves its reach
- **THEN** the region's landmarks are removed
- **AND** its data is released

#### Scenario: Ground kept after release

- **GIVEN** a region's ground has arrived
- **WHEN** the camera leaves its reach
- **THEN** the ground is kept

### Requirement: Region failing validation or stalling hides only itself

A region whose data fails validation, or whose data does not answer in time, SHALL be left undrawn while the rest of the continent loads.

#### Scenario: Invalid region data

- **GIVEN** a region's data fails its schema check
- **WHEN** the region is loaded
- **THEN** the failure is logged
- **AND** that region is left undrawn
- **AND** the rest of the continent loads

#### Scenario: Stalled region data

- **GIVEN** a region's data does not answer within its time limit
- **WHEN** the world is readied
- **THEN** the world is not held from being ready on that region's account

### Requirement: Area outlines are the game's own where it gives them

An area's outline SHALL be the game's own polygon where the game gives one, and a subarea the game files as a city SHALL be marked as one.

#### Scenario: Area with the game's polygon

- **GIVEN** the game gives an area a polygon
- **WHEN** the catalogue is read
- **THEN** the area's outline is that polygon

#### Scenario: Area with no polygon from the game

- **GIVEN** the game gives an area no polygon
- **WHEN** the catalogue is read
- **THEN** the area keeps the outline it was given before

#### Scenario: City marked as a city

- **GIVEN** the game files a subarea as a city
- **WHEN** the catalogue is read
- **THEN** the subarea is marked as a city

### Requirement: Outlines are flat

An outline SHALL hold every height over the ground it covers, since the catalogue keeps only the outline on the ground.

#### Scenario: Area holds every height

- **GIVEN** an area's outline covers a place
- **WHEN** a point at any height over that place is checked
- **THEN** the point is inside the area

### Requirement: Event-only places left out

Places that existed only for an event SHALL be left out of the catalogue.

#### Scenario: Event area not in the catalogue

- **GIVEN** a place existed only for a past event
- **WHEN** the catalogue is read
- **THEN** that place is not in the catalogue

### Requirement: Each area names its weathers

Each area SHALL name the weathers it can have, its own first, and the area holding the camera SHALL set the world's weather.

#### Scenario: Visiting an area

- **GIVEN** the camera enters an area
- **WHEN** the area is entered
- **THEN** the area's first weather starts again

### Requirement: Landmarks appear with their region's data

A region's landmarks SHALL appear when its data arrives and SHALL be removed when the region is released.

#### Scenario: Landmarks appear on arrival

- **GIVEN** a region's data has arrived
- **WHEN** the region is in reach
- **THEN** each of its landmarks appears

#### Scenario: Landmarks removed on release

- **GIVEN** a region's landmarks are shown
- **WHEN** the region is released
- **THEN** its landmarks are removed
