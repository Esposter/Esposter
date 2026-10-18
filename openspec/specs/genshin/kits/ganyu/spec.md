## Purpose

Ganyu's kit as built: her six strikes, a fully charged shot with its Frostflake Arrow and Bloom, Ice Lotus and Celestial Shower's field, with Constellations 4 and 6 and the particles left unbuilt.

## Requirements

### Requirement: Six strikes

Ganyu's six strikes SHALL play in order from the attack button as her normal attacks.

#### Scenario: Strike chain plays six strikes in order

- **GIVEN** Ganyu is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her six strikes play in order and each deals its own hit

### Requirement: Fully charged shot leaves a Bloom

Ganyu's fully charged shot SHALL fire a Frostflake Arrow and leave a Bloom behind it.

#### Scenario: A fully charged shot fires its arrow and Bloom

- **GIVEN** Ganyu has charged her shot fully
- **WHEN** the player releases the shot
- **THEN** the Frostflake Arrow hits its target
- **AND** the Bloom lands 131 frames after the release, past the shot's 113-frame animation

### Requirement: Ice Lotus taunts, then explodes

Trail of the Qilin's Ice Lotus SHALL stand with its taunt for its seconds and explode as the taunt runs out.

#### Scenario: The Ice Lotus explodes as its taunt runs out

- **GIVEN** Ganyu is the character on the field
- **WHEN** the player casts Trail of the Qilin
- **THEN** the Ice Lotus stands and taunts for its seconds
- **AND** it explodes 373 frames after the cast, as the taunt runs out

#### Scenario: The Ice Lotus stands until its seconds run out

- **GIVEN** the Ice Lotus stands
- **WHEN** no time has yet passed for its seconds to run out
- **THEN** the Ice Lotus keeps standing
- **AND** it has no health, so it stands until its seconds run out

### Requirement: Celestial Shower leaves a field

Celestial Shower SHALL leave a field that ticks and strikes enemies for the burst's seconds.

#### Scenario: The shower's field strikes while it lasts

- **GIVEN** Ganyu is the character on the field
- **WHEN** the player casts Celestial Shower
- **THEN** the field ticks and strikes enemies within it
- **AND** the field ends when the burst's seconds run out

#### Scenario: The field gives Cryo DMG Bonus from her first ascension onward

- **GIVEN** Ganyu has her fourth ascension
- **WHEN** the active character stands inside the field
- **THEN** that character gains 20% Cryo DMG Bonus

### Requirement: Ascension 1 gives CRIT Rate to later arrows

From her first ascension, every Frostflake Arrow after the first SHALL gain 20% CRIT Rate.

#### Scenario: A later arrow gains CRIT Rate

- **GIVEN** Ganyu has her first ascension
- **WHEN** a Frostflake Arrow fires after the first one
- **THEN** that arrow gains 20% CRIT Rate

#### Scenario: The first arrow gains no CRIT Rate

- **GIVEN** Ganyu has her first ascension
- **WHEN** the first Frostflake Arrow fires
- **THEN** it gains no CRIT Rate from this effect

### Requirement: Constellation 1 lowers Cryo RES

Ganyu's first constellation SHALL lower the Cryo RES of enemies that her arrows and their Bloom hit.

#### Scenario: An enemy hit by an arrow loses Cryo RES

- **GIVEN** Ganyu is at constellation 1
- **WHEN** a Frostflake Arrow or its Bloom hits an enemy
- **THEN** that enemy's Cryo RES is lowered
