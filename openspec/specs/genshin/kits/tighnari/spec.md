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

### Requirement: Unbuilt Tighnari effects

Vijnana Suffusion's Wreath Arrow, which turns the fully charged shot into a separate shot while the suffusion lasts, and Tighnari's passives and constellations SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Tighnari has a suffusion, passive or constellation unlocked
- **WHEN** the player fights with Tighnari
- **THEN** that effect has no effect
