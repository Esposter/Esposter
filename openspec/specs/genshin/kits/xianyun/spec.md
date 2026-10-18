## Purpose

Xianyun's kit as built, with her four strikes, charged attack, plunges, Skyladder's first press and Stars Gather at Dusk's hit, and what is left of Driftcloud Wave, Starwicker and her heals.

## Requirements

### Requirement: Normal attack string

Xianyun's normal attack SHALL be four strikes, with a charged attack, a collision and two plunges as her other basic moves.

#### Scenario: Normal attack lands four strikes

- **WHEN** the player strikes with Xianyun's normal attack
- **THEN** her four strikes land in order

#### Scenario: Charged attack strikes

- **WHEN** the player uses Xianyun's charged attack
- **THEN** it deals damage to the enemies within its reach

### Requirement: Skyladder's first press

Xianyun's skill SHALL press Skyladder and deal its first hit to the enemies within its reach.

#### Scenario: Skill press hits enemies

- **WHEN** the player presses Xianyun's skill
- **THEN** Skyladder's first press hits the enemies within its reach

#### Scenario: Skill press during its cooldown

- **WHEN** the player presses Xianyun's skill while its cooldown is still running
- **THEN** no press happens

### Requirement: Stars Gather at Dusk

Xianyun's burst SHALL deal Stars Gather at Dusk's hit and spend the burst's energy cost.

#### Scenario: Burst hit lands

- **WHEN** the player casts Xianyun's burst
- **THEN** Stars Gather at Dusk's hit lands on the enemies within its reach
- **AND** the burst's energy cost is spent

#### Scenario: Burst during its cooldown

- **WHEN** the player casts Xianyun's burst while its cooldown is still running
- **THEN** no burst is cast

### Requirement: Plunges during Skyladder

Xianyun's plunges SHALL remain the standard plunge while Skyladder's state stands.

#### Scenario: Plunge while Skyladder stands

- **GIVEN** Skyladder's state stands
- **WHEN** Xianyun plunges
- **THEN** the standard plunge plays

### Requirement: Constellation 1 charge

From Constellation 1, White Clouds at Dawn SHALL have one more charge than its base.

#### Scenario: Constellation 1 adds a charge

- **GIVEN** Xianyun has Constellation 1
- **WHEN** her skill's charges are read
- **THEN** it has one more charge than the base

#### Scenario: Constellation 0 adds nothing

- **GIVEN** Xianyun has no constellation
- **WHEN** her skill's charges are read
- **THEN** no charge is added

### Requirement: Unbuilt effects

Xianyun's heals, Starwicker, her passives and her Constellations 2, 4 and 6 SHALL have no effect in the world yet.

#### Scenario: Burst heals are absent

- **WHEN** Xianyun casts her burst
- **THEN** no heal reaches the party
