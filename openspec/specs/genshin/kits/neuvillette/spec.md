## Purpose

Neuvillette's kit as built, with his three hydro strikes, the short charged attack, his plunges, O Tears, I Shall Repay with its Spiritbreath Thorn, and O Tides, I Have Returned's first hit and two Waterfalls, and what is left of Equitable Judgment, the droplets and passives.

## Requirements

### Requirement: Neuvillette's hydro strikes and charged attack

Neuvillette's three hydro strikes SHALL land in order, and his short charged attack SHALL land on the enemies within its box.

#### Scenario: Three hydro strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order and deal Hydro damage

#### Scenario: Short charged attack lands

- **WHEN** the player uses the short charged attack
- **THEN** its hits land on the enemies within its box

### Requirement: Neuvillette's plunge attacks

Neuvillette's plunge attacks SHALL land on the enemies within reach at provisional timings.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands on the enemies within reach at a provisional timing

### Requirement: O Tears, I Shall Repay

O Tears, I Shall Repay's hit SHALL deal a share of Neuvillette's Max HP as flat damage, and its Spiritbreath Thorn SHALL land 60 frames after the skill's 42-frame animation, dealing Hydro damage on a share of his ATK.

#### Scenario: Skill deals Max HP damage

- **WHEN** the player presses O Tears, I Shall Repay
- **THEN** the hit deals damage equal to a share of Neuvillette's Max HP

#### Scenario: Thorn lands after the animation

- **WHEN** the skill's 42-frame animation ends
- **THEN** Spiritbreath Thorn lands 60 frames later as Hydro damage

### Requirement: O Tides, I Have Returned

O Tides, I Have Returned SHALL land a first hit and two Waterfalls, and the second Waterfall SHALL land after the burst's 135-frame animation, at 154 frames.

#### Scenario: Waterfalls land in sequence

- **WHEN** the player casts O Tides, I Have Returned
- **THEN** the first hit lands
- **AND** the second Waterfall lands at 154 frames

### Requirement: Unbuilt Neuvillette effects

Equitable Judgment, the droplets the skill and burst leave, Spiritbreath Thorn's aligned cooldown, and Neuvillette's ascension and constellation passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Neuvillette has Equitable Judgment, a droplet effect or a passive unlocked
- **WHEN** the player fights with Neuvillette
- **THEN** those effects have no effect
