## Purpose

Kuki's kit as built: four strikes, a charged attack, Grass Ring of Sanctification with its ring and drain, and Gyoei Narukami Kariyama Rite's seven hits or twelve at half health or less, with Ascension 1's Breaking Free, Ascension 4 and Constellations 1 and 2 built, and Constellations 4 and 6 not built.

## Requirements

### Requirement: Kuki's strikes and charged attack

Kuki's four strikes SHALL land in order, and her charged attack SHALL land two slashes, each hitting the enemies within reach.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack slashes

- **WHEN** the player uses the charged attack
- **THEN** both slashes land on the enemies within reach

### Requirement: Grass Ring of Sanctification

Kuki's elemental skill SHALL create a ring that every 90 frames from its 23rd heals the active character from her Max HP and a flat amount, and strikes two frames after each tick, and the cast SHALL drain 30% of her health without going below 20%.

#### Scenario: Ring heals and strikes on each tick

- **GIVEN** Grass Ring of Sanctification has been cast
- **WHEN** a tick comes due, 90 frames after the last
- **THEN** the active character is healed
- **AND** the ring strikes two frames later

#### Scenario: A second cast replaces the ring

- **GIVEN** Grass Ring of Sanctification is on the field
- **WHEN** Kuki casts Sanctifying Ring again
- **THEN** the new ring replaces the old one, and one ring stands

#### Scenario: Drain stops at the floor

- **GIVEN** Kuki's health is at or near 20%
- **WHEN** the cast drains her health
- **THEN** her health does not drop below 20%

### Requirement: Gyoei Narukami Kariyama Rite

Kuki's elemental burst SHALL deal seven hits, or twelve at half her health or less, each dealing a share of her Max HP as flat damage.

#### Scenario: Seven hits land

- **WHEN** the player casts Gyoei Narukami Kariyama Rite
- **THEN** seven hits land on the enemies in reach
- **AND** each hit deals damage equal to a share of Kuki's Max HP

### Requirement: Kuki's burst hit count at half health

Kuki's burst SHALL land seven hits while her health is above half, and twelve at half or less, the hits past the seventh each a gap of the record's own on from the last.

#### Scenario: Seven hits above half health

- **GIVEN** Kuki's health is above half
- **WHEN** the player casts Gyoei Narukami Kariyama Rite
- **THEN** seven hits land

#### Scenario: Twelve hits at half health or less

- **GIVEN** Kuki's health is at half or less
- **WHEN** the player casts Gyoei Narukami Kariyama Rite
- **THEN** twelve hits land on the enemies in reach

### Requirement: Kuki's Ascension and constellations

Kuki's Ascension 1, Ascension 4 and Constellations 1 and 2 SHALL take effect, and her Constellations 4 and 6 SHALL NOT take effect.

#### Scenario: Breaking Free raises the Healing Bonus at half health

- **GIVEN** Kuki has Ascension 1
- **WHEN** her health is at half or less
- **THEN** her Healing Bonus is raised by 15%

#### Scenario: Built constellations apply

- **GIVEN** Kuki has Constellation 1 or 2 unlocked
- **WHEN** the player fights with Kuki
- **THEN** that constellation's effect applies

#### Scenario: Unbuilt constellations do nothing

- **GIVEN** Kuki has Constellation 4 or 6 unlocked
- **WHEN** the player fights with Kuki
- **THEN** that constellation has no effect
