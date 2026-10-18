## Purpose

Ifa's kit as built outside her Nightsoul Blessing: her three normal attacks, charged attack, Compound Sedation Field's hit, and her low and collision plunges. Tonic Shot, her healing, the sedation marks and her passives and Constellations 1, 2 and 6 wait on the Nightsoul Blessing, while her Constellation 4 is built.

## Requirements

### Requirement: Normal attacks and charged attack outside the Blessing

Ifa's three normal attacks and charged attack SHALL play outside her Nightsoul Blessing, and none of their hits SHALL deal poise.

#### Scenario: The three normal attacks play in order

- **GIVEN** Ifa is the character on the field and outside her Nightsoul Blessing
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three normal attacks play in order
- **AND** none of their hits deals poise

#### Scenario: The charged attack costs 50 stamina

- **GIVEN** Ifa has at least 50 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack plays
- **AND** 50 stamina is spent

### Requirement: Low plunge and collision outside the Blessing

Ifa's low plunge and its collision SHALL play outside her Nightsoul Blessing without waiting for the Blessing to end.

#### Scenario: The low plunge and its collision land

- **GIVEN** Ifa is in the air outside her Nightsoul Blessing
- **WHEN** the player plunges
- **THEN** the low plunge hits 38 frames into its 71-frame animation
- **AND** its collision lands 32 frames in as a circle of 1.5 metres

### Requirement: Provisional high plunge

Ifa's high plunge SHALL use a borrowed reach and timing until a recording of it settles them.

#### Scenario: The high plunge uses the shared reach

- **GIVEN** Ifa is in the air
- **WHEN** the player plunges from a height
- **THEN** the hit lands at frame 0 of a 71-frame animation
- **AND** its reach is the shared high plunge reach until a recording settles it

### Requirement: Compound Sedation Field's burst hit

Compound Sedation Field, Ifa's burst, SHALL deal an area hit on the primary target and go on a 15-second cooldown.

#### Scenario: Casting the burst strikes the primary target

- **GIVEN** Ifa has 60 energy
- **WHEN** the player casts Compound Sedation Field
- **THEN** its area hit lands on the primary target
- **AND** 60 energy is spent
- **AND** the burst cools for 15 seconds

#### Scenario: The burst cannot be cast during its cooldown

- **GIVEN** the burst is cooling down
- **WHEN** the player casts Compound Sedation Field again
- **THEN** nothing happens

### Requirement: Skill cooldown without a hit yet

Ifa's skill SHALL start its 7.5-second cooldown when pressed and SHALL deal no hit yet.

#### Scenario: Pressing the skill starts its cooldown

- **GIVEN** the skill is off cooldown
- **WHEN** the player presses the skill
- **THEN** no hit lands
- **AND** the 7.5-second cooldown starts at once

#### Scenario: The skill cannot be pressed during its cooldown

- **GIVEN** the skill is cooling down
- **WHEN** the player presses the skill again within 7.5 seconds
- **THEN** nothing happens

### Requirement: Fourth constellation adds 100 Elemental Mastery for 15 seconds after her burst

From constellation 4, Ifa SHALL gain 100 Elemental Mastery for 15 seconds when her burst starts. Her wind current's three extra seconds are not built.

#### Scenario: A burst at constellation 4 adds the Elemental Mastery

- **GIVEN** Ifa is at constellation 4
- **WHEN** she casts her burst
- **THEN** she gains 100 Elemental Mastery for 15 seconds

#### Scenario: A burst below constellation 4 adds nothing

- **GIVEN** Ifa is at constellation 3
- **WHEN** she casts her burst
- **THEN** no Elemental Mastery buff is added
