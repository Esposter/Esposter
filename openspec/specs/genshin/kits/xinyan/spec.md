## Purpose

Xinyan's kit as built, with Sweeping Fervor's shield that steps up by the enemies it strikes and Riff Revolution's DoT hits, and what is left of her constellations.

## Requirements

### Requirement: Blunt strikes and charged attack

Xinyan's normal attack SHALL be four blunt strikes, followed by a two-hit charged attack, a collision and two plunges.

#### Scenario: Normal attack lands four blunt strikes

- **WHEN** the player strikes with Xinyan's normal attack
- **THEN** four blunt strikes land in order

#### Scenario: Charged attack lands two hits

- **WHEN** the player uses Xinyan's charged attack
- **THEN** it lands two hits

### Requirement: Sweeping Fervor shield

Xinyan's skill SHALL set a shield at its press when none stands, and the shield SHALL step up to Lead-In at two enemies struck and to Rave at three.

#### Scenario: Press sets the shield

- **WHEN** the player presses Xinyan's skill with no shield standing
- **THEN** a shield is set

#### Scenario: Hit steps the shield up

- **WHEN** Sweeping Fervor's hit strikes two enemies
- **THEN** the shield steps up to Lead-In
- **AND** when it strikes three enemies the shield reaches Rave

#### Scenario: Breaking the shield ends its level

- **WHEN** the shield breaks
- **THEN** its level goes with it

#### Scenario: Ascension 1 lowers each threshold

- **GIVEN** Xinyan is at Ascension 1
- **WHEN** Sweeping Fervor's hit strikes enemies
- **THEN** each level is reached one enemy sooner

### Requirement: Rave's Pyro DoT

While the shield stands at Rave, Xinyan's Pyro DoT SHALL strike every 2 seconds.

#### Scenario: DoT ticks at Rave

- **GIVEN** the shield stands at Rave
- **WHEN** 2 seconds pass
- **THEN** the Pyro DoT strikes again

### Requirement: Riff Revolution

Xinyan's burst SHALL deal a Physical hit and then seven Pyro DoT hits.

#### Scenario: Burst hits and DoT

- **WHEN** the player casts Xinyan's burst
- **THEN** its Physical hit lands
- **AND** seven Pyro hits follow over time

### Requirement: Ascension and constellation scope

Xinyan's Ascension 1, Ascension 4 and her Constellations 2 and 4 SHALL take effect, while her Constellations 1 and 6 SHALL have no effect yet.

#### Scenario: Constellation 1 has no effect

- **WHEN** Xinyan holds Constellation 1
- **THEN** no Constellation 1 effect is applied

#### Scenario: Ascension 4 raises the shielded team's Physical DMG

- **GIVEN** Xinyan has reached Ascension 4
- **WHEN** Sweeping Fervor sets her shield
- **THEN** every deployed member deals 15% more Physical DMG while the shield stands
- **AND** the bonus ends as the shield breaks
