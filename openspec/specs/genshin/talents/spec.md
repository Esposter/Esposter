## Purpose

Each playable character's three combat talents levelled from 1 by the game's proud skill table, each level raised by the ascension phase it needs and paid in Mora and talent materials, and the passives each phase opens. The stats run writes the table, the upgrade is a pure rule over it, and the Talents tab waits on its page.

## Requirements

### Requirement: Every combat talent starts at level 1

A newly created character SHALL have each of its three combat talents at level 1.

#### Scenario: New character's talents

- **GIVEN** a character is created
- **WHEN** its talents are read
- **THEN** the normal attack, the Elemental Skill and the Elemental Burst are each at level 1

### Requirement: An upgrade raises one talent one level

An upgrade SHALL raise one combat talent by exactly one level only when the character's ascension phase, Mora and items all cover that level.

#### Scenario: Successful upgrade

- **GIVEN** a character at an ascension phase that reaches the next level
- **AND** the wallet holds the level's Mora and the bag holds its items
- **WHEN** the talent is upgraded
- **THEN** the talent is one level higher
- **AND** the level's Mora and items are taken

#### Scenario: Refused at the last level

- **GIVEN** a talent is at level 10
- **WHEN** it is upgraded
- **THEN** the upgrade is refused

#### Scenario: Refused below the phase it needs

- **GIVEN** a character whose ascension phase is below the phase the next level needs
- **WHEN** the talent is upgraded
- **THEN** the upgrade is refused

#### Scenario: Refused without enough Mora

- **GIVEN** the wallet holds less Mora than the next level costs
- **WHEN** the talent is upgraded
- **THEN** the upgrade is refused

#### Scenario: Refused without an item

- **GIVEN** the bag lacks one of the next level's items
- **WHEN** the talent is upgraded
- **THEN** the upgrade is refused

### Requirement: A refused upgrade leaves everything as it was

A refused upgrade SHALL leave the character, the wallet and the bag exactly as they were before it was attempted.

#### Scenario: Nothing taken on refusal

- **GIVEN** an upgrade is refused for lack of an item after the Mora was checked
- **WHEN** the refusal is returned
- **THEN** the character's talent level is unchanged
- **AND** no Mora or item has been taken

### Requirement: Talent levels need their ascension phases

Talent level two SHALL need the second ascension phase, levels three and four the third, and each further pair of levels the phase after, so that levels nine and ten need the sixth.

#### Scenario: First-phase character levelled to one only

- **GIVEN** a character at the first ascension phase
- **WHEN** its talents are upgraded as far as the phase allows
- **THEN** no talent rises above level 1

#### Scenario: Sixth-phase character reaches level ten

- **GIVEN** a character at the sixth ascension phase with enough Mora and items
- **WHEN** a talent is upgraded to level 10
- **THEN** the talent reaches level 10

### Requirement: Passives open at their ascension phase

A passive SHALL be open once the character's ascension phase reaches the phase it opens at, and a passive SHALL have no level.

#### Scenario: Utility passive open from the start

- **GIVEN** a character with a utility passive that opens at phase 0
- **WHEN** the character is created
- **THEN** the utility passive is open

#### Scenario: Ascension passive waits for its phase

- **GIVEN** a character at ascension phase 1 with a passive opening at phase 4
- **WHEN** the passive is checked
- **THEN** the passive is not open

### Requirement: Alternate sprint is never levelled

The alternate sprint SHALL never be levelled, and no upgrade SHALL be offered for it.

#### Scenario: Alternate sprint not upgraded

- **GIVEN** a character with an alternate sprint
- **WHEN** its talents are read
- **THEN** the alternate sprint has no level and no upgrade

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
