## Purpose

Yae Miko's kit as built, with her Sesshou Sakura totems, Great Secret Art: Tenko Kenshin, both passives, Constellation 4's burst DMG and team Electro DMG and Constellation 6's DEF ignored, and what is left of her constellations.

## Requirements

### Requirement: Strikes and charged attack

Yae Miko's normal attack SHALL be three strikes, followed by a charged attack that strikes once, a collision and two plunges.

#### Scenario: Normal attack lands three strikes

- **WHEN** the player strikes with Yae Miko's normal attack
- **THEN** three strikes land in order

#### Scenario: Charged attack strikes once

- **WHEN** the player uses Yae Miko's charged attack
- **THEN** it strikes once

### Requirement: Sesshou Sakura totems

Yae Miko's skill SHALL cast a totem that stands for 900 frames and strikes the enemies within a radius of 0.5 metres round itself at 120 frames and then every 176 frames.

#### Scenario: Totem strikes its circle

- **WHEN** a totem is cast
- **THEN** it strikes every enemy within its circle at 120 frames and then every 176 frames

#### Scenario: Totem keeps the level of its cast

- **GIVEN** totems stand when a totem is cast
- **WHEN** the totem strikes
- **THEN** its damage takes the level its cast gives, from one to three by the totems standing then
- **AND** a later cast does not raise it

#### Scenario: Fourth totem pops the oldest

- **GIVEN** three totems stand
- **WHEN** a fourth is cast
- **THEN** the oldest totem is removed

### Requirement: Great Secret Art: Tenko Kenshin

Yae Miko's burst SHALL strike a circle of radius 7 metres at 100 frames and destroy each standing totem for a Tenko Thunderbolt.

#### Scenario: Burst strikes its circle

- **WHEN** the player casts Yae Miko's burst
- **THEN** its hit lands at 100 frames on the enemies within 7 metres

#### Scenario: Burst destroys totems

- **GIVEN** totems stand
- **WHEN** the burst is cast
- **THEN** each totem is destroyed and fires a Tenko Thunderbolt that strikes at 154 frames and then every 24 frames

### Requirement: The burst gives back a skill charge for each totem it destroys from Ascension 1

From Ascension 1, each totem Great Secret Art: Tenko Kenshin destroys SHALL reset the cooldown of one charge of Sesshou Sakura.

#### Scenario: Destroyed totems give back charges

- **GIVEN** Yae Miko has reached Ascension 1 and two totems stand while her skill's charges cool
- **WHEN** the burst is cast
- **THEN** two charges' cooldowns are taken off her skill's cooldown

### Requirement: Elemental Mastery raises the totems' DMG from Ascension 4

From Ascension 4, each totem strike SHALL deal 0.15% more DMG for each point of Yae Miko's Elemental Mastery.

#### Scenario: A totem strike scales with Elemental Mastery

- **GIVEN** Yae Miko has reached Ascension 4
- **WHEN** a totem strikes
- **THEN** its DMG Bonus is 0.15% of her Elemental Mastery

### Requirement: Constellation 4 burst DMG and team Electro DMG

From Constellation 4, Yae Miko's Elemental Burst DMG SHALL rise 100%, and each lightning a Sesshou Sakura strikes SHALL give every deployed member 20% Electro DMG Bonus for 5 seconds.

#### Scenario: Constellation 4 doubles her Elemental Burst DMG

- **GIVEN** Yae Miko has Constellation 4
- **WHEN** Great Secret Art: Tenko Kenshin's Tenko Thunderbolt strikes an enemy
- **THEN** its Elemental Burst DMG Bonus includes 100%

#### Scenario: A totem's lightning gives the team Electro DMG Bonus

- **GIVEN** Yae Miko has Constellation 4
- **WHEN** a totem's strike lands on an enemy
- **THEN** every deployed member has 20% Electro DMG Bonus for 5 seconds

#### Scenario: Constellation 3 changes nothing

- **GIVEN** Yae Miko has Constellation 3
- **WHEN** a totem's strike lands on an enemy
- **THEN** no Electro DMG Bonus is gained

### Requirement: Unbuilt constellations

Yae Miko's Constellations 1 and 2 SHALL have no effect in the world yet, and Constellation 4's 8 Energy per 5 seconds is not built.

#### Scenario: Constellation 1 or 2 has no effect

- **WHEN** Yae Miko holds Constellation 1 or 2
- **THEN** no effect of that constellation is applied

#### Scenario: Constellation 6 ignores DEF on the totems' strikes

- **GIVEN** Yae Miko has Constellation 6 unlocked
- **WHEN** a totem's strike lands on an enemy
- **THEN** 60% of the enemy's DEF is ignored for that strike
- **AND** a Tenko Thunderbolt's strike ignores none
