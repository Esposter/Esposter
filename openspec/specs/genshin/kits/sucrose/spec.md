## Purpose

Sucrose's kit as built: Astable Anemohypostasis Creation-6308 with its Swirl and Forbidden Creation's absorbing Anemo field, with Ascension 1 and 4 and Constellations 2 and 6 built and the skill's pull, Constellation 4 and her Hexerei team bonus left out.

## Requirements

### Requirement: Sucrose's strikes and charged attack

Sucrose's four strikes and charged attack SHALL land on the enemies within reach.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack lands

- **WHEN** the player uses the charged attack
- **THEN** its hit lands on the enemies within reach

### Requirement: Astable Anemohypostasis Creation-6308

Astable Anemohypostasis Creation-6308 SHALL strike an Anemo circle round Sucrose and SHALL Swirl the enemies it reaches, going on cooldown when cast.

#### Scenario: Skill strikes and goes on cooldown

- **WHEN** the player presses Astable Anemohypostasis Creation-6308
- **THEN** the Anemo circle round Sucrose is struck
- **AND** the skill goes on cooldown

#### Scenario: Press refused during cooldown

- **GIVEN** the skill is on cooldown
- **WHEN** the player presses it
- **THEN** the press is not used

### Requirement: Forbidden Creation's absorbing field

Forbidden Creation SHALL leave an Anemo field whose absorb check runs every 18 frames from 136 frames, absorbing the first of Pyro, Hydro, Electro and Cryo held by an enemy within reach, in that order, and the absorbed element SHALL strike on each Anemo tick that comes after it is taken, with the enemy's aura left in place.

#### Scenario: Field absorbs an element

- **GIVEN** an enemy within reach holds Pyro, Hydro, Electro or Cryo
- **WHEN** the absorb check runs
- **THEN** the field takes the first such element in the order Pyro, Hydro, Electro, Cryo

#### Scenario: Absorbed element strikes on each Anemo tick

- **GIVEN** the field has taken an element
- **WHEN** an Anemo tick comes due, at 137 frames and then every 113 frames
- **THEN** the absorbed element strikes the enemies on that tick
- **AND** the enemy's aura is left in place

### Requirement: Ascension 1, Ascension 4 and Constellations 2 and 6

Sucrose's Ascension 1 Swirl Elemental Mastery share, her Ascension 4 team share of Elemental Mastery on each skill and burst hit, and Constellations 2 and 6 SHALL take effect.

#### Scenario: Ascension 4 shares Elemental Mastery

- **GIVEN** Sucrose has Ascension 4
- **WHEN** a skill or burst hit lands
- **THEN** the team gains a share of her Elemental Mastery for that hit

### Requirement: Unbuilt Sucrose effects

The skill's pull, Constellation 4 and her Hexerei team bonus SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Sucrose has Constellation 4 or the Hexerei team bonus unlocked
- **WHEN** the player fights with Sucrose
- **THEN** that effect has no effect
