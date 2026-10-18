## ADDED Requirements

### Requirement: A weapon shows its passive at each refinement rank

A weapon with a passive SHALL show the passive's name and its description at each refinement rank, with the ranks in refinement order, and a weapon with no passive SHALL show none.

#### Scenario: A weapon with a passive shows its description at its rank

- **GIVEN** a weapon with a passive, held at refinement rank three
- **WHEN** the player views the weapon
- **THEN** the passive's name is shown
- **AND** its description at rank three is shown with the game's own numbers

#### Scenario: Passive ranks are shown in refinement order

- **GIVEN** a weapon with a passive at five refinement ranks
- **WHEN** the player views the passive's ranks
- **THEN** the ranks are listed from rank one to rank five

#### Scenario: A weapon with no passive shows none

- **GIVEN** a weapon with no passive
- **WHEN** the player views the weapon
- **THEN** no passive is shown

### Requirement: A weapon's passive acts at the refinement rank the weapon holds

A weapon's passive SHALL act at the refinement rank the weapon holds, and raising the refinement SHALL change the effect the passive has on its wielder.

#### Scenario: A weapon at refinement rank one reads its first passive row

- **GIVEN** a weapon at refinement rank one with a passive
- **WHEN** its wielder is in combat
- **THEN** the passive acts with the numbers of its first rank

#### Scenario: Raising refinement changes the passive's effect

- **GIVEN** a weapon with a passive at refinement rank one
- **WHEN** the weapon is raised to refinement rank two
- **THEN** the passive acts with the numbers of its second rank
