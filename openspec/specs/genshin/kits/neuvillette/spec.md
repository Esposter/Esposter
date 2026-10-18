## Purpose

Neuvillette's kit as built, with his three hydro strikes, Equitable Judgment, his plunges, O Tears, I Shall Repay with its Spiritbreath Thorn, O Tides, I Have Returned's first hit and two Waterfalls, and the burst's droplets, with what is left of his passives and constellations.

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

### Requirement: Equitable Judgment

Neuvillette's charged attack SHALL be Equitable Judgment, held: its legal evaluation picks up to three Sourcewater Droplets in its pick-up area, its eight waves land from the end of that evaluation, its HP drains and each droplet's heal are queued as it runs, and it spends no stamina.

#### Scenario: A charge picks up droplets and lasts less

- **GIVEN** three Sourcewater Droplets lie in Neuvillette's pick-up area
- **WHEN** the player holds a charged attack
- **THEN** the charge lasts 227 frames
- **AND** its waves land 6, 28, 53, 78, 103, 128, 153 and 173 frames after its legal evaluation ends

#### Scenario: The burst leaves its droplets

- **WHEN** the player casts O Tides, I Have Returned
- **THEN** three, two and one Sourcewater Droplets are left at 95, 135 and 154 frames, each within its range of its offset from the player

### Requirement: Unbuilt Neuvillette effects

Spiritbreath Thorn's aligned cooldown, and Neuvillette's Ascension 1 passive and constellations SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Neuvillette has his Ascension 1 passive unlocked, or a constellation
- **WHEN** the player fights with Neuvillette
- **THEN** those effects have no effect
