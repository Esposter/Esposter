## Purpose

Varesa's kit as built outside her Nightsoul Blessing: her three strikes, charged attack, Rush, Flying Kick and low, high and collision plunges. Her Fiery Passion forms, Nightsoul points, apex state and Follow-Up Strike wait on the Nightsoul hook.

## Requirements

### Requirement: Varesa's strikes and charged attack outside the blessing

Varesa's three strikes SHALL land in order, and her charged attack SHALL need 50 stamina to start, both outside her Nightsoul Blessing.

#### Scenario: Three strikes in sequence

- **GIVEN** Varesa is not in her Nightsoul Blessing
- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach

#### Scenario: Charged attack refused without stamina

- **GIVEN** Varesa has less than 50 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack does not start

### Requirement: Rush with two charges

Varesa's skill Rush SHALL hold two charges and SHALL go on a 9-second cooldown as each charge is spent.

#### Scenario: Rush with a charge

- **GIVEN** Varesa holds a charge of Rush
- **WHEN** the player presses Rush
- **THEN** Rush is used and a charge is spent

#### Scenario: Rush refused with no charge

- **GIVEN** Varesa holds no charge of Rush
- **WHEN** the player presses Rush
- **THEN** the press is not used

### Requirement: Flying Kick

Flying Kick SHALL be Varesa's burst, costing 70 energy and going on an 18-second cooldown when cast.

#### Scenario: Flying Kick with enough energy

- **GIVEN** Varesa has at least 70 energy
- **WHEN** the player casts Flying Kick
- **THEN** Flying Kick is cast
- **AND** the burst goes on an 18-second cooldown

#### Scenario: Flying Kick refused without enough energy

- **GIVEN** Varesa has less than 70 energy
- **WHEN** the player casts Flying Kick
- **THEN** the burst does not start

### Requirement: Airborne plunges

Varesa's high plunge SHALL land at 38 frames of a 77-frame animation, her low plunge at 37 frames of a 75-frame animation, and her collision at 31 frames.

#### Scenario: High plunge lands at 38 frames

- **WHEN** the player starts a high plunge
- **THEN** the high plunge lands at 38 frames of its 77-frame animation

#### Scenario: Low plunge lands at 37 frames

- **WHEN** the player starts a low plunge
- **THEN** the low plunge lands at 37 frames of its 75-frame animation

### Requirement: Nightsoul points and the timed Blessing

Varesa's skill's press SHALL gain 20 Nightsoul points, up to 40. Her high and low plunges SHALL each gain 25, and her burst SHALL fill them to 40. Full points outside the Blessing SHALL enter it for 15 seconds with those points.

#### Scenario: The skill's press gains 20 points, up to 40

- **GIVEN** Varesa holds no Nightsoul points
- **WHEN** the player presses Rush twice and then a third time
- **THEN** she holds 20 points after the first press and 40 after the second, and the third press leaves her at 40

#### Scenario: A plunge gains 25 points, and filling them enters the Blessing for 15 seconds

- **GIVEN** Varesa holds no Nightsoul points and is out of the Blessing
- **WHEN** she performs a high plunge and then a low plunge
- **THEN** the Blessing is entered with 40 points after the low plunge
- **AND** the Blessing ends 15 seconds later

#### Scenario: The burst fills her points to 40 and enters the Blessing

- **GIVEN** Varesa is out of the Blessing with no points
- **WHEN** the player casts Flying Kick
- **THEN** she holds 40 points and is in the Blessing

### Requirement: Varesa's Fiery Passion forms, apex state and follow-up not yet built

Varesa's Fiery Passion forms, the apex state, Volcanic Kablam, the Follow-Up Strike and her Ascension and constellation effects SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Varesa has the apex state, the Follow-Up Strike or a constellation unlocked
- **WHEN** the player fights with Varesa
- **THEN** that effect has no effect
