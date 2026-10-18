## Purpose

Kaeya's kit as built: five strikes, a charged attack, Frostgnaw with its first-ascension heal, and Glacial Waltz's thirteen icicles, with Frostgnaw's damage against Water and the activation knockback not built.

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
