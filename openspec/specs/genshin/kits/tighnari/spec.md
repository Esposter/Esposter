## Purpose

Tighnari's kit as built: his four strikes, a fully charged shot, a collision and two plunges, Vijnana-Phala Mine, and Tanglevine Shaft with its secondary, with Vijnana Suffusion's Wreath Arrow and his passives left unbuilt.

## Requirements

### Requirement: Tighnari's strikes, shot and plunges

Tighnari's four strikes, fully charged shot, collision and two plunges SHALL land on the enemies within reach, carrying no poise.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Fully charged shot lands past its cancel

- **WHEN** the player fully charges and fires the shot
- **THEN** the arrow lands at 96 frames, past the action's 94-frame end

### Requirement: Vijnana-Phala Mine

Vijnana-Phala Mine SHALL place a mine whose area is a circle of radius 6 metres round the primary target.

#### Scenario: Mine's area covers the target

- **WHEN** the player places Vijnana-Phala Mine
- **THEN** its area is a circle of radius 6 metres round the primary target

### Requirement: Tanglevine Shaft

Tanglevine Shaft SHALL land six hits from 112 to 175 frames and its secondary six hits, and the skill SHALL go on its cooldown and cost its energy when cast.

#### Scenario: Shaft lands its hits

- **WHEN** the player casts Tanglevine Shaft
- **THEN** its six hits land between 112 and 175 frames
- **AND** the secondary's six hits land too

#### Scenario: Burst refused without enough energy

- **GIVEN** Tighnari has less than the burst's energy cost
- **WHEN** the player casts Tanglevine Shaft
- **THEN** the burst does not start

### Requirement: Constellation 1 charged CRIT Rate

From Constellation 1, Tighnari's charged attacks SHALL have 15% more CRIT Rate.

#### Scenario: Constellation 1 raises the CRIT Rate of his charged attacks

- **GIVEN** Tighnari has Constellation 1
- **WHEN** a charged attack's strike is read
- **THEN** its CRIT Rate is raised by 15%

#### Scenario: Constellation 0 changes nothing

- **GIVEN** Tighnari has no constellation
- **WHEN** a charged attack's strike is read
- **THEN** its CRIT Rate is unchanged

### Requirement: Unbuilt Tighnari effects

Vijnana Suffusion's Wreath Arrow, which turns the fully charged shot into a separate shot while the suffusion lasts, and Tighnari's passives and Constellations 2, 4 and 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Tighnari has a suffusion, passive or Constellation 2, 4 or 6 unlocked
- **WHEN** the player fights with Tighnari
- **THEN** that effect has no effect
