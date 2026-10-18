## Purpose

Lan Yan's kit as built, with her four strikes, charged attack, plunges and burst's three hits and Constellation 4, and what is left waiting on the stance and the element-absorbing shield.

## Requirements

### Requirement: Lan Yan's strikes and charged attack

Lan Yan's four strikes SHALL land in order, and her charged attack SHALL land three Anemo hits on the enemies within reach.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack hits three times

- **WHEN** the player uses the charged attack
- **THEN** three Anemo hits land on the enemies within reach

### Requirement: Lan Yan's plunge attacks

Lan Yan's plunge attacks SHALL land a collision and two plunges, each at its own timing, on the enemies within reach.

#### Scenario: Plunge lands at its own timing

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunges land at their own timings on the enemies within reach

### Requirement: Lan Yan's burst

Lan Yan's elemental burst SHALL cost 60 energy and SHALL land three Anemo hits on the primary target.

#### Scenario: Burst with enough energy

- **GIVEN** Lan Yan has at least 60 energy
- **WHEN** the player casts the elemental burst
- **THEN** three Anemo hits land on the primary target

#### Scenario: Burst refused without enough energy

- **GIVEN** Lan Yan has less than 60 energy
- **WHEN** the player casts the elemental burst
- **THEN** the burst does not start

### Requirement: Swallow-Wisp Pinion Dance press

Lan Yan's Swallow-Wisp Pinion Dance press SHALL deal no damage and SHALL spend a 16-second cooldown.

#### Scenario: Press spends the cooldown

- **WHEN** the player presses Swallow-Wisp Pinion Dance
- **THEN** no damage is dealt
- **AND** the skill goes on a 16-second cooldown

### Requirement: Constellation 4 Elemental Mastery

From Constellation 4, Lan Yan's burst SHALL give each deployed team member 60 Elemental Mastery for 12 seconds, and a second burst SHALL restart that duration.

#### Scenario: Burst gives the team Elemental Mastery

- **GIVEN** Lan Yan has Constellation 4
- **WHEN** the player casts her burst
- **THEN** each deployed team member gains 60 Elemental Mastery for 12 seconds

#### Scenario: Second burst restarts the bonus

- **GIVEN** the Elemental Mastery bonus is standing
- **WHEN** the player casts her burst again
- **THEN** the bonus restarts at 12 seconds

### Requirement: Lan Yan's stance and shield not yet built

Lan Yan's Feathermoon Rings, her element-absorbing shield and her Ascension and constellations 1, 2 and 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Lan Yan has the rings, shield or those constellations unlocked
- **WHEN** the player fights with Lan Yan
- **THEN** those effects have no effect
