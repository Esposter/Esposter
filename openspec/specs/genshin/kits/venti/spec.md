## Purpose

Venti's kit as built, with Skyward Sonnet's Wind Domain, the Stormeye and Splitting Gales, and what is left unbuilt in his Elemental Absorption, passives and Hexerei kit.

## Requirements

### Requirement: Venti's shots

Venti's six shots, the first and fourth of which fire two arrows each, and his fully charged aimed shot SHALL land on the enemies within reach, with their arrows and shots priced round his body.

#### Scenario: Six shots in sequence

- **WHEN** the player uses normal attack six times in a row
- **THEN** the six shots land in order on the enemies within reach
- **AND** the first and fourth shots each fire two arrows

#### Scenario: Fully charged aimed shot lands

- **WHEN** the player fully charges and fires the aimed shot
- **THEN** the shot lands on the enemies within reach

### Requirement: Skyward Sonnet's press and Wind Domain

Skyward Sonnet's press SHALL end after 22 frames, and its Wind Domain SHALL land after the press ends, as a skill hit from where Venti stood.

#### Scenario: Press ends at its earliest cancel

- **WHEN** the player presses Skyward Sonnet
- **THEN** the press plays for 22 frames
- **AND** the Wind Domain lands after the press ends

### Requirement: Skyward Sonnet's hold

Holding Skyward Sonnet SHALL be reached after half a second, provisionally, and the hold's hit SHALL land at 74 frames, ending at 116 frames.

#### Scenario: Hold is reached after half a second

- **WHEN** the player holds Skyward Sonnet for half a second
- **THEN** the hold's hit lands at 74 frames
- **AND** the hold ends at 116 frames

#### Scenario: Tap plays the press

- **WHEN** the player taps Skyward Sonnet
- **THEN** the press plays instead of the hold

### Requirement: Stormeye

Wind's Grand Ode SHALL place the Stormeye 5 metres ahead of where Venti faces when the burst starts, and it SHALL land 20 Anemo ticks every 24 frames from 106 frames, each reaching 4 metres round the Stormeye.

#### Scenario: Stormeye ticks in sequence

- **WHEN** the player casts Wind's Grand Ode
- **THEN** the Stormeye stands 5 metres ahead of Venti
- **AND** its first tick lands at 106 frames, then every 24 frames for 20 ticks in all

#### Scenario: Ascension 4 gives energy as the Stormeye ends

- **GIVEN** Venti has Ascension 4
- **WHEN** the burst starts and the Stormeye's seconds run out
- **THEN** Venti gains 15 energy up to the burst's cost

### Requirement: Splitting Gales from Constellation 1

From Constellation 1, a fully charged shot SHALL cast two more arrows from where Venti stands, each landing at the shot's hitmark.

#### Scenario: Two extra arrows

- **GIVEN** Venti has Constellation 1
- **WHEN** the fully charged shot is fired
- **THEN** two more arrows land at the shot's hitmark

### Requirement: Breeze of Reminiscence and Storm of Defiance

From Constellation 2, each Skyward Sonnet hit SHALL cut the Anemo RES of each enemy it strikes by 12% for 10 seconds, and from Constellation 6, each Stormeye tick SHALL cut it by a further 20% for 10 seconds, the two adding up.

#### Scenario: Skyward Sonnet cuts Anemo RES

- **GIVEN** Venti has Constellation 2
- **WHEN** a Skyward Sonnet hit strikes an enemy
- **THEN** that enemy's Anemo RES drops by 12% for 10 seconds

#### Scenario: Two cuts add up

- **GIVEN** Venti has Constellation 6
- **WHEN** a Stormeye tick strikes an enemy hit by Skyward Sonnet
- **THEN** that enemy's Anemo RES drops by the two cuts added together

### Requirement: Unbuilt Venti effects

Elemental Absorption, the Stormeye's pull, Breeze of Reminiscence's Physical RES, Hurricane of Freedom, Venti's other constellations and his Hexerei kit SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Venti has one of these effects unlocked
- **WHEN** the player fights with Venti
- **THEN** that effect has no effect
