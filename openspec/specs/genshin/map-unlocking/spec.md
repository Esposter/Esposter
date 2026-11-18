## Purpose

The map filled in as the game fills it. A Statue of The Seven is resonated with on F, which fills its area in on the map and the minimap and unlocks it as a jump. Only unlocked statues and waypoints are offered by the jump list and the map (`packages/genshin-world/src/services/map/computeUnlockedJumpLandmarks.ts`), a revive goes to the unlocked Teleport Waypoint nearest the body (`packages/genshin-world/src/services/map/findNearestTeleportWaypoint.ts`), and no statue is unlocked for a new player. A statue's first unlock pays its Primogems and Adventure EXP (`{data-root}/cache/genshin-wiki/Page_Statue_of_The_Seven.json` wikitext line 125: 50 Adventure EXP and 5 Primogem). A Teleport Waypoint unlocks the same way and pays its transport point's reward on its first unlock, and a domain entrance unlocks the same way as a landmark of the world (`packages/genshin-world/src/store/map.ts`, `packages/genshin-world/src/services/map/computeUnlockedJumpLandmarks.ts`).

## Requirements

### Requirement: Resonating unlocks a statue

A locked Statue of The Seven in reach SHALL be offered as a prompt row, and F on the selected row SHALL unlock it at once.

#### Scenario: Unlock a statue in reach

- **WHEN** the player is in reach of a locked statue and presses F on its row
- **THEN** the statue is unlocked immediately
- **AND** its row is no longer offered

#### Scenario: Unlocked statue offers no row

- **WHEN** the player is in reach of a statue already unlocked
- **THEN** no resonate row is offered for it

### Requirement: Nothing unlocked for a new player

A new player's world SHALL start with no statue unlocked, so the map is blank and no jump is offered.

#### Scenario: New player opens the map

- **WHEN** a new player opens the map
- **THEN** the map is blank and no jump is offered

### Requirement: Unlocks last with the player's progress

Unlocked statues SHALL last across a reload, kept with the player's progress as the bag and the wallet are.

#### Scenario: Reload keeps unlocks

- **GIVEN** the player has unlocked a statue
- **WHEN** the page reloads
- **THEN** the statue is still unlocked

### Requirement: Area fills while a landmark in it is unlocked

An area SHALL be filled on the map and the minimap while an unlocked landmark stands in it, and its name SHALL show only while it is filled.

#### Scenario: Statue unlocked fills its area

- **WHEN** a statue is unlocked
- **THEN** its area's outline and name appear on the map and the minimap

### Requirement: Only unlocked places are jumps

The jump list, the map's marks and a revive SHALL use only unlocked landmarks, and a fallen party SHALL be taken to the unlocked Teleport Waypoint nearest its body, a statue taking no revive.

#### Scenario: Party falls with an unlocked landmark

- **WHEN** the party falls and an unlocked Teleport Waypoint exists
- **THEN** it is taken to the unlocked Teleport Waypoint nearest its body

#### Scenario: Party falls with none unlocked

- **WHEN** the party falls and no Teleport Waypoint is unlocked
- **THEN** it is left where it fell

### Requirement: First unlock pays Primogems

Windrise's statue SHALL pay five Primogems and fifty Adventure EXP on its first unlock and no more after.

#### Scenario: First unlock of Windrise's statue

- **WHEN** Windrise's statue is unlocked for the first time
- **THEN** five Primogems are added to the wallet and fifty Adventure EXP to the adventure rank

### Requirement: Reaching a waypoint or domain entrance unlocks it

A Teleport Waypoint or a domain entrance SHALL unlock when the player interacts with it. A quest step that names a waypoint by its transport point SHALL finish when the waypoint is unlocked.

#### Scenario: Interacting with a locked waypoint unlocks it

- **GIVEN** a Teleport Waypoint is locked and the player stands at it
- **WHEN** the player interacts with the waypoint
- **THEN** the waypoint is unlocked

#### Scenario: Interacting with a locked domain entrance unlocks it

- **GIVEN** a domain entrance is locked and the player stands at it
- **WHEN** the player interacts with the domain entrance
- **THEN** the domain entrance is unlocked

#### Scenario: A quest step that names a waypoint finishes when it is unlocked

- **GIVEN** a quest step names a waypoint by its transport point and the step is not yet finished
- **WHEN** the player interacts with the waypoint
- **THEN** the step is finished

### Requirement: A waypoint's first unlock pays its point's reward once

A Teleport Waypoint's first unlock SHALL pay the Primogems and Adventure EXP its transport point's reward row holds, and no later unlock SHALL pay them again.

#### Scenario: The first unlock pays the waypoint's reward

- **GIVEN** a Teleport Waypoint whose transport point has a reward row has never been unlocked
- **WHEN** the player unlocks it
- **THEN** the row's Primogems are added to the wallet and its Adventure EXP to the adventure rank

#### Scenario: Waypoint whose point has no reward row pays nothing

- **WHEN** a Teleport Waypoint whose transport point has no reward row is unlocked for the first time
- **THEN** nothing is added to the wallet or the adventure rank

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

## Open

- [ ] **A domain entrance unlocks the same way as a landmark of the world** — no source yet: no line of the wiki's Domain page (`{data-root}/cache/genshin-wiki/Page_Domain.json`) names resonating, and its Permanent Domains section (wikitext line 20) says only that they are landmarks that can be waypoints once unlocked; the owner decides.
