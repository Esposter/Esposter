## Purpose

What a screen loads before it shows, measured and held to a budget. Each awaited load step is a browser performance measure, and the load meter prints the time to ready, the requests and game data fetched, and the renderer's and scene's counts against the screen's budget.

## Requirements

### Requirement: Measured load steps

Each awaited load step SHALL be measured in the browser from its call to its settling under its own name, and a rejected step SHALL still be measured and pass its rejection through unchanged.

#### Scenario: Step settles

- **WHEN** an awaited load step settles
- **THEN** its measure runs from its call to that settling

#### Scenario: Step rejects

- **WHEN** an awaited load step rejects
- **THEN** it is measured as failed
- **AND** the rejection reaches the caller unchanged

### Requirement: Time to ready

The time to ready SHALL be the milliseconds from navigation start to the screen signalling ready, read after the network idle window.

#### Scenario: Reading taken after idle

- **WHEN** the screen signals ready
- **THEN** the reading is taken after the network idle window

### Requirement: Request and game data counts

The load SHALL count every request the page made with its transferred bytes, and SHALL count as game data the requests under the game data's base.

#### Scenario: Requests after ready count

- **WHEN** the page fetches more after signalling ready
- **THEN** those requests are included in the counts

### Requirement: Renderer and object counts

The load SHALL report the renderer's geometries, textures and programs and the visible objects by kind, each read once at ready, and a screen with no scene at ready SHALL read zero.

#### Scenario: Screen without a scene

- **WHEN** a screen has no scene at ready
- **THEN** its counts are zero

### Requirement: Production build by default

The load SHALL be measured on a production build of the page served by a preview server, and only the dev flag SHALL measure the dev server instead.

#### Scenario: Default run

- **WHEN** the load is measured without a flag
- **THEN** the production build is served and measured

#### Scenario: Dev flag

- **WHEN** the load is measured with the dev flag
- **THEN** the dev server is measured instead of a build

### Requirement: Crossing measured after a move

A screen with a crossing SHALL load with its crossing's props and, when the crossing is requested, move once ready and report the requests, game data, tiles rebuilt and time to settle from the move.

#### Scenario: Crossing run

- **WHEN** the crossing is requested for a ready screen
- **THEN** the screen moves to its crossing props and the figures from the move are printed

#### Scenario: Crossing with paused loading

- **WHEN** the crossing is requested together with paused loading
- **THEN** the run is refused

### Requirement: Meter against budgets

The meter SHALL print each figure against its budget and SHALL exit non-zero when a figure checked there is over its budget.

#### Scenario: Figure within its budget

- **WHEN** every checked figure is within its budget
- **THEN** the meter exits without failing

#### Scenario: Figure over its budget

- **WHEN** a checked figure is over its budget
- **THEN** the meter marks it OVER and exits non-zero

#### Scenario: Time on another machine

- **WHEN** the run is on a machine other than the one the budget names
- **THEN** its time is printed and does not fail the run

### Requirement: Budgets only tighten

A change that lowers a measured load SHALL lower its budget in the same change, and a budget SHALL be raised only with its own reason.

#### Scenario: Trim lowers its budget

- **WHEN** a trim lowers a measured load
- **THEN** its budget is lowered in the same change

### Requirement: World ready waits on the finest terrain

The world SHALL signal ready only once every region in reach has arrived or failed and every finest terrain tile the view wants is held or given up.

#### Scenario: Ready after the tiles settle

- **WHEN** the finest terrain tiles the view wants are held and the regions in reach have arrived or failed
- **THEN** the world signals ready

#### Scenario: Coarser rings keep streaming

- **WHEN** the coarser terrain rings are still streaming
- **THEN** ready does not wait on them
