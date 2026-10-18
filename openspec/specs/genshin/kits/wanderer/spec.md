## Purpose

Wanderer's kit as built, with his strikes, charged attack, plunges, Hanega: Song of the Wind's Windfavored state, and Kyougen: Five Ceremonial Plays, and what is left of his Dash, Jump, skydweller swap lock and passives.

## Requirements

### Requirement: Wanderer's strikes, charged attack and plunges

Wanderer's three strikes and charged attack SHALL land on the enemies within reach, and his low plunge and collision SHALL land on the enemies within reach.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach

#### Scenario: Charged attack lands

- **WHEN** the player uses the charged attack
- **THEN** its hits land on the enemies within reach

#### Scenario: Low plunge lands with its collision

- **WHEN** the player starts a low plunge
- **THEN** the collision and the low plunge land on the enemies within reach

### Requirement: Wanderer's high plunge timing

Wanderer's high plunge SHALL land at 38 frames with provisional poise, since no source gives its own timing.

#### Scenario: High plunge lands at 38 frames

- **WHEN** the player starts a high plunge
- **THEN** the high plunge lands at 38 frames on the enemies within reach

### Requirement: Hanega and Windfavored

Hanega: Song of the Wind SHALL deal an Anemo circle and set the Windfavored state on the team for ten seconds, during which Wanderer's strikes and charged attack gain the skill's bonus and his burst plays its falling animation.

#### Scenario: Skill sets Windfavored on the team

- **WHEN** the player presses Hanega: Song of the Wind
- **THEN** the Anemo circle is struck
- **AND** Windfavored is set on the team for ten seconds

#### Scenario: Strikes gain the bonus during Windfavored

- **GIVEN** Windfavored is standing
- **WHEN** Wanderer's strikes or charged attack hit
- **THEN** the hits gain the skill's bonus

### Requirement: Kyougen: Five Ceremonial Plays

Kyougen: Five Ceremonial Plays SHALL land five strikes on the target, beginning at 92 frames.

#### Scenario: Burst strikes the target five times

- **WHEN** the player casts Kyougen: Five Ceremonial Plays
- **THEN** five strikes land on the target from 92 frames

### Requirement: Unbuilt Wanderer effects

Wanderer's Dash, Jump, the skydweller swap lock, his passives and his Ascension and constellation effects SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Wanderer has a Dash, Jump, swap lock or passive effect unlocked
- **WHEN** the player fights with Wanderer
- **THEN** that effect has no effect
