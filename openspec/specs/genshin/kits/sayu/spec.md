## Purpose

Sayu's kit as built: Fuufuu Windwheel's press, short hold and roll, and Mujina Flurry's field and Muji-Muji Daruma ticks, with her Ascension 1 heal, Ascension 4 wider Daruma, and Constellations 1, 4 and 6 built, and her Constellation 2 and the roll's elemental kick left unbuilt.

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

### Requirement: Short hold

Holding Fuufuu Windwheel SHALL play the short hold at 48 frames.

#### Scenario: Short hold plays at 48 frames

- **WHEN** the player holds Fuufuu Windwheel briefly and releases it
- **THEN** the short hold's damage over time and kick land at 48 frames

### Requirement: Fuufuu Windwheel's roll

Holding Fuufuu Windwheel longer SHALL play a roll whose level rises with each whole second held up to ten, each level carrying its own ticks and cooldown.

#### Scenario: Roll level rises with the hold

- **WHEN** the player holds Fuufuu Windwheel for three whole seconds and releases it
- **THEN** the roll plays at the level for three seconds
- **AND** its damage over time ticks every half second

#### Scenario: Roll cooldown grows with the hold

- **WHEN** the player releases the roll after holding it
- **THEN** the cooldown grows by half a second for each second held

### Requirement: Mujina Flurry

Mujina Flurry SHALL land an initial hit and leave a field that heals the active character by a flat amount and a share of Sayu's ATK at the cast, and summon six Muji-Muji Daruma ticks.

#### Scenario: Field heals after the initial hit

- **WHEN** the player casts Mujina Flurry
- **THEN** the initial hit lands
- **AND** the field heals the active character by a flat amount and a share of Sayu's ATK

### Requirement: Muji-Muji Daruma's ticks

Each Muji-Muji Daruma tick SHALL strike the enemies in reach and heal the active character while it is at 70% HP or under.

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

### Requirement: Constellation 1 heal at any HP

From Constellation 1, a Muji-Muji Daruma tick SHALL heal the active character whatever its HP, while she is in reach of the tick.

#### Scenario: Constellation 1 heals a character above 70% HP

- **GIVEN** Sayu has Constellation 1 and the active character is above 70% HP
- **WHEN** a Muji-Muji Daruma tick lands
- **THEN** the tick heals the active character

#### Scenario: Below Constellation 1 the 70% limit holds

- **GIVEN** Sayu has no Constellation 1 and the active character is above 70% HP
- **WHEN** a Muji-Muji Daruma tick lands
- **THEN** the tick does not heal the active character

### Requirement: Constellation 6 Elemental Mastery on Muji-Muji Daruma

From Constellation 6, each Muji-Muji Daruma tick SHALL add to its DMG her ATK times 0.2% of her Elemental Mastery, at most 400% of her ATK, and SHALL heal by 3 of her Elemental Mastery, at most 6000, read as she stood at the cast.

#### Scenario: Constellation 6 adds Elemental Mastery to each tick

- **GIVEN** Sayu has Constellation 6
- **WHEN** Muji-Muji Daruma is cast
- **THEN** each of its ticks adds to its DMG and heals by the Elemental Mastery shares, each at its cap

#### Scenario: Below Constellation 6 the ticks add nothing

- **GIVEN** Sayu has Constellation 5
- **WHEN** Muji-Muji Daruma is cast
- **THEN** its ticks add no DMG and no heal from Elemental Mastery

### Requirement: Unbuilt Sayu effects

Sayu's Constellation 2 and the roll's elemental kick SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Sayu has Constellation 2, or the roll's kick unlocked
- **WHEN** the player fights with Sayu
- **THEN** that effect has no effect
