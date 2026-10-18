## ADDED Requirements

### Requirement: The Talents tab shows each talent's level, next phase and cost

The Talents tab SHALL show each combat talent's level, the phase its next level needs and the cost of that level.

#### Scenario: A talent row shows its next level's phase and cost

- **GIVEN** a character with a combat talent below level ten
- **WHEN** the player opens the Talents tab
- **THEN** the talent's row shows its level, the phase its next level needs and its cost

### Requirement: Pressing a talent's Upgrade raises it by one

A combat talent SHALL rise by one level when its Upgrade is pressed and the player meets its requirements, with its Mora and materials taken.

#### Scenario: Pressing Upgrade raises a talent by one and takes its Mora and materials

- **GIVEN** a character whose phase, Mora and materials meet a talent's next level
- **WHEN** the player presses the talent's Upgrade
- **THEN** the talent rises by one level
- **AND** its Mora and materials are taken

#### Scenario: A talent that meets every requirement can be upgraded

- **GIVEN** a talent whose phase, Mora and materials are all met for its next level
- **WHEN** the player views its row
- **THEN** its Upgrade is enabled

### Requirement: A talent that cannot rise shows why and its Upgrade is disabled

A talent that cannot rise SHALL show the reason it cannot, and its Upgrade SHALL be disabled.

#### Scenario: A talent at its last level cannot be upgraded

- **GIVEN** a talent at level ten
- **WHEN** the player views its row
- **THEN** the row says the talent is at its last level
- **AND** its Upgrade is disabled

#### Scenario: A talent past the character's phase shows the phase it needs

- **GIVEN** a character whose phase is below the phase a talent's next level needs
- **WHEN** the player views the talent's row
- **THEN** the row shows the phase it needs
- **AND** its Upgrade is disabled

#### Scenario: A talent short of Mora shows the Mora it needs

- **GIVEN** a character with less Mora than a talent's next level costs
- **WHEN** the player views the talent's row
- **THEN** the row shows the Mora it needs
- **AND** its Upgrade is disabled

#### Scenario: A talent missing materials shows the materials it needs

- **GIVEN** a character without the materials a talent's next level costs
- **WHEN** the player views the talent's row
- **THEN** the row shows the materials it needs
- **AND** its Upgrade is disabled

### Requirement: A raised talent level is kept with the world

A talent's raised level SHALL be kept with the world, so that a reload shows it.

#### Scenario: A raised talent is kept after a reload

- **GIVEN** a talent the player has raised
- **WHEN** the world is reloaded
- **THEN** the talent shows its raised level

### Requirement: A talent plays at its own level plus its constellations' additions

A talent SHALL play at the level the character holds for it plus the levels its constellations add, so that a level past ten comes from a constellation alone.

#### Scenario: A constellation raises a talent above level ten

- **GIVEN** a character at ten in a talent with a constellation that adds levels to it
- **WHEN** the talent is played
- **THEN** it plays at the level above ten that the constellation adds
