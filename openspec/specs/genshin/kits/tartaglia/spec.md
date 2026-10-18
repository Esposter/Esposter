## Purpose

Tartaglia's kit as built: his Ranged and Melee stances, Riptide and its strikes, and Havoc: Obliteration, with his Master of Weaponry, particles and the Melee Stance's refusal of plunges left unbuilt.

## Requirements

### Requirement: Ranged Stance strikes

In his Ranged Stance, Tartaglia's six arrows and fully charged aimed shot SHALL land on the enemies within reach, and his collision and two plunges SHALL land on the enemies within reach.

#### Scenario: Ranged arrows land

- **GIVEN** Tartaglia is in his Ranged Stance
- **WHEN** the player uses normal attack
- **THEN** the arrows land on the enemies within reach

#### Scenario: Fully charged aimed shot lands

- **GIVEN** Tartaglia is in his Ranged Stance
- **WHEN** the player fully charges and fires the aimed shot
- **THEN** the shot lands on the enemies within reach

### Requirement: Foul Legacy and the Melee Stance

Foul Legacy: Raging Tide SHALL change Tartaglia into his Melee Stance with six Hydro strikes, a charged attack of two hits and a press back, and the stance SHALL end on the press back, at its longest, or when he leaves the field.

#### Scenario: Melee Stance strikes

- **GIVEN** Tartaglia is in his Melee Stance
- **WHEN** the player uses normal attack six times in a row
- **THEN** six Hydro strikes land in order, the sixth being two hits

#### Scenario: Stance ends on press back

- **GIVEN** Tartaglia is in his Melee Stance
- **WHEN** the player presses back
- **THEN** the stance ends

#### Scenario: Stance end sets the skill cooldown

- **GIVEN** Tartaglia has held the Melee Stance for a number of whole seconds
- **WHEN** the stance ends
- **THEN** the skill's cooldown is 6 seconds plus each whole second held
- **AND** a stance held for its longest 30 seconds sets the cooldown to 45 seconds

#### Scenario: Swap ends the stance

- **GIVEN** Tartaglia is in his Melee Stance
- **WHEN** he leaves the field
- **THEN** the stance ends

### Requirement: Riptide and its strikes

Riptide SHALL be given by a fully charged aimed shot, Flash of Havoc, Riptide Burst and Sword of Torrents, and an enemy holding Riptide SHALL have Riptide Flash, Riptide Slash, Riptide Blast and Riptide Burst set off on their own intervals.

#### Scenario: Shot gives Riptide

- **WHEN** a fully charged aimed shot hits an enemy
- **THEN** that enemy holds Riptide

#### Scenario: Riptide Flash sets off on a second Riptide

- **GIVEN** an enemy already holds Riptide
- **WHEN** a hit gives it Riptide again
- **THEN** Riptide Flash is set off

### Requirement: Riptide Blast timing

Riptide Blast SHALL land 0.8 seconds after its hit and clear the enemy's Riptide as it lands.

#### Scenario: Blast lands after a delay

- **WHEN** Riptide Blast's hit lands
- **THEN** the blast lands 0.8 seconds later
- **AND** the enemy's Riptide is cleared

### Requirement: Hydrospout ticks

From Constellation 1, Hydrospout SHALL tick on each enemy every 3.9 seconds from the first Riptide on that enemy.

#### Scenario: Hydrospout ticks every 3.9 seconds

- **GIVEN** an enemy first holds Riptide
- **WHEN** 3.9 seconds have passed
- **THEN** Hydrospout ticks on that enemy

### Requirement: Ascensions and constellations

Never Ending, Sword of Torrents, Tide Withholder, Understream, Hydrospout and Havoc: Annihilation SHALL take effect from Tartaglia's Ascensions and constellations, and Master of Weaponry, particles and the Melee Stance's refusal of plunges SHALL NOT take effect.

#### Scenario: Built effects apply

- **GIVEN** Tartaglia has one of the built Ascensions or constellations unlocked
- **WHEN** the player fights with Tartaglia
- **THEN** that effect applies

#### Scenario: Melee Stance does not refuse plunges

- **GIVEN** Tartaglia is in his Melee Stance
- **WHEN** the player starts a plunge attack
- **THEN** the plunge is not refused
