## Purpose

How the Genshin engine is divided so every system is built, tested and replaced on its own — a published package of plain TypeScript and TSL modules, each with one job, under a world package that holds every place by name and the TresJS components that mount it. State flows one way, generators are pure and seeded, and every module is judged by what it costs a mid-range laptop.

## Requirements

### Requirement: The engine is a published package the world mounts

The engine SHALL be published as its own package of plain modules, which the world package mounts and which no app reaches past a module's interface.

#### Scenario: An app hands the world only what the bundler and server decide

- **GIVEN** an app mounting the world
- **WHEN** the world is mounted
- **THEN** the app hands it only the terrain worker, the address region data is served from, and whether the tuning panel shows

### Requirement: The engine names no place and the world holds every place by name

The engine SHALL name no place, and the world package SHALL hold every place by name and the components that mount them.

#### Scenario: An engine module receives its region data as an argument

- **GIVEN** an engine module that needs a region's data
- **WHEN** it runs
- **THEN** the region's data is passed to it as an argument
- **AND** the module names no place

### Requirement: Each engine module has one job and meets its siblings only through their interfaces

Each engine module SHALL do one job and SHALL reach a sibling only through the sibling's typed interface, never its internals.

#### Scenario: A module reads a sibling's state through its read-only interface

- **GIVEN** a module that needs a sibling's state
- **WHEN** it reads that state
- **THEN** it reads the sibling's read-only state or its commands

#### Scenario: A dependency pointing back up the frame's order is a design error

- **GIVEN** a module that depends on one that runs later in the frame's order
- **WHEN** the dependency is reviewed
- **THEN** it is treated as a design error

### Requirement: State flows one way within a frame

Within a frame the light and the wind SHALL be written before the scene draws, and a tile not yet in the cache SHALL NOT be drawn.

#### Scenario: The light is written before the scene draws

- **GIVEN** a frame
- **WHEN** the scene draws
- **THEN** the light and the wind were written earlier in the same frame

#### Scenario: A tile still being fetched stands in with its nearest cached ancestor

- **GIVEN** a tile wanted but not yet in the cache
- **WHEN** the frame draws
- **THEN** its nearest cached ancestor is drawn in its place

### Requirement: Every generator is pure and seeded

Every generator SHALL be a pure function of region data, a tile key and a seed, returning the same output for the same input wherever it runs.

#### Scenario: A generator gives the same output in a worker and in a test

- **GIVEN** the same region data, tile key and seed
- **WHEN** a generator runs in a worker and again in a test
- **THEN** the two outputs are identical

### Requirement: Every generator and per-frame selection is benched at two scales or more

Every generator and per-frame selection SHALL be benched at two scales or more, and a module whose cost grows with the continent SHALL be redesigned rather than tuned.

#### Scenario: A bench shows its cost follows what is visible

- **GIVEN** a generator benched at two scales
- **WHEN** the bench is read
- **THEN** its cost follows the amount visible

#### Scenario: A module whose cost grows with the continent is redesigned

- **GIVEN** a module whose bench grows with the continent
- **WHEN** the bench is read
- **THEN** the module is redesigned rather than tuned

### Requirement: A frame allocates nothing and draws in tens of calls

A frame SHALL allocate nothing for its objects, and SHALL draw in tens of calls rather than thousands, through instancing and batching.

#### Scenario: A steady frame allocates nothing for its objects

- **GIVEN** a steady frame
- **WHEN** it runs
- **THEN** no memory is allocated for its objects

#### Scenario: A region of many parts is drawn in tens of calls

- **GIVEN** a region of thousands of parts
- **WHEN** it is drawn
- **THEN** its parts are drawn through instancing and batching in tens of calls

### Requirement: A quality tier lowers cost without removing the style

A quality tier SHALL lower cost before the frame budget is missed, and SHALL NOT remove the style.

#### Scenario: A device missing the frame budget gets a lower tier

- **GIVEN** a device missing the frame budget
- **WHEN** the quality tier lowers
- **THEN** the cost of the frame drops
- **AND** the world keeps its style

### Requirement: The engine's code and each region's data load only when needed

The engine's code and each region's data SHALL load only when the world needs them.

#### Scenario: A region not yet shown is not loaded

- **GIVEN** a region the world is not yet showing
- **WHEN** the page loads
- **THEN** that region's data is not loaded

### Requirement: Systems react to each other only through one typed event map

Each system of the world SHALL react to another's doing only through the one typed event map that the screen creates.

#### Scenario: A pickup reaches the quests through a typed event

- **GIVEN** a pickup completed in the world
- **WHEN** the quest system is to react
- **THEN** it reacts through a typed event on the event map

### Requirement: A module is added by the proposal that first needs it

A module SHALL be added only by the proposal that first needs it, never as an empty folder ahead of that need.

#### Scenario: A proposal that first needs a module adds it

- **GIVEN** a proposal that first needs a module
- **WHEN** it lands
- **THEN** the module is added with it
