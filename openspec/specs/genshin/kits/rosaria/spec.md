## Purpose

Rosaria's kit as built: her seven-hit string, Ravaging Confession and Rites of Termination with its field of ticks, with her Ascension 4 Crit Rate share built, and her Ascension 1, her other constellations and the teleport behind the target left unbuilt.

## Requirements

### Requirement: Rosaria's seven-hit string

Rosaria's normal attack SHALL land a seven-hit string over five normal attacks, each hitting the enemies within reach.

#### Scenario: Seven hits over five attacks

- **WHEN** the player uses normal attack five times in a row
- **THEN** the seven hits of the string land on the enemies within reach

### Requirement: Rosaria's charged attack and plunges

Rosaria's charged attack, collision and two plunges SHALL land on the enemies within reach, with their poise and plunge timings provisional.

#### Scenario: Charged attack lands

- **WHEN** the player uses the charged attack
- **THEN** its hits land on the enemies within reach

#### Scenario: Plunge lands

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach

### Requirement: Ravaging Confession

Ravaging Confession SHALL deal its two hits, reaching from Rosaria's body, and SHALL go on a cooldown.

#### Scenario: Confession deals two hits

- **WHEN** the player presses Ravaging Confession
- **THEN** its two hits land on the enemies within reach from Rosaria's body
- **AND** the skill goes on cooldown

#### Scenario: Press refused during cooldown

- **GIVEN** Ravaging Confession is on cooldown
- **WHEN** the player presses it
- **THEN** the press is not used

### Requirement: Rites of Termination's field

Rites of Termination SHALL strike a slash and a lance, then leave a field that ticks every two seconds from Rosaria's body, each tick a circle three metres ahead of her body, and Constellation 2 SHALL add four seconds to the field.

#### Scenario: Field ticks every two seconds

- **WHEN** the player casts Rites of Termination
- **THEN** the field ticks every two seconds
- **AND** each tick strikes a circle three metres ahead of Rosaria

#### Scenario: Constellation 2 extends the field

- **GIVEN** Rosaria has Constellation 2
- **WHEN** Rites of Termination is cast
- **THEN** the field lasts four seconds longer

### Requirement: Unbuilt Rosaria effects

Rosaria's Ascension 1, her other constellations and the teleport behind the target SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Rosaria has her Ascension 1 passive, a constellation or the teleport unlocked
- **WHEN** the player fights with Rosaria
- **THEN** that effect has no effect
