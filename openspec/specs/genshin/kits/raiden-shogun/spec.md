## Purpose

Raiden Shogun's kit as built: five strikes, a charged attack, the Eye of Stormy Judgment with its coordinated attacks and Musou Shinsetsu with the Musou Isshin stance, with Resolve's gains from bursts and particles, and her Constellation 2 left unbuilt.

## Requirements

### Requirement: Raiden Shogun's strikes, charged attack and plunges

Raiden Shogun's five strikes, charged attack and collision and two plunges SHALL land on the enemies within reach, dealing no poise damage, provisionally.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach

### Requirement: Eye of Stormy Judgment

Eye of Stormy Judgment SHALL summon an Eye that reaches every member of the deployed team, so that a member who deals damage while the Eye stands sets off a coordinated attack on the enemy struck, at most once every 0.9 seconds.

#### Scenario: Coordinated attack on a hit

- **GIVEN** the Eye of Stormy Judgment stands and a deployed member is attacking
- **WHEN** that member deals damage to an enemy
- **THEN** a coordinated attack lands on that enemy
- **AND** the next coordinated attack waits 0.9 seconds

#### Scenario: Skill hit lands from the summon

- **WHEN** the player presses Eye of Stormy Judgment
- **THEN** its hit lands 51 frames after the summon is placed at her body

### Requirement: Resolve from bursts and particles

When another member casts a burst, Raiden Shogun SHALL gain Resolve stacks per point of that burst's energy cost, up to 60, and each of her Musou attacks SHALL spend Resolve as it is cast.

#### Scenario: Another burst grants Resolve

- **WHEN** a different party member casts a burst
- **THEN** Raiden Shogun gains Resolve stacks for that burst's energy cost, up to 60

#### Scenario: Musou attack spends Resolve

- **GIVEN** Raiden Shogun holds Resolve
- **WHEN** the player casts Musou Shinsetsu
- **THEN** the Resolve stacks are spent as it is cast

### Requirement: Musou Isshin stance and its energy

Musou Shinsetsu SHALL start the Musou Isshin stance, whose Electro strikes and two-hit charged attack SHALL restore the whole team's energy once a second, five times per cast, and leaving the field SHALL end the stance.

#### Scenario: Stance restores team energy

- **GIVEN** the Musou Isshin stance is standing
- **WHEN** an Electro strike or charged attack hits
- **THEN** the whole team's energy is restored once a second, five times per cast

#### Scenario: Swap ends the stance

- **GIVEN** the Musou Isshin stance is standing
- **WHEN** Raiden Shogun leaves the field
- **THEN** the stance ends

### Requirement: Eye's bonus on her own burst

While the Eye stands, Raiden Shogun's own burst hits SHALL gain the Eye's Elemental Burst DMG Bonus, read as the burst is cast.

#### Scenario: Eye raises her burst

- **GIVEN** the Eye of Stormy Judgment stands
- **WHEN** Raiden Shogun casts her burst
- **THEN** her burst hits gain the Eye's Elemental Burst DMG Bonus

### Requirement: Constellations and Ascensions

Raiden Shogun's Ascension 1 and 4, Constellations 1, 4 and 6 SHALL take effect, and her Constellation 2 SHALL NOT take effect.

#### Scenario: Built constellations apply

- **GIVEN** Raiden Shogun has Constellation 1, 4 or 6 unlocked
- **WHEN** the player fights with Raiden Shogun
- **THEN** that constellation's effect applies

#### Scenario: Constellation 2 does nothing

- **GIVEN** Raiden Shogun has Constellation 2 unlocked
- **WHEN** the player fights with Raiden Shogun
- **THEN** no DEF ignored effect applies

### Requirement: Unbuilt Raiden Shogun effects

The Eye's bonus to another member's burst, the Musou Isshin plunges and her skill's particles SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** another member casts a burst while the Eye stands
- **WHEN** that burst hits
- **THEN** the Eye's bonus does not apply to it
