## Purpose

Razor's kit as built: the strikes, charged attack and collision, Claw and Thunder's press and hold, and Lightning Fang with the Wolf Within and its Soul Companion over the Electro Sigils, with Awakening's cooldown cut built, and his other passives, other constellations and Hexerei kit left unbuilt.

## Requirements

### Requirement: Razor's strikes, charged attack and collision

Razor's strikes, charged attack and collision SHALL land on the enemies within reach.

#### Scenario: Strikes land in sequence

- **WHEN** the player uses normal attack in a row
- **THEN** each strike lands in order on the enemies within reach

#### Scenario: Charged attack and collision land

- **WHEN** the player uses the charged attack or starts a plunge
- **THEN** its hits land on the enemies within reach

### Requirement: Electro Sigils from Claw and Thunder

Each press of Claw and Thunder SHALL give Razor an Electro Sigil, up to three, restarting at 18 seconds, and each Sigil SHALL give Razor energy when the hold or the burst clears them, capped at the burst's cost.

#### Scenario: Press gives a Sigil

- **WHEN** the player presses Claw and Thunder
- **THEN** Razor gains an Electro Sigil, up to three

#### Scenario: Hold clears the Sigils into energy

- **GIVEN** Razor holds Electro Sigils
- **WHEN** the hold strikes
- **THEN** each Sigil gives Razor energy and the Sigils are cleared
- **AND** Razor's energy is capped at the burst's cost

### Requirement: Claw and Thunder's hold

Claw and Thunder's hold SHALL be reached after half a second of holding, provisionally, and SHALL play its hit and animation on release.

#### Scenario: Hold is reached after half a second

- **WHEN** the player holds Claw and Thunder for half a second and releases it
- **THEN** the hold's hit plays on release

#### Scenario: Tap plays the press

- **WHEN** the player taps Claw and Thunder
- **THEN** the press plays instead of the hold

### Requirement: Wolf Within

Lightning Fang's hit SHALL start the Wolf Within, a field that stands for 15 seconds, grants Razor an 80% Electro RES as its first tick, and ends when another character takes the field.

#### Scenario: Wolf Within stands after Lightning Fang

- **WHEN** Lightning Fang strikes an enemy
- **THEN** the Wolf Within stands for 15 seconds
- **AND** Razor gains an 80% Electro RES

#### Scenario: Wolf Within ends on a swap

- **GIVEN** the Wolf Within is standing
- **WHEN** another character takes the field
- **THEN** the Wolf Within ends and its Electro RES is removed

### Requirement: Soul Companion

While the Wolf Within stands, each strike SHALL cast a Soul Companion that lands Electro damage at 24% of the strike's multiplier a frame after the strike's hit.

#### Scenario: Strike casts a Soul Companion

- **GIVEN** the Wolf Within is standing
- **WHEN** a strike hits
- **THEN** a Soul Companion lands Electro damage a frame after the strike

### Requirement: Lupus Fulguris from six constellations

From six constellations, a strike SHALL cast Lupus Fulguris's lightning while none stands, dealing Electro damage that stands for 10 seconds past the strike's hit.

#### Scenario: Strike casts the lightning

- **GIVEN** Razor has six constellations and no lightning stands
- **WHEN** a strike hits
- **THEN** the lightning is cast a frame after the strike
- **AND** it stands for 10 seconds past the strike's hit

### Requirement: Razor's other passives and Hexerei kit not yet built

Razor's other passives, his other constellations, his Hexerei kit, the Wolf Within's ATK SPD, his energy on leaving the field, and Hunger's Energy Recharge SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Razor has another passive, a constellation or the Hexerei kit unlocked
- **WHEN** the player fights with Razor
- **THEN** that effect has no effect
