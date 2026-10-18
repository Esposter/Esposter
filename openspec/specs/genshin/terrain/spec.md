## Purpose

Genshin's ground as one heightfield drawn on a CDLOD quadtree, by true distance from the eye, with every vertex morphing onto the coarser grid before its tile changes level. Tiles are generated in a small pool of workers, handed back without a copy, cached all round the eye whichever way it looks, and asked for coarsest first, a loaded ancestor drawn while a tile is still coming. The origin floats, so the world can stretch a continent without trembling.

## Requirements

### Requirement: Detail follows distance from the eye

The ground SHALL be drawn at the detail its true distance from the eye calls for, finest nearest the eye and coarser the farther it lies.

#### Scenario: Near ground drawn finest

- **GIVEN** ground lies close beneath the eye
- **WHEN** the scene is drawn
- **THEN** that ground is drawn at the finest detail

#### Scenario: Far ground drawn coarser

- **GIVEN** ground lies far from the eye
- **WHEN** the scene is drawn
- **THEN** that ground is drawn at a coarser detail

### Requirement: Ground generated all round the eye

The ground SHALL be generated and held all round the eye, so that a turn of the camera shows no bare sky where ground should be.

#### Scenario: Turning the camera

- **GIVEN** the camera is looking at one side of the world
- **WHEN** the camera turns to look the other way
- **THEN** the ground behind it is already there
- **AND** no bare sky shows through

### Requirement: Vertices morph before a change of detail

Each vertex SHALL morph onto the coarser grid across the far end of its level's range, so that a tile changing its level shows no step.

#### Scenario: Change of detail shows no step

- **GIVEN** a tile is reaching the far end of its level's range
- **WHEN** it changes to the coarser level
- **THEN** its shape is already the coarser tile's
- **AND** no step is visible at the change

### Requirement: Tiles generated without stopping the frame

The ground's tiles SHALL be generated without stopping the frames the player sees.

#### Scenario: Frames keep drawing while tiles build

- **GIVEN** new tiles are being generated
- **WHEN** frames are drawn
- **THEN** the frames keep drawing at the rate the scene allows
- **AND** the generation does not hold up the draw

### Requirement: Nearest held ancestor covers a tile still coming

While a tile is still coming, the nearest tile already held SHALL be drawn in its place, so that the ground is always covered once.

#### Scenario: Ancestor drawn in place of a missing tile

- **GIVEN** a tile the view needs has not arrived
- **WHEN** the scene is drawn
- **THEN** the nearest tile already held covers its place
- **AND** no part of the ground is drawn twice

### Requirement: Tiles asked for coarsest first and freed by least recent need

Tiles the view needs SHALL be requested coarsest first, and when the cache is full the tile needed longest ago SHALL be freed, never one in view.

#### Scenario: Coarsest tiles requested first

- **GIVEN** several tiles the view needs are missing
- **WHEN** they are requested
- **THEN** the coarsest missing tiles are requested first

#### Scenario: Tile in view never freed

- **GIVEN** the cache is full
- **AND** a tile is in view this frame
- **WHEN** a tile is freed
- **THEN** the tile in view is kept

### Requirement: A failed tile is retried, then given up

A tile that cannot be built SHALL be requested again, and SHALL be given up after three failures, while the ground still counts as settled.

#### Scenario: Failed tile requested again

- **GIVEN** a tile failed to build once
- **WHEN** the view still needs it on a later frame
- **THEN** it is requested again

#### Scenario: Tile given up after three failures

- **GIVEN** a tile has failed to build three times
- **WHEN** the ground is checked for settling
- **THEN** the tile counts as settled
- **AND** it is drawn by its nearest held ancestor
- **AND** its failure is logged once

### Requirement: World shown ready only once the near ground has settled

The world SHALL not be shown ready until every finest tile the view needs has either been built or given up, while coarser rings may keep streaming after it is ready.

#### Scenario: Ready only after the finest tiles settle

- **GIVEN** a finest tile the view needs is still being built
- **WHEN** readiness is checked
- **THEN** the world is not shown ready

#### Scenario: Coarser rings stream after ready

- **GIVEN** the world is ready
- **AND** a coarser tile in view is still being built
- **WHEN** the next frame is drawn
- **THEN** the world stays shown
- **AND** the coarser tile arrives while the nearest ancestor covers it

### Requirement: Late ground replaces the tiles it changes

A region's ground arriving after its tiles were built SHALL replace every tile whose heights it changes, and each replaced tile SHALL stay drawn until its replacement arrives.

#### Scenario: Late ground changes a drawn tile

- **GIVEN** a tile has been drawn from the ground before a region's ground arrived
- **WHEN** the region's ground arrives and changes that tile's heights
- **THEN** the tile is built again
- **AND** the old tile stays drawn until the new one arrives

### Requirement: Origin floats to keep the world steady far out

Once the camera has gone one kilometre from the origin, the world SHALL move back under the camera without the view jumping.

#### Scenario: Camera past one kilometre

- **GIVEN** the camera has gone one kilometre from the origin
- **WHEN** the origin is shifted
- **THEN** the world moves back under the camera
- **AND** the view shows the same scene with no jump
