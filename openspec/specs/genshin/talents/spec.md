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
