## Purpose

Rosaria's kit as built: her seven-hit string, Ravaging Confession and Rites of Termination with its field of ticks, with both her passives and her Constellations 1, 4 and 6 built, and the teleport behind the target left unbuilt.

## Requirements

### Requirement: Rosaria's seven-hit string

Rosaria's normal attack SHALL land a seven-hit string over five normal attacks, each hitting the enemies within reach.

#### Scenario: Seven hits over five attacks

- **WHEN** the player uses normal attack five times in a row
- **THEN** the seven hits of the string land on the enemies within reach

### Requirement: Rosaria's charged attack and plunges

Rosaria's charged attack, collision and two plunges SHALL land on the enemies within reach, with their plunge timings provisional.

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

Rites of Termination SHALL strike a slash and a lance, then leave a field that ticks every two seconds from Rosaria's body, each tick a circle of 9.5 metres round her body, the reach of gcsim's circle of radius 6.5 three metres ahead of her, and Constellation 2 SHALL add four seconds to the field.

#### Scenario: Field ticks every two seconds

- **WHEN** the player casts Rites of Termination
- **THEN** the field ticks every two seconds
- **AND** each tick strikes a circle three metres ahead of Rosaria

#### Scenario: Constellation 2 extends the field

- **GIVEN** Rosaria has Constellation 2
- **WHEN** Rites of Termination is cast
- **THEN** the field lasts four seconds longer

### Requirement: Ravaging Confession's first hit raises her CRIT Rate from Ascension 1

From Ascension 1, Ravaging Confession's first hit SHALL give Rosaria 12% CRIT Rate for 5 seconds as it strikes an enemy, whichever side it strikes from.

#### Scenario: Regina Probationum on the first hit

- **GIVEN** Rosaria has reached Ascension 1
- **WHEN** Ravaging Confession's first hit strikes an enemy
- **THEN** her CRIT Rate rises by 12% for 5 seconds

### Requirement: Constellation 1 CRIT hit raises Normal Attack DMG and ATK SPD

From Constellation 1, a CRIT hit of Rosaria's while she is on the field SHALL give her 10% Normal Attack DMG and 10% Normal ATK SPD for 4 seconds.

#### Scenario: A CRIT hit on the field raises her Normal Attacks

- **GIVEN** Rosaria has Constellation 1 and is on the field
- **WHEN** one of her hits lands a CRIT
- **THEN** her Normal Attack DMG and Normal ATK SPD rise by 10% for 4 seconds

#### Scenario: A CRIT hit off the field raises nothing

- **GIVEN** Rosaria has Constellation 1 and another character is on the field
- **WHEN** one of her hits lands a CRIT
- **THEN** her Normal Attack DMG and Normal ATK SPD are unchanged

#### Scenario: The bonus does not reach her charged attack

- **GIVEN** Rosaria has Constellation 1 and the bonus stands
- **WHEN** her charged attack strikes an enemy
- **THEN** its DMG is unchanged

### Requirement: Constellation 4 Energy from a CRIT hit of Ravaging Confession

From Constellation 4, the first CRIT hit of each cast of Ravaging Confession while Rosaria is on the field SHALL restore 5 Energy to her, and no later CRIT hit of that cast SHALL restore any.

#### Scenario: The first CRIT hit of a cast restores Energy

- **GIVEN** Rosaria has Constellation 4 and is on the field
- **WHEN** a hit of Ravaging Confession lands a CRIT
- **THEN** Rosaria restores 5 Energy

#### Scenario: A second CRIT hit of the same cast restores nothing

- **GIVEN** Rosaria has Constellation 4 and a hit of this cast has already restored Energy
- **WHEN** the cast's other hit lands a CRIT
- **THEN** no Energy is restored

#### Scenario: Below Constellation 4 nothing is restored

- **GIVEN** Rosaria has Constellation 3
- **WHEN** a hit of Ravaging Confession lands a CRIT
- **THEN** no Energy is restored

### Requirement: Constellation 6 lowers enemies' Physical RES from Rites of Termination

From Constellation 6, each enemy that an attack of Rites of Termination strikes SHALL have its Physical RES lowered by 20% for 10 seconds.

#### Scenario: A Rites of Termination attack lowers Physical RES

- **GIVEN** Rosaria has Constellation 6
- **WHEN** the slash, the lance or a tick of Rites of Termination strikes an enemy
- **THEN** that enemy's Physical RES is lowered by 20% for 10 seconds

#### Scenario: Below Constellation 6 Physical RES is unchanged

- **GIVEN** Rosaria has Constellation 5
- **WHEN** Rites of Termination strikes an enemy
- **THEN** that enemy's Physical RES is unchanged

### Requirement: Unbuilt Rosaria effects

The teleport behind the target SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Rosaria has the teleport unlocked
- **WHEN** the player fights with Rosaria
- **THEN** that effect has no effect

## Open

- [ ] **Each Rites of Termination tick is a 9.5-metre circle round her body** — no source yet: gcsim's tick is a radius-6.5 circle three metres ahead, and no source settles which shape the game draws.
