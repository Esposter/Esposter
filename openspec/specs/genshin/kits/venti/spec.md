## Purpose

Venti's kit as built, with Skyward Sonnet's Wind Domain, the Stormeye and Splitting Gales, and what is left unbuilt in his Elemental Absorption, passives and Hexerei kit.

## Requirements

### Requirement: Venti's shots

Venti's six shots, the first and fourth of which fire two arrows each, and his fully charged aimed shot SHALL land on the enemies within reach, with their arrows and shots priced round his body (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/attack.go` line 16 for the six shots, and lines 53-59 for the box each arrow lands through; `~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/aimed.go` lines 72-78 for the shot's box).

#### Scenario: Six shots in sequence

- **WHEN** the player uses normal attack six times in a row
- **THEN** the six shots land in order on the enemies within reach
- **AND** the first and fourth shots each fire two arrows (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/attack.go` line 16)

#### Scenario: Fully charged aimed shot lands

- **WHEN** the player fully charges and fires the aimed shot
- **THEN** the shot lands on the enemies within reach

### Requirement: Skyward Sonnet's press and Wind Domain

Skyward Sonnet's press SHALL end after 22 frames (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/skill.go` lines 20 and 49), and its Wind Domain SHALL land after the press ends (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/skill.go` line 55), as a skill hit from where Venti stood.

#### Scenario: Press ends at its earliest cancel

- **WHEN** the player presses Skyward Sonnet
- **THEN** the press plays for 22 frames (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/skill.go` line 20)
- **AND** the Wind Domain lands after the press ends

### Requirement: Skyward Sonnet's hold

Holding Skyward Sonnet SHALL be reached after half a second, provisionally, and the hold's hit SHALL land at 74 frames (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/skill.go` line 62), ending at 116 frames (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/skill.go` line 29).

#### Scenario: Hold is reached after half a second

- **WHEN** the player holds Skyward Sonnet for half a second
- **THEN** the hold's hit lands at 74 frames (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/skill.go` line 62)
- **AND** the hold ends at 116 frames (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/skill.go` line 29)

#### Scenario: Tap plays the press

- **WHEN** the player taps Skyward Sonnet
- **THEN** the press plays instead of the hold

### Requirement: Stormeye

Wind's Grand Ode SHALL place the Stormeye 5 metres ahead of where Venti faces when the burst starts (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/burst.go` line 26), and it SHALL land 20 Anemo ticks every 24 frames from 106 frames (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/burst.go` lines 60 to 64), each reaching 4 metres round the Stormeye (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/burst.go` line 41).

#### Scenario: Stormeye ticks in sequence

- **WHEN** the player casts Wind's Grand Ode
- **THEN** the Stormeye stands 5 metres ahead of Venti (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/burst.go` line 26)
- **AND** its first tick lands at 106 frames, then every 24 frames for 20 ticks in all (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/burst.go` lines 60 to 64)

#### Scenario: Ascension 4 gives energy as the Stormeye ends

- **GIVEN** Venti has Ascension 4
- **WHEN** the burst starts and the Stormeye's seconds run out (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/burst.go` lines 69 and 70)
- **THEN** Venti gains 15 energy up to the burst's cost (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/asc.go` line 13)

### Requirement: Splitting Gales from Constellation 1

From Constellation 1, a fully charged shot SHALL cast two more arrows from where Venti stands, each landing at the shot's hitmark (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/cons.go` lines 17 and 18).

#### Scenario: Two extra arrows

- **GIVEN** Venti has Constellation 1
- **WHEN** the fully charged shot is fired
- **THEN** two more arrows land at the shot's hitmark

### Requirement: Breeze of Reminiscence and Storm of Defiance

From Constellation 2, each Skyward Sonnet hit SHALL cut the Anemo RES and Physical RES of each enemy it strikes by 12% for 10 seconds (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/cons.go` lines 38 to 57), and from Constellation 6, each Stormeye tick SHALL cut it by a further 20% for 10 seconds (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/cons.go` lines 83 to 95), the two adding up.

#### Scenario: Skyward Sonnet cuts Anemo RES

- **GIVEN** Venti has Constellation 2
- **WHEN** a Skyward Sonnet hit strikes an enemy
- **THEN** that enemy's Anemo RES and Physical RES drop by 12% for 10 seconds (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/cons.go` lines 48 and 50)

#### Scenario: Two cuts add up

- **GIVEN** Venti has Constellation 6
- **WHEN** a Stormeye tick strikes an enemy hit by Skyward Sonnet
- **THEN** that enemy's Anemo RES drops by the two cuts added together (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/cons.go` lines 48 and 90)

### Requirement: Hurricane of Freedom from Constellation 4

From Constellation 4, a particle or orb the party collects while Venti is on the field SHALL give him a 25% Anemo DMG Bonus for 10 seconds (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/cons.go` lines 60 and 71), each pickup restarting it.

#### Scenario: A pickup on the field gives the bonus

- **GIVEN** Venti has Constellation 4 and is on the field
- **WHEN** the party collects a particle or orb
- **THEN** Venti's Anemo DMG Bonus rises by 25% for 10 seconds (`~/Esposter.noindex/cache/gcsim-v2.47.2/internal/characters/venti/cons.go` line 71)

#### Scenario: A pickup off the field gives nothing

- **GIVEN** Venti has Constellation 4 and is off the field
- **WHEN** the party collects a particle or orb
- **THEN** Venti's Anemo DMG Bonus is unchanged

### Requirement: Unbuilt Venti effects

Elemental Absorption, the Stormeye's pull, Constellation 2's airborne cut, Venti's other constellations and his Hexerei kit SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Venti has one of these effects unlocked
- **WHEN** the player fights with Venti
- **THEN** that effect has no effect
