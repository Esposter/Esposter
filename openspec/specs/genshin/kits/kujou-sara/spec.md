## Purpose

Kujou Sara's kit as built: five strikes, a fully charged shot, Tengu Stormcall's Cover with its Ambush, and Subjugation: Koukou Sendou's Titanbreaker with its Stormclusters, with Ascension 4's energy and Constellations 1 and 6 not built.

## Requirements

### Requirement: Kujou Sara's five strikes

Kujou Sara's normal attack SHALL land five strikes in order, each hitting the enemies within its reach.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach

### Requirement: Fully charged shot and the Cover

Tengu Stormcall's Cover SHALL last eighteen seconds, and while it stands a fully charged shot from Ascension 1 SHALL spend it to set out an Ambush at the target.

#### Scenario: Covered shot sets out the Ambush

- **GIVEN** the Cover is standing and Kujou Sara has Ascension 1
- **WHEN** the player lands a fully charged shot
- **THEN** the Cover is spent
- **AND** an Ambush is set out at the target 150 frames later

#### Scenario: Uncovered shot leaves the Cover alone

- **GIVEN** the Cover is not standing
- **WHEN** the player lands a fully charged shot
- **THEN** no Ambush is set out

### Requirement: Electro ATK bonus for the character on the field

Kujou Sara's Electro hits SHALL give the character on the field an ATK Bonus, a share of Kujou Sara's base ATK, for six seconds.

#### Scenario: Electro hit gives the bonus

- **WHEN** a Kujou Sara Electro hit lands
- **THEN** the character on the field gains the ATK Bonus for six seconds

### Requirement: Titanbreaker and its Stormclusters

Subjugation: Koukou Sendou's Titanbreaker SHALL set off Stormclusters in four bouts of six ticks each, and in six bouts from Constellation 4.

#### Scenario: Four bouts without Constellation 4

- **GIVEN** Kujou Sara has fewer than four constellations
- **WHEN** the player casts Titanbreaker
- **THEN** four bouts of six Stormcluster ticks land

#### Scenario: Six bouts from Constellation 4

- **GIVEN** Kujou Sara has Constellation 4
- **WHEN** the player casts Titanbreaker
- **THEN** six bouts of six Stormcluster ticks land

### Requirement: Energy, Constellation 1 and 6 not yet built

Ascension 4's energy and Constellations 1 and 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Kujou Sara has Ascension 4 or Constellation 1 or 6 unlocked
- **WHEN** the player fights with Kujou Sara
- **THEN** that effect has no effect
