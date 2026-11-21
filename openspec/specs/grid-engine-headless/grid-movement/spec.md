# grid-engine-headless/grid-movement Specification

## Purpose

The grid's collision, the steps and turns of characters on it, the events a run raises and the teleport, as the headless package `grid-engine-headless` states them with no rendering and no Phaser.

## Requirements

### Requirement: A position a character cannot enter is blocked

The engine SHALL report a position blocked when its tile is blocking, when no tile covers it, when it lies outside the grid, or when another character occupies it.

#### Scenario: A blocking tile blocks

- **GIVEN** a grid whose tile at a position is blocking
- **WHEN** the position is checked
- **THEN** the position is blocked

#### Scenario: A position with no tile blocks

- **GIVEN** a position no layer covers with a tile
- **WHEN** the position is checked
- **THEN** the position is blocked

#### Scenario: A position outside the grid blocks

- **GIVEN** a position beyond the grid's edge
- **WHEN** the position is checked
- **THEN** the position is blocked

#### Scenario: isBlocked is true on a tile another character occupies

- **GIVEN** a character standing on an open tile
- **WHEN** the tile is checked
- **THEN** the tile is blocked

### Requirement: A moving character blocks the tile it has left

The engine SHALL keep a moving character blocking the tile it has left until its step is committed, and SHALL make characters block each other.

#### Scenario: A moving character blocks the tile it has left until it has left

- **GIVEN** a character partway through a step
- **WHEN** the tile it left is checked
- **THEN** the tile is blocked
- **AND** once the step is committed the tile is open

#### Scenario: Characters block each other

- **GIVEN** two characters on adjacent open tiles
- **WHEN** the first tries to move onto the second's tile
- **THEN** the first stays on its tile

#### Scenario: A character added without a sprite is placed and blocks

- **GIVEN** a character added at an open tile with no drawing attached
- **WHEN** the tile is checked
- **THEN** the tile is blocked

### Requirement: A run covers the same tiles in the same time at any split of updates

The engine SHALL cover the same tiles in the same elapsed time whatever split of updates carries that time, so a step's time does not depend on the frame rate.

#### Scenario: A run covers the same tiles in one second at any split of updates, dividing a step or not

- **GIVEN** a character running a sequence of steps
- **WHEN** one second of time is passed as updates of different lengths, some dividing a step and some not
- **THEN** every split covers the same tiles

#### Scenario: A run asked before each update covers the same tiles at 20 ms updates as at 4 ms updates

- **GIVEN** a character whose move is asked before each update
- **WHEN** the same time is passed as 20 ms updates and as 4 ms updates
- **THEN** both cover the same tiles in the same time

### Requirement: A distance past a step's end carries into the next step

The engine SHALL carry the distance an update passes a step's end into the next step in the same direction, and SHALL drop it when no move waits, when the move is in another direction, when the next tile is blocked, or when the character is teleported.

#### Scenario: A stop at a tile with a large delta lands exactly on it

- **GIVEN** a character whose step is passed by one update with a large delta
- **WHEN** the update ends
- **THEN** the character stands on the tile the step reached

#### Scenario: A move in another direction does not take the distance a step past its end left

- **GIVEN** a step that an update carries past its end
- **WHEN** the next move is in another direction
- **THEN** the step in that direction takes a full step to reach its tile, and the carried distance is not spent on it

#### Scenario: A teleport drops the distance an update left past a step

- **GIVEN** a step that an update carries past its end
- **WHEN** the character is teleported before the next update
- **THEN** the carried distance is dropped

### Requirement: A character moves at four tiles a second by default

The engine SHALL move a character added without a speed at four tiles per second, so one tile takes a quarter of a second.

#### Scenario: The default speed is four tiles per second

- **GIVEN** a character added without a speed and a move asked
- **WHEN** a quarter of a second less one millisecond passes in updates
- **THEN** the tile it is entering is still blocked
- **AND** one more millisecond completes the step

### Requirement: A move waits for the step under way and a blocked move turns

The engine SHALL ignore a move asked while the character is moving, and SHALL turn a character that moves into a blocked tile without moving it, emitting its direction change once.

#### Scenario: A move while moving is ignored

- **GIVEN** a character partway through a step
- **WHEN** a move is asked in another direction
- **THEN** the step finishes on its own tile and the other direction is not taken

#### Scenario: A move into a blocked tile turns once and emits directionChanged once

- **GIVEN** a character facing down with a blocked tile to its right
- **WHEN** a move to the right is asked twice
- **THEN** the character turns right without moving
- **AND** directionChanged is emitted once

### Requirement: A turn emits a direction change only when the facing changes

The engine SHALL emit directionChanged only when a turn changes the character's facing, and SHALL leave a step's facing unchanged by a turn during that step.

#### Scenario: A turn emits only on a change of facing

- **GIVEN** a character already facing a direction
- **WHEN** it is turned to face that direction again
- **THEN** no directionChanged is emitted

#### Scenario: A turn during a step is ignored and the facing stays the step's direction

- **GIVEN** a character partway through a step
- **WHEN** it is turned to another direction
- **THEN** its facing stays the step's direction until the step is committed

### Requirement: A diagonal move fails

The engine SHALL refuse a move in a diagonal direction with a diagonal-move error, and SHALL move no character.

#### Scenario: A diagonal move fails

