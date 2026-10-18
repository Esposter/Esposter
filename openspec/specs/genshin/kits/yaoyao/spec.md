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

### Requirement: Raphanus Sky Cluster's Yuegui and radishes

Yaoyao's skill SHALL spawn a Yuegui two metres ahead of her 63 frames after the cast. The Yuegui SHALL throw a White Jade Radish 29 frames after it spawns, and each radish SHALL land 13 frames after its throw.

#### Scenario: Yuegui spawns two metres ahead

- **WHEN** Yaoyao casts her skill
- **THEN** the Yuegui stands two metres ahead of her body 63 frames after the cast, and not before

#### Scenario: First radish lands

- **WHEN** the Yuegui has stood 29 frames
- **THEN** its radish lands 13 frames after the throw, and heals the active character by the skill radish's share of Yaoyao's Max HP plus its flat amount

#### Scenario: Radish heals only inside its circle

- **WHEN** the body has left the radish's two-metre circle by the time it lands
- **THEN** no healing reaches the active character

#### Scenario: Radish lands on an enemy while the active character is above 70% HP

- **WHEN** the active character stands above 70% of her Max HP and an enemy stands within 8 metres of the Yuegui
- **THEN** the radish lands on a random such enemy

#### Scenario: Radish lands on Yaoyao at or below 70% HP

- **WHEN** the active character stands at or below 70% of her Max HP
- **THEN** the radish lands at Yaoyao's own position

### Requirement: Moonjade Descent's Yuegui and whole-team radishes

Moonjade Descent SHALL spawn a Yuegui two metres behind Yaoyao at 104, 162 and 221 frames after the cast, while the burst lasts. Each of them SHALL throw its first radish 29 frames after it spawns, and that radish SHALL heal each member of the deployed team.

#### Scenario: Yuegui spawns behind her at each spawn

- **WHEN** Yaoyao casts Moonjade Descent
- **THEN** a Yuegui stands two metres behind her body at 104, 162 and 221 frames after the cast, and none before 104 frames

#### Scenario: First radish heals the whole team

- **WHEN** a burst Yuegui has stood 29 frames
- **THEN** its radish lands 13 frames after the throw and heals each member of the deployed team

#### Scenario: Swap ends the burst's Yuegui

- **WHEN** the player swaps off Yaoyao during her burst
- **THEN** the Yuegui her burst spawned throws no further radish

### Requirement: Radish heals' riders

Constellation 1 SHALL give the active character 15% Dendro DMG Bonus for eight seconds after each radish heals her. Ascension 4 SHALL heal the active character each second for five seconds after each radish heals her, by 0.8% of Yaoyao's Max HP, a newer radish heal replacing the one running.

#### Scenario: Constellation 1 gives Dendro DMG Bonus after a radish heal

- **WHEN** a radish heals the active character while Yaoyao holds Constellation 1
- **THEN** the active character gains 15% Dendro DMG Bonus for eight seconds

#### Scenario: Ascension 4 heals each second after a radish heal

- **WHEN** a radish heals the active character while Yaoyao is at Ascension 4
- **THEN** the active character is healed by 0.8% of Yaoyao's Max HP each second, for five seconds

### Requirement: Unbuilt Mega Radish, Constellations 2, 4 and 6, and passives

Yaoyao's Mega Radish, her Constellations 2, 4 and 6, her Constellation 1 stamina restore, and her Ascension 1 passive SHALL have no effect in the world yet.

#### Scenario: Yuegui throws no Mega Radish

- **WHEN** the skill's Yuegui throws its third or sixth radish
- **THEN** no Mega Radish is thrown in place of it
