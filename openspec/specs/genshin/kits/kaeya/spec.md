## Purpose

Kaeya's kit as built: five strikes, a charged attack, Frostgnaw with its first-ascension heal, Glacial Waltz's thirteen icicles, Constellations 1, 2 and 4, with Frostgnaw's damage against Water, the activation knockback, and Constellation 6 not built.

## Requirements

### Requirement: Five strikes, charged attack and plunges

Kaeya's five strikes, charged attack, collision and two plunges SHALL be his normal attacks and plunges.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Kaeya is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his five strikes play in order and each deals its own hit

#### Scenario: Plunge deals its own hit

- **GIVEN** Kaeya is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its own hit

### Requirement: Frostgnaw strikes on a six-second cooldown

Frostgnaw SHALL strike enemies in reach and SHALL go on a six-second cooldown from its cast.

#### Scenario: Casting Frostgnaw strikes enemies in reach

- **GIVEN** Kaeya is the character on the field and Frostgnaw is off cooldown
- **WHEN** the player casts Frostgnaw
- **THEN** it strikes the enemies in reach
- **AND** its cooldown runs six seconds

#### Scenario: Frostgnaw cannot be cast during its cooldown

- **GIVEN** Frostgnaw is cooling down
- **WHEN** the player casts Frostgnaw again
- **THEN** nothing happens

### Requirement: Frostgnaw heals Kaeya from its first ascension

From his first ascension, each enemy Frostgnaw strikes SHALL heal Kaeya by 15% of his ATK.

#### Scenario: Each enemy struck heals Kaeya

- **GIVEN** Kaeya has his first ascension
- **WHEN** Frostgnaw strikes an enemy
- **THEN** Kaeya is healed by 15% of his ATK for that enemy

#### Scenario: No enemy struck means no heal

- **GIVEN** Kaeya has his first ascension
- **WHEN** Frostgnaw strikes no enemy
- **THEN** no heal is dealt

### Requirement: Glacial Waltz summons thirteen icicles

Glacial Waltz SHALL summon thirteen icicles that strike enemies on their ticks.

#### Scenario: Casting Glacial Waltz summons the icicles

- **GIVEN** Kaeya is the character on the field
- **WHEN** the player casts Glacial Waltz
- **THEN** thirteen icicles are summoned
- **AND** each icicle strikes enemies on its ticks

### Requirement: Constellation 1 CRIT Rate against Cryo-affected enemies

From Constellation 1, Kaeya's normal and charged attacks SHALL have 15% more CRIT Rate against an enemy under Cryo or Frozen.

#### Scenario: Constellation 1 raises CRIT Rate against a Cryo-affected enemy

- **GIVEN** Kaeya has Constellation 1
- **WHEN** his normal or charged attack strikes an enemy under Cryo or Frozen
- **THEN** that strike's CRIT Rate is 15% higher

#### Scenario: Other strikes or enemies change nothing

- **GIVEN** Kaeya has Constellation 0, or the enemy is not under Cryo or Frozen, or the strike is his skill
- **WHEN** his attack strikes that enemy
- **THEN** no CRIT Rate is added

### Requirement: Constellation 4 Cryo shield below 20% HP

From Constellation 4, a drain that takes Kaeya under 20% HP SHALL shield him for 30% of his Max HP as Cryo, for 20 seconds, once every 60 seconds.

#### Scenario: Constellation 4 shields Kaeya when a drain takes him under 20% HP

- **GIVEN** Kaeya has Constellation 4
- **WHEN** a drain takes him under 20% HP
- **THEN** he is shielded for 30% of his Max HP as Cryo for 20 seconds

#### Scenario: A drain within 60 seconds of the last shield is not shielded

- **GIVEN** a shield from Constellation 4 was made less than 60 seconds ago
- **WHEN** another drain takes him under 20% HP
- **THEN** no shield is made

#### Scenario: A drain above 20% HP or below Constellation 4 changes nothing

- **GIVEN** Kaeya has Constellation 3, or the drain leaves him at 20% HP or above
- **WHEN** the drain lands
- **THEN** no shield is made

### Requirement: Constellation 2 extends Glacial Waltz

From Constellation 2, each enemy defeated during Glacial Waltz SHALL extend it by 2.5 seconds, its whole lifetime from the cast held to 15 seconds.

#### Scenario: Each defeat extends Glacial Waltz

- **GIVEN** Kaeya has Constellation 2 and Glacial Waltz is standing
- **WHEN** an enemy is defeated during it
- **THEN** Glacial Waltz lasts 2.5 seconds longer

#### Scenario: Glacial Waltz lasts fifteen seconds at most

- **GIVEN** Kaeya has Constellation 2 and Glacial Waltz already lasts fifteen seconds in all
- **WHEN** another enemy is defeated during it
- **THEN** Glacial Waltz is not extended

#### Scenario: Below Constellation 2, or after Glacial Waltz ends, nothing changes

- **GIVEN** Kaeya has Constellation 1, or Glacial Waltz has ended
- **WHEN** an enemy is defeated
- **THEN** Glacial Waltz is not extended

### Requirement: Unbuilt Kaeya effects

Kaeya's Constellation 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Kaeya has Constellation 6
- **WHEN** the player fights with Kaeya
- **THEN** that effect has no effect
