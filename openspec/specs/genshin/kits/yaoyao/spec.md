## Purpose

Yaoyao's kit as built, with her four strikes, charged attack and plunges, and Moonjade Descent's initial hit, and what is left to build: her Yuegui and its radishes, and her passives and constellations.

## Requirements

### Requirement: Strikes and charged attack

Yaoyao's normal attack SHALL be four strikes, the third of two hits, followed by a charged attack, a collision and two plunges.

#### Scenario: Normal attack lands four strikes

- **WHEN** the player strikes with Yaoyao's normal attack
- **THEN** four strikes land in order, the third landing two hits

#### Scenario: Fourth strike reach

- **WHEN** Yaoyao's fourth strike lands
- **THEN** it reaches 2.7 metres ahead of her body

### Requirement: Skill cast

Yaoyao's skill SHALL cast for 52 frames and then go on cooldown for 15 seconds.

#### Scenario: Skill casts

- **WHEN** the player presses Yaoyao's skill
- **THEN** the cast takes 52 frames

#### Scenario: Skill during its cooldown

- **WHEN** the player presses Yaoyao's skill during its 15-second cooldown
- **THEN** no cast happens

### Requirement: Moonjade Descent

Yaoyao's burst SHALL deal its initial hit on the enemies in its circle and cost 80 energy, with a 20-second cooldown.

#### Scenario: Burst initial hit

- **WHEN** the player casts Moonjade Descent with 80 energy
- **THEN** its initial hit lands on the enemies in its circle

#### Scenario: Burst during its cooldown

- **WHEN** the player casts Moonjade Descent during its 20-second cooldown
- **THEN** no burst is cast

### Requirement: Plunge timing

Yaoyao's plunges SHALL land 0.4 seconds after they start, provisionally.

#### Scenario: Plunge landing

- **WHEN** Yaoyao plunges
- **THEN** the plunge lands 0.4 seconds after it starts

### Requirement: Unbuilt Yuegui, radishes and passives

Yaoyao's Yuegui, its White Jade Radishes, their healing, and her passives and constellations SHALL have no effect in the world yet.

#### Scenario: Skill throws no radish

- **WHEN** Yaoyao casts her skill
- **THEN** no radish flies and no healing reaches the active character
