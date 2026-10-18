## Purpose

The Traveler's first kit as built, its Anemo hits read from the loaded multipliers, with its poise provisional and its element unset until a statue gives one, and the Anemo set's Constellations 2 and 6 built. Her other constellations are not built.

## Requirements

### Requirement: The Traveler's Anemo hits

The Traveler's normal attacks, charged attack and skill and burst SHALL deal Anemo damage on the enemies within reach, using the Anemo form's multipliers.

#### Scenario: Normal attack deals Anemo damage

- **WHEN** the player uses normal attack
- **THEN** the strikes deal Anemo damage on the enemies within reach

#### Scenario: Charged attack's second hit

- **WHEN** the player uses the charged attack
- **THEN** its second hit deals Anemo damage using the Anemo form's multiplier

### Requirement: The Traveler's element

The Traveler's hits SHALL deal the element of her form, which is none until a statue gives her one.

#### Scenario: Hits deal no element before a statue

- **GIVEN** no statue has given the Traveler an element
- **WHEN** a hit lands
- **THEN** the hit deals no element

### Requirement: The Traveler's skill and burst

The Traveler's skill SHALL have a 5-second cooldown and one charge, and her burst SHALL have a 15-second cooldown and cost 60 energy.

#### Scenario: Burst cast with enough energy

- **GIVEN** the Traveler has at least 60 energy
- **WHEN** the player casts the burst
- **THEN** the burst is cast

#### Scenario: Burst refused without enough energy

- **GIVEN** the Traveler has less than 60 energy
- **WHEN** the player casts the burst
- **THEN** the burst does not start

### Requirement: The Traveler's poise

The Traveler's skill and burst SHALL deal no poise damage, and her strikes, charged attack and plunge collision SHALL carry provisional poise.

#### Scenario: Skill and burst carry no poise

- **WHEN** the Traveler's skill or burst hits an enemy
- **THEN** the enemy's poise is not reduced

### Requirement: The Anemo set's Constellations 2 and 6

While the Traveler's statue is Anemo, Constellation 2 SHALL raise her Energy Recharge by 16%, and Constellation 6 SHALL lower the Anemo RES of an enemy her burst strikes by 20% for 10 seconds. Both SHALL apply to the Traveler only.

#### Scenario: Constellation 2 raises Energy Recharge

- **GIVEN** the Traveler has Constellation 2 with an Anemo statue
- **THEN** her Energy Recharge is raised by 16%

#### Scenario: Constellation 6 lowers Anemo RES on the burst's enemies

- **GIVEN** the Traveler has Constellation 6 with an Anemo statue
- **WHEN** her burst strikes an enemy
- **THEN** that enemy's Anemo RES is lowered by 20% for 10 seconds

#### Scenario: Another element, another character or a lower constellation changes nothing

- **GIVEN** the statue is not Anemo, or the character is not the Traveler, or she has fewer constellations than the one named
- **THEN** no Anemo constellation effect applies

### Requirement: Unbuilt Traveler effects

The Anemo set's Constellations 1 and 4, the Anemo set's Constellation 6 clause on the absorbed element, and the other sets' constellations SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** the Traveler has an unbuilt constellation of any set
- **WHEN** the player fights with her
- **THEN** that effect has no effect
