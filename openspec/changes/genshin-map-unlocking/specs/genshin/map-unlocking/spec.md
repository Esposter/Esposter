## ADDED Requirements

### Requirement: Reaching a waypoint or domain entrance unlocks it

A Teleport Waypoint or a domain entrance SHALL unlock when the player interacts with it, or when the quest step that names it is taken.

#### Scenario: Interacting with a locked waypoint unlocks it

- **GIVEN** a Teleport Waypoint is locked and the player stands at it
- **WHEN** the player interacts with the waypoint
- **THEN** the waypoint is unlocked

#### Scenario: Interacting with a locked domain entrance unlocks it

- **GIVEN** a domain entrance is locked and the player stands at it
- **WHEN** the player interacts with the domain entrance
- **THEN** the domain entrance is unlocked

#### Scenario: A waypoint unlocked by a quest step opens with that step

- **GIVEN** a waypoint is named by a quest step and the step is not yet taken
- **WHEN** the player takes the quest step
- **THEN** the waypoint is unlocked

### Requirement: The first unlock of a waypoint pays its reward once

The first unlock of a waypoint SHALL pay its Adventure EXP and Primogems once, and no later unlock SHALL pay them again.

#### Scenario: The first unlock pays the waypoint's reward

- **GIVEN** a waypoint has never been unlocked
- **WHEN** the player unlocks it
- **THEN** the player receives the waypoint's Adventure EXP and Primogems

#### Scenario: A later unlock pays nothing again

- **GIVEN** a waypoint has already been unlocked once
- **WHEN** the waypoint is reached again
- **THEN** no Adventure EXP or Primogems are paid

### Requirement: A hidden waypoint stays hidden until its step

A waypoint the game hides SHALL stay hidden until the further step that reveals it is taken.

#### Scenario: A hidden waypoint is not offered before its step

- **GIVEN** a waypoint is hidden until a further step is taken
- **WHEN** the step has not been taken
- **THEN** the waypoint is not offered in the map or the prompt list

### Requirement: The HUD points to a near locked jump landmark

The HUD SHALL point toward a locked jump landmark within 30 metres of the player, and SHALL stop pointing once the player is past 40 metres from it or it is unlocked.

#### Scenario: A locked waypoint 29 metres away is pointed to

- **GIVEN** a locked jump landmark lies 29 metres from the player
- **WHEN** the player's position is updated
- **THEN** the HUD points toward that landmark

#### Scenario: A locked waypoint 31 metres away is not pointed to

- **GIVEN** a locked jump landmark lies 31 metres from the player and none is pointed to
- **WHEN** the player's position is updated
- **THEN** the HUD points to no landmark

#### Scenario: The pointer holds until the player passes 40 metres

- **GIVEN** the HUD is pointing toward a locked landmark 39 metres away
- **WHEN** the player's position is updated
- **THEN** the HUD keeps pointing toward that landmark

#### Scenario: The pointer goes past 40 metres

- **GIVEN** the HUD is pointing toward a locked landmark
- **WHEN** the player moves to 41 metres from it
- **THEN** the HUD stops pointing toward it

#### Scenario: An unlocked waypoint is never pointed to

- **GIVEN** a waypoint within 30 metres of the player is unlocked
- **WHEN** the player's position is updated
- **THEN** the HUD points to no landmark

### Requirement: The pointer marks a landmark out of view at the screen's edge

The pointer SHALL mark the pointed landmark at its place on screen, and while that landmark is out of view SHALL hold the mark at the screen's edge with its arrow turned toward the landmark.

#### Scenario: A pointed landmark out of view sits at the screen's edge

- **GIVEN** the HUD points toward a locked landmark that is out of view
- **WHEN** the map camera moves
- **THEN** the mark is held at the screen's edge
- **AND** its arrow is turned toward the landmark

### Requirement: An unlocked waypoint is offered as a jump and a respawn

An unlocked Teleport Waypoint SHALL be offered as a jump and as a place to revive, and a locked one SHALL NOT.

#### Scenario: An unlocked waypoint is offered as a jump

- **GIVEN** a waypoint is unlocked
- **WHEN** the player opens the map's jump list
- **THEN** the waypoint is offered as a jump

#### Scenario: A locked waypoint is not offered as a place to revive

- **GIVEN** a waypoint is locked
- **WHEN** the player is defeated
- **THEN** the locked waypoint is not offered as a place to revive
