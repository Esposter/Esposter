## Purpose

Skirk's kit as built, with her five strikes, charged attack and plunges, Seven-Phase Flash's stance and its strikes, and what is left of Serpent's Subtlety, Void Rifts, Havoc: Ruin's gate and Ascension and Constellations.

## Requirements

### Requirement: Skirk's strikes, charged attack and plunges

Skirk's five strikes SHALL land in order, her charged attack of two hits SHALL need 20 stamina to start, and her plunges SHALL land on the enemies within reach at borrowed, provisional timings.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach

#### Scenario: Charged attack refused without stamina

- **GIVEN** Skirk has less than 20 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack does not start

#### Scenario: Plunge lands at a provisional timing

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands on the enemies within reach at a provisional timing

### Requirement: Seven-Phase Flash stance

Seven-Phase Flash's press SHALL start a stance 19 frames later that lasts 754 frames, in which Skirk's normal attacks are five Cryo strikes and her charged attack is three Cryo slashes.

#### Scenario: Stance starts after the press

- **WHEN** the player presses Seven-Phase Flash
- **THEN** the stance begins 19 frames later and lasts 754 frames

#### Scenario: Stance strikes replace the normal attacks

- **GIVEN** the Seven-Phase Flash stance is standing
- **WHEN** the player uses normal attack
- **THEN** the stance's five Cryo strikes land

### Requirement: Skill cooldown runs from the stance

Seven-Phase Flash's cooldown SHALL run from the press through the stance's full length and then 8 seconds, and a swap SHALL end the stance at once without moving that cooldown.

#### Scenario: Skill is unavailable during the stance

- **GIVEN** the Seven-Phase Flash stance is standing
- **WHEN** the player presses the skill
- **THEN** the press is not used

#### Scenario: Swap ends the stance early

- **GIVEN** the Seven-Phase Flash stance is standing
- **WHEN** Skirk leaves the field
- **THEN** the stance ends at once
- **AND** the skill's cooldown is not moved

### Requirement: Havoc: Ruin

Havoc: Ruin SHALL land five slashes at 109, 111, 114, 125 and 135 frames and a final slash at 158 frames, and SHALL be castable on its 15-second cooldown alone, without the Serpent's Subtlety point gate.

#### Scenario: Ruin lands its slashes

- **WHEN** the player casts Havoc: Ruin
- **THEN** the five slashes land at 109, 111, 114, 125 and 135 frames
- **AND** the final slash lands at 158 frames

#### Scenario: Ruin castable without the point gate

- **GIVEN** the burst's 15-second cooldown has run out
- **WHEN** the player casts Havoc: Ruin
- **THEN** Ruin is cast without any Serpent's Subtlety points

### Requirement: Havoc: Extinction in the stance

Havoc: Extinction, played in place of Ruin while the stance stands, SHALL land no hit and SHALL animate for 41 frames.

#### Scenario: Extinction deals no hit

- **GIVEN** the Seven-Phase Flash stance is standing
- **WHEN** the player casts the burst
- **THEN** Havoc: Extinction animates for 41 frames
- **AND** no hit lands

### Requirement: Unbuilt Skirk effects

Serpent's Subtlety, Void Rifts, the skill's hold, Havoc: Extinction's damage bonus, the stance's plunges, Constellations 1, 2, 4 and 6, Ascension 1 and 4 and the talent passive SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Skirk has one of these effects unlocked
- **WHEN** the player fights with Skirk
- **THEN** that effect has no effect
