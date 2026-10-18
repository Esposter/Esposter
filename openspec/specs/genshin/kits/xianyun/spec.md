## Purpose

Xianyun's kit as built, with her four strikes, charged attack, plunges, Skyladder and its presses, Driftcloud Wave, Stars Gather at Dusk's hit and Constellations 1, 2, 4 and 6, and what is left of Starwicker and her burst's heals.

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

### Requirement: Driftcloud Wave

While Skyladder's state stands, Xianyun's plunge SHALL play Driftcloud Wave's leap in place of the standard plunge, the leap for the presses made in the state, and the state SHALL end with it.

#### Scenario: Plunge in the state plays the leap for its presses

- **GIVEN** Skyladder's state stands after two presses
- **WHEN** Xianyun plunges
- **THEN** Driftcloud Wave's second leap plays in place of the standard plunge
- **AND** Skyladder's state ends

#### Scenario: Plunge outside the state

- **GIVEN** Skyladder's state has ended
- **WHEN** Xianyun plunges
- **THEN** the standard plunge plays

### Requirement: Skyladder's presses in one state

Xianyun's skill SHALL press Skyladder up to three times in one state, a chained press playing the follow-up of the press before it and starting no cooldown, and each press SHALL set the state for its own length.

#### Scenario: Chained press counts up

- **GIVEN** Xianyun has pressed Skyladder once
- **WHEN** the player presses her skill again inside the state's window
- **THEN** the second press plays, and the state counts two presses

#### Scenario: A third press ends the chain

- **GIVEN** Xianyun has pressed Skyladder three times in one state
- **WHEN** the player presses her skill again
- **THEN** a new Skyladder chain starts, under its cooldown

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

### Requirement: Constellation 2 ATK buff

From Constellation 2, each White Clouds at Dawn press SHALL give Xianyun 20% ATK for 15 seconds, and a later press SHALL restart that buff rather than stack a second one.

#### Scenario: Constellation 2 press gives the buff

- **GIVEN** Xianyun has Constellation 2
- **WHEN** the player presses her skill
- **THEN** she gains 20% ATK for 15 seconds

#### Scenario: Constellation 1 press gives no ATK

- **GIVEN** Xianyun has Constellation 1
- **WHEN** the player presses her skill
- **THEN** she gains no ATK

#### Scenario: A second press restarts the buff

- **GIVEN** a press's buff stands with 10 seconds left
- **WHEN** the player presses her skill again
- **THEN** the buff runs 15 seconds again, and only one buff stands

### Requirement: Constellation 4 heal

From Constellation 4, each Driftcloud Wave hit SHALL heal the active character by a share of Xianyun's ATK, 50%, 80% or 150% for one, two or three presses in the state, and no second heal SHALL come within 5 seconds of the first.

#### Scenario: Driftcloud Wave heals once in five seconds

- **GIVEN** Xianyun has Constellation 4 and her Driftcloud Wave hits after one press
- **WHEN** the hit lands
- **THEN** the active character heals by half of Xianyun's ATK
- **AND** a second hit within 5 seconds heals nothing

### Requirement: Constellation 6 presses and CRIT DMG

From Constellation 6, a burst SHALL give eight presses of Skyladder that cost no cooldown for 16 seconds, each press spending one, and a press SHALL start whatever its cooldown is while they last. A Driftcloud Wave hit SHALL gain 15%, 35% or 70% CRIT DMG for one, two or three presses in the state.

#### Scenario: Burst gives eight presses

- **GIVEN** Xianyun has Constellation 6
- **WHEN** she casts her burst
- **THEN** eight presses of Skyladder that cost no cooldown stand for 16 seconds

#### Scenario: A press on its cooldown starts while the presses last

- **GIVEN** Xianyun has Constellation 6, a press's cooldown runs, and presses that cost no cooldown stand
- **WHEN** the player presses her skill
- **THEN** the press starts, and one of the presses is spent

### Requirement: Unbuilt effects

Xianyun's burst heals, Starwicker, her airborne buff and her passives SHALL have no effect in the world yet.

#### Scenario: Burst heals are absent

- **WHEN** Xianyun casts her burst
- **THEN** no heal reaches the party
