## Purpose

The official Teyvat Interactive Map's chests, fitted into each region's slice of the game data by their kind: the five tiers from Common to Remarkable, and the buried and sealed places that carry no tier. Only ground chests are placed. Opening a Common, Exquisite or Precious chest pays its Primogems and Mora once and pours its drops out where it stands; locks, digging, seals and the other tiers wait on the proposal's later steps.

## Requirements

### Requirement: The map's chests

The map's chests SHALL be placed on the ground only, and every other chest point SHALL be left out of the world.

#### Scenario: A chest point under the ground layer is left out

- **GIVEN** a chest point lies on a layer under the ground
- **WHEN** the chests are placed
- **THEN** that point is not placed as a chest

#### Scenario: A chest point in an area no region holds is left out

- **GIVEN** a chest point lies in an area no region is mapped to
- **WHEN** the chests are placed
- **THEN** that point is left out and counted

#### Scenario: A Mora chest on the map is not placed as one of the seven kinds

- **GIVEN** the official map marks a Mora chest
- **WHEN** the chests are placed
- **THEN** no chest of the seven kinds is placed for it

### Requirement: Opening a Common, Exquisite or Precious chest

Opening a Common, Exquisite or Precious chest SHALL pay its Primogems and Mora once, and a second opening SHALL pay nothing.

#### Scenario: Opening a Common chest pays its rolled rewards and pours out its drops

- **GIVEN** a player stands in reach of an unopened Common chest
- **WHEN** the player presses F on the chest
- **THEN** the wallet gains Primogems and Mora rolled within the tier's ranges
- **AND** the chest's drops are poured out where it stands

#### Scenario: Opening an already opened chest pays nothing

- **GIVEN** a chest has already been opened
- **WHEN** the player opens it again
- **THEN** the wallet gains nothing

### Requirement: A chest of a kind with no reward entry

A chest of a kind with no reward entry SHALL stay unopened.

#### Scenario: A Luxurious chest does not open

- **GIVEN** a player stands in reach of a Luxurious chest
- **WHEN** the player presses F on the chest
- **THEN** the chest does not open and nothing is paid

#### Scenario: A buried place offers no opening

- **GIVEN** a player stands at a buried place
- **WHEN** the player looks for something to open
- **THEN** no opening is offered there

### Requirement: Opened chests

Opened chests SHALL be kept on the player's save, including across an account merge.

#### Scenario: A merge keeps the chests opened on either copy

- **GIVEN** an account has chests opened on its save
- **WHEN** the account's copy is merged
- **THEN** the opened chests are kept on the merged save
