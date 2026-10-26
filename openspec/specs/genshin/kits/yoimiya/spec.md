## Purpose

Yoimiya's kit as built, with Niwabi Fire-Dance's Blazing Arrows and Ryuukin Saxifrage's initial hit with Aurous Blaze and its explosion, her Constellation 1 extension and defeat ATK, her Constellation 2 Pyro CRIT bonus, her Constellation 4 cooldown cut on each explosion, and her Ascension 4 ATK share and Constellation 6 left unbuilt.

## Requirements

### Requirement: Five strikes and fully charged shot

Yoimiya's normal attack SHALL be five strikes, followed by a fully charged shot, a collision and two plunges.

#### Scenario: Normal attack lands five strikes

- **WHEN** the player strikes with Yoimiya's normal attack
- **THEN** five strikes land in order

### Requirement: Niwabi Fire-Dance stance

Yoimiya's skill SHALL put her in a stance for 10 seconds, in which her normal attacks deal Pyro damage with each hit raised by 137.9%.

#### Scenario: Stance raises the normal attacks

- **WHEN** the player uses Yoimiya's skill
- **THEN** for 10 seconds her normal attacks deal Pyro damage raised by 137.9%

#### Scenario: Leaving the field ends the stance

- **GIVEN** the stance is active
- **WHEN** Yoimiya leaves the field
- **THEN** the stance ends

#### Scenario: Charged shot and plunges unchanged

- **GIVEN** the stance is active
- **WHEN** Yoimiya fires her charged shot or plunges
- **THEN** their damage is unchanged

### Requirement: Ryuukin Saxifrage marks an enemy

Ryuukin Saxifrage's initial hit SHALL mark the first enemy it strikes with Aurous Blaze for 10 seconds.

#### Scenario: Burst marks the first enemy

- **WHEN** the player casts Ryuukin Saxifrage
- **THEN** the first enemy its initial hit strikes is marked with Aurous Blaze for 10 seconds

### Requirement: Aurous Blaze explosion

While Aurous Blaze marks an enemy, a damaging attack by another party member SHALL set off a Pyro explosion round that enemy a frame later, and no further explosion SHALL reach that enemy for 2 seconds.

#### Scenario: Attack sets off the explosion

- **GIVEN** an enemy is marked with Aurous Blaze
- **WHEN** another party member's normal attack, charged attack, plunge, skill or burst hits it
- **THEN** a Pyro explosion goes off round it a frame later

#### Scenario: Explosion within the cooldown

- **GIVEN** an explosion went off on an enemy less than 2 seconds ago
- **WHEN** another attack hits that enemy
- **THEN** no explosion goes off

#### Scenario: Reaction damage sets nothing off

- **GIVEN** an enemy is marked with Aurous Blaze
- **WHEN** a reaction's damage or a summon with no attack kind hits it
- **THEN** no explosion goes off

### Requirement: Plunge timing

Yoimiya's plunges SHALL land 0.4 seconds after they start, provisionally.

#### Scenario: Plunge landing

- **WHEN** Yoimiya plunges
- **THEN** the plunge lands 0.4 seconds after it starts

### Requirement: Constellation 2 Pyro DMG Bonus on a CRIT

From Constellation 2, a Pyro CRIT of Yoimiya's SHALL give her 25% Pyro DMG Bonus for 6 seconds, whichever character is active.

#### Scenario: A Pyro CRIT gives Pyro DMG Bonus

- **GIVEN** Yoimiya has Constellation 2
- **WHEN** her Pyro DMG scores a CRIT
- **THEN** she gains 25% Pyro DMG Bonus for 6 seconds

#### Scenario: Constellation 1 changes nothing

- **GIVEN** Yoimiya has Constellation 1
- **WHEN** her Pyro DMG scores a CRIT
- **THEN** no Pyro DMG Bonus is gained

### Requirement: Constellation 1 extends Aurous Blaze and raises ATK on a defeat

From Constellation 1, Aurous Blaze SHALL last 4 seconds longer, and defeating an enemy it marks within its duration SHALL raise Yoimiya's ATK by 20% for 20 seconds.

#### Scenario: Constellation 1 lengthens the mark

- **GIVEN** Yoimiya has Constellation 1
- **WHEN** Ryuukin Saxifrage marks an enemy with Aurous Blaze
- **THEN** the mark lasts 14 seconds

#### Scenario: A defeat within the mark raises ATK

- **GIVEN** Yoimiya has Constellation 1
- **WHEN** a hit by any party member defeats an enemy marked with Aurous Blaze
- **THEN** Yoimiya's ATK is raised by 20% for 20 seconds

#### Scenario: Constellation 0 changes nothing

- **GIVEN** Yoimiya has no constellation
- **WHEN** Ryuukin Saxifrage marks an enemy, and a hit then defeats it
- **THEN** the mark lasts 10 seconds and no ATK is raised

### Requirement: Constellation 4 cuts the skill cooldown on each explosion

From Constellation 4, each Aurous Blaze explosion SHALL cut Niwabi Fire-Dance's cooldown by 1.2 seconds, whichever member's hit sets it off.

#### Scenario: An explosion cuts the skill's cooldown

- **GIVEN** Yoimiya has Constellation 4 and Niwabi Fire-Dance's cooldown has 5 seconds left
- **WHEN** an Aurous Blaze explosion sets off
- **THEN** the cooldown has 3.8 seconds left

#### Scenario: Constellation 3 changes nothing

- **GIVEN** Yoimiya has Constellation 3
- **WHEN** an Aurous Blaze explosion sets off
- **THEN** Niwabi Fire-Dance's cooldown is unchanged

### Requirement: Unbuilt Ascension 4 passive and Constellation 6

Yoimiya's Ascension 4 passive and Constellation 6 SHALL have no effect in the world yet.

#### Scenario: Constellation 6 has no effect

- **WHEN** Yoimiya holds Constellation 6
- **THEN** no effect of that constellation is applied
