## Purpose

The map filled in as the game fills it. A Statue of The Seven is resonated with on F, which fills its area in on the map and the minimap and unlocks it as a jump. Only unlocked statues are offered by the jump list, the map and a revive, and no statue is unlocked for a new player. A statue's first unlock pays its Primogems. A Teleport Waypoint unlocks the same way, paying nothing on its first unlock yet, and domain entrances are not yet in the world's data.

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

The jump list, the map's marks and a revive SHALL use only unlocked landmarks, and a fallen party SHALL be taken to the unlocked landmark nearest its body.

#### Scenario: Party falls with an unlocked landmark

- **WHEN** the party falls and an unlocked landmark exists
- **THEN** it is taken to the unlocked landmark nearest its body

#### Scenario: Party falls with none unlocked

- **WHEN** the party falls and no landmark is unlocked
- **THEN** it is left where it fell

### Requirement: First unlock pays Primogems

Windrise's statue SHALL pay five Primogems on its first unlock and no more after.

#### Scenario: First unlock of Windrise's statue

- **WHEN** Windrise's statue is unlocked for the first time
- **THEN** five Primogems are added to the wallet

### Requirement: Waypoints unlock as statues do

A Teleport Waypoint SHALL be unlocked by resonating with it on F, as a statue is, and its first unlock SHALL pay nothing.

#### Scenario: Waypoint unlocked on F

- **WHEN** the player resonates with a Teleport Waypoint on F
- **THEN** the waypoint is unlocked and offered as a jump

#### Scenario: Waypoint's first unlock pays nothing

- **WHEN** a Teleport Waypoint is unlocked for the first time
- **THEN** no Primogems are added to the wallet