- **GIVEN** a character on an open tile
- **WHEN** a move in a diagonal direction is asked
- **THEN** the call returns a diagonal-move error naming the character

### Requirement: Events name the character and the run

The engine SHALL emit movementStarted once for a run of steps, not once per tile, and movementStopped with the tile the character stopped on, and SHALL name the character by id in every payload.

#### Scenario: movementStarted brackets a run of steps, not each tile

- **GIVEN** a character whose run spans several tiles
- **WHEN** the run is under way
- **THEN** movementStarted is emitted once for the run

#### Scenario: movementStopped names the tile the character stopped on

- **GIVEN** a character that stops after a step
- **WHEN** the run ends
- **THEN** movementStopped names the tile it stopped on

### Requirement: Listeners stay subscribed until they unsubscribe and act from the next update

The engine SHALL keep a listener subscribed until it unsubscribes, SHALL start a move a listener makes on a position event on the next update, and SHALL stop a character a listener stops on the tile it stopped on.

#### Scenario: A listener stays subscribed until it unsubscribes

- **GIVEN** a subscribed listener
- **WHEN** events are raised
- **THEN** the listener hears each event until it unsubscribes

#### Scenario: A move from a position listener starts on the next update

- **GIVEN** a position listener that asks a move
- **WHEN** a step is committed
- **THEN** the move starts on the next update

#### Scenario: A stop from a position listener stops on that tile

- **GIVEN** a position listener that stops the character
- **WHEN** a step is committed
- **THEN** the character stops on the tile the step reached

#### Scenario: A raise reaches the listeners subscribed when it began

- **GIVEN** a listener that subscribes itself again while an event is raised
- **WHEN** the event is raised
- **THEN** the listener is heard once for that raise

#### Scenario: A function subscribed twice is heard once per subscription

- **GIVEN** one function subscribed twice to an event
- **WHEN** the event is raised and one subscription is removed
- **THEN** the function is heard once per raise until its last subscription is removed

### Requirement: A teleport places a character at once and stops its run

The engine SHALL place a teleported character at once, stop any step and any waiting move, release the tile it left and emit the position events, and SHALL return an error for an unknown character or a position off the grid.

#### Scenario: A teleport mid-step places the character at once and stops its step

- **GIVEN** a character partway through a step
- **WHEN** it is teleported to another tile
- **THEN** it stands on that tile at once
- **AND** its step does not commit the tile it was walking to

#### Scenario: A teleport releases the tile a moving character left

- **GIVEN** a character that has left a tile during a move
- **WHEN** it is teleported to a third tile
- **THEN** the tile it left is open

#### Scenario: setPosition for an unknown character returns an error

- **GIVEN** no character with the given id
- **WHEN** its position is set
- **THEN** the call returns an unknown-character error

#### Scenario: A start or a teleport off the grid is refused as outside the grid

- **GIVEN** a position beyond the grid's edge
- **WHEN** a character is started or teleported there
- **THEN** the call returns an outside-grid error

### Requirement: A reader sees the step a character is in

The engine SHALL report, for a character, the tile its step left, its facing and its progress through the step, with progress zero when no step is under way, so a reader draws it between the two tiles.

#### Scenario: readCharacter reports the tile a step left, its facing and its progress until the step is committed

- **GIVEN** a character partway through a step
- **WHEN** the character is read
- **THEN** the position is the tile the step left, the facing is the step's direction, and the progress is part of the step
- **AND** after the step is committed the progress is zero

### Requirement: A failed call returns an error value

The engine SHALL return a result for each call that can fail, naming the kind of failure and the character or position it was about: an unknown character, a position off the grid, a diagonal move, an invalid grid or an invalid speed.

#### Scenario: A grid whose rows differ in length, or that has no row, is an invalid grid

- **GIVEN** a tile grid whose rows differ in length or that has no row
- **WHEN** the engine is created
- **THEN** the call returns an invalid-grid error

#### Scenario: A speed that is not a positive number is an invalid speed

- **GIVEN** a character config with a speed that is not a positive number
- **WHEN** the character is added
- **THEN** the call returns an invalid-speed error

### Requirement: An engine holds only its own characters

The engine SHALL hold only the characters and listeners it was created with, so an engine made after another has none of the other's characters.

#### Scenario: A new engine has no character of the previous one

- **GIVEN** an engine with a character on it
- **WHEN** a new engine is created on the same tiles
- **THEN** the new engine has no character with that id

### Requirement: A character keeps its own copy of the tile it is given

The engine SHALL keep its own copy of a position passed to add or teleport a character, so a later change to the caller's object moves nothing.

#### Scenario: A character added at a tile keeps its own copy of it

- **GIVEN** a position passed as a character's start
- **WHEN** the caller changes that object afterwards
- **THEN** the character stays on the tile it was added at

#### Scenario: A teleport keeps its own copy of the tile it was sent to

- **GIVEN** a position passed to a teleport
- **WHEN** the caller changes that object afterwards
- **THEN** the character stays on the tile it was sent to

### Requirement: Importing the package loads no Phaser

The package SHALL load no Phaser module when imported in a Node environment, so a server or a test can import it without a window.

#### Scenario: Importing the core loads no Phaser module in a Node environment

- **GIVEN** a Node environment with no window
- **WHEN** the package's entry is imported
- **THEN** the import completes and loads no Phaser module
