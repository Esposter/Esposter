## Purpose

Yaoyao's kit as built, with her four strikes, charged attack and plunges, and Moonjade Descent's initial hit, her Yuegui and radishes from both her skill and burst, her riders, and her constellations 2, 4 and 6, and what is left to build: her Constellation 1 stamina restore and her Ascension 1 passive.

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

### Requirement: Constellations 2, 4 and 6

Constellation 2 SHALL give Yaoyao 3 energy when a radish strikes an enemy while Moonjade Descent lasts, once each 0.8 seconds. Constellation 4 SHALL give Yaoyao Elemental Mastery of 0.3% of her Max HP, up to 120, for 8.8 seconds on each skill and burst cast, a cast restarting the one running. Constellation 6 SHALL throw a Mega Radish at the target of the skill Yuegui's third and sixth radishes, healing the active character by 7.5% of Yaoyao's Max HP.

#### Scenario: Constellation 2 gives energy from a radish's strike during the burst

- **WHEN** a burst radish strikes an enemy while Moonjade Descent lasts, at Constellation 2
- **THEN** Yaoyao gains 3 energy

#### Scenario: Constellation 2 gives no energy after the burst ends

- **WHEN** a skill radish strikes an enemy after a swap has ended Moonjade Descent
- **THEN** no energy is gained

#### Scenario: Constellation 2 gives energy once each 0.8 seconds

- **WHEN** one radish strikes several enemies, or a second strike comes within 0.8 seconds of the first
- **THEN** energy is given once per 0.8 seconds

#### Scenario: Constellation 4 gives Elemental Mastery on each cast

- **WHEN** Yaoyao casts her skill or burst at Constellation 4
- **THEN** she gains Elemental Mastery of 0.3% of her Max HP, up to 120, for 8.8 seconds, the cast restarting one already running

#### Scenario: Constellation 6 throws a Mega Radish at the third and sixth throws

- **WHEN** the skill Yuegui throws its third or sixth radish at Constellation 6
- **THEN** a Mega Radish lands at the same target, healing the active character by 7.5% of Yaoyao's Max HP

### Requirement: Ascension 1's radishes while dashing or jumping

While Moonjade Descent lasts at Ascension 1, Yaoyao SHALL throw a burst radish every 0.6 seconds at a random enemy within 8 metres of her, while she dashes or jumps, and SHALL throw none while she stands or no enemy stands within 8 metres. The radish heals as a burst radish does. A swap that ends the burst SHALL end the throws.

#### Scenario: a dash or a jump throws on each 0.6-second interval

- **WHEN** Yaoyao is dashing or jumping during Moonjade Descent at Ascension 1
- **THEN** a radish is thrown at an enemy within 8 metres 36 frames after the burst's cast, and again 36 frames later

#### Scenario: standing still or with no enemy in reach throws nothing

- **WHEN** Yaoyao stands still during Moonjade Descent at Ascension 1, or the nearest enemy stands beyond 8 metres while she dashes
- **THEN** no radish is thrown

#### Scenario: a swap ends the throws with the burst

- **WHEN** a swap ends Moonjade Descent at Ascension 1
- **THEN** no radish is thrown after it

### Requirement: Constellation 1's stamina restore

At Constellation 1, each radish heal SHALL restore 15 stamina to the party's pool, once each five seconds, as gcsim's Constellation 1 does on each radish heal behind its own cooldown. A heal inside the cooldown SHALL restore nothing.

#### Scenario: a radish heal restores 15 stamina, and the next heal inside five seconds restores none

- **WHEN** a skill radish heals Yaoyao at Constellation 1 with 50 stamina in the pool, and the next heals fall 60 and 120 frames after it
- **THEN** the pool holds 65 stamina after the first heal, and still 65 after the later two

#### Scenario: a heal five seconds on restores again

- **WHEN** a radish heals Yaoyao 360 frames after the restore at Constellation 1
- **THEN** the pool gains 15 stamina again

#### Scenario: no restore without Constellation 1

- **WHEN** a radish heals Yaoyao below Constellation 1
- **THEN** the pool is unchanged
