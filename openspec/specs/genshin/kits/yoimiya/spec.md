## Purpose

Yoimiya's kit as built, with Niwabi Fire-Dance's Blazing Arrows and Ryuukin Saxifrage's initial hit with Aurous Blaze and its explosion, and her Ascension 4 ATK share and constellations left unbuilt.

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

### Requirement: Unbuilt Ascension 4 passive and constellations

Yoimiya's Ascension 4 passive and constellations SHALL have no effect in the world yet.

#### Scenario: Constellation has no effect

- **WHEN** Yoimiya holds a constellation
- **THEN** no constellation effect is applied
