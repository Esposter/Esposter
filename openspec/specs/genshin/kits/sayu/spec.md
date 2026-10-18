## Purpose

Sayu's kit as built: Fuufuu Windwheel's press, short hold and roll, and Mujina Flurry's field and Muji-Muji Daruma ticks, with her Ascension 1 heal, Ascension 4 wider Daruma and Constellation 4 Energy from Swirls built, and her Constellations 1, 2 and 6 and the roll's elemental kick left unbuilt.

## Requirements

### Requirement: Sayu's strikes, charged attack and plunges

Sayu's four strikes, charged attack of two hits, collision and two plunges SHALL land on the enemies within reach, with charged attack and plunge timings provisional.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack lands two hits

- **WHEN** the player uses the charged attack
- **THEN** two hits land on the enemies within reach

### Requirement: Fuufuu Windwheel's press

Fuufuu Windwheel's press SHALL release a Windwheel damage over time and a kick.

#### Scenario: Press releases the Windwheel and kick

- **WHEN** the player presses Fuufuu Windwheel
- **THEN** the Windwheel's damage over time applies to the enemies within reach
- **AND** a kick lands on the enemies within reach

### Requirement: Short hold and roll

Holding Fuufuu Windwheel SHALL play the short hold at 48 frames, and holding longer SHALL play a roll whose level rises with each whole second held up to ten, each level carrying its own ticks and cooldown.

#### Scenario: Short hold plays at 48 frames

- **WHEN** the player holds Fuufuu Windwheel briefly and releases it
- **THEN** the short hold's damage over time and kick land at 48 frames

#### Scenario: Roll level rises with the hold

- **WHEN** the player holds Fuufuu Windwheel for three whole seconds and releases it
- **THEN** the roll plays at the level for three seconds
- **AND** its damage over time ticks every half second

#### Scenario: Roll cooldown grows with the hold

- **WHEN** the player releases the roll after holding it
- **THEN** the cooldown grows by half a second for each second held

### Requirement: Mujina Flurry and Muji-Muji Daruma

Mujina Flurry SHALL land an initial hit and leave a field that heals the active character by a flat amount and a share of Sayu's ATK at the cast, and summon six Muji-Muji Daruma ticks, each striking the enemies in reach and healing the active character while it is at 70% HP or under.

#### Scenario: Field heals after the initial hit

- **WHEN** the player casts Mujina Flurry
- **THEN** the initial hit lands
- **AND** the field heals the active character by a flat amount and a share of Sayu's ATK

#### Scenario: Daruma tick heals a character at 70% or under

- **GIVEN** the active character is at 70% HP or under
- **WHEN** a Muji-Muji Daruma tick lands
- **THEN** the tick strikes the enemies in reach and heals the active character

### Requirement: Constellation 4 Energy from Swirls

From Constellation 4, a Swirl Sayu triggers while she is on the field SHALL restore 1.2 Energy to her, once every 2 seconds.

#### Scenario: Constellation 4 restores Energy on the field

- **GIVEN** Sayu has Constellation 4 and is on the field
- **WHEN** she triggers a Swirl
- **THEN** she gains 1.2 Energy, and no more for 2 seconds

#### Scenario: Off the field or below Constellation 4 changes nothing

- **GIVEN** Sayu has Constellation 3, or is off the field at Constellation 4
- **WHEN** she triggers a Swirl
- **THEN** no Energy is gained

### Requirement: Unbuilt Sayu effects

Sayu's Constellations 1, 2 and 6, and the roll's elemental kick SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Sayu has Constellation 1, 2 or 6, or the roll's kick unlocked
- **WHEN** the player fights with Sayu
- **THEN** that effect has no effect
