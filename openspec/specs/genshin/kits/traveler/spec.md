## Purpose

The Traveler's first kit as built, its Anemo hits read from the loaded multipliers, with its poise provisional and its element unset until a statue gives one.

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

The Traveler's skill SHALL last 5 seconds with one charge, and her burst SHALL be a 15-second burst costing 60 energy.

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
