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

### Requirement: Varesa's blessing and plunge chain not yet built

Varesa's Fiery Passion forms, Nightsoul points, the apex state, Volcanic Kablam, the Follow-Up Strike and Varesa's Ascension and constellation effects SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Varesa has a Nightsoul effect, the Follow-Up Strike or a constellation unlocked
- **WHEN** the player fights with Varesa
- **THEN** that effect has no effect
