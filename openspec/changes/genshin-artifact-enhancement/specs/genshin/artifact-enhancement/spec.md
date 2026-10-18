## ADDED Requirements

### Requirement: Adventurer's Four-Piece Restoration

The wearer of four Adventurer's pieces SHALL have HP restored by 6% of its maximum each second for 5 seconds when a chest is opened.

#### Scenario: a chest opened by a four-piece wearer restores HP for five seconds

- **GIVEN** a character wearing four Adventurer's pieces with HP below its maximum
- **WHEN** a chest is opened in the world
- **THEN** the character's HP is restored by 6% of its maximum each second

#### Scenario: the restoration stops after five seconds

- **GIVEN** a character whose HP is being restored by Adventurer's four-piece bonus
- **WHEN** five seconds pass after the chest was opened
- **THEN** the restoration stops

#### Scenario: a wearer of fewer than four pieces is not restored

- **GIVEN** a character wearing two Adventurer's pieces
- **WHEN** a chest is opened in the world
- **THEN** the character's HP is not restored by the set's bonus

### Requirement: Restoration Applies Only To The Wearer

The Adventurer's four-piece restoration SHALL apply only to the character wearing the set.

#### Scenario: another party member without the set is not restored

- **GIVEN** a party in which one character wears four Adventurer's pieces and another wears none
- **WHEN** a chest is opened in the world
- **THEN** only the character wearing the set has its HP restored
