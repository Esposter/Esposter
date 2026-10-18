## Purpose

Mualani's kit as built: her three strikes, charged attack, collision and two plunges, and Boomsharka-laka's share of Max HP, and what is left of her Nightsoul Blessing, its surfing and her constellations.

## Requirements

### Requirement: Mualani's three strikes and charged attack

Mualani's three strikes SHALL each hit a circle on the target, and her charged attack SHALL land a circle one metre ahead of her at 84 frames of a 113-frame animation.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** each strike hits the circle on the target in turn

#### Scenario: Charged attack lands after its windup

- **WHEN** the player uses the charged attack from idle
- **THEN** the circle one metre ahead of Mualani is hit at 84 frames

### Requirement: Boomsharka-laka's share of Max HP

Boomsharka-laka SHALL deal damage equal to a share of Mualani's Max HP, landing at 178 frames within a 5-metre circle round the target.

#### Scenario: Skill deals Max HP damage

- **WHEN** the player casts Boomsharka-laka
- **THEN** the hit lands at 178 frames within a 5-metre circle round the target
- **AND** its damage equals a share of Mualani's Max HP

### Requirement: Skill press without the Blessing

Mualani's skill press SHALL deal no damage and SHALL go on a six-second cooldown until the Nightsoul Blessing is built.

#### Scenario: Press spends the cooldown

- **WHEN** the player presses Mualani's skill
- **THEN** no damage is dealt
- **AND** the skill goes on a six-second cooldown

### Requirement: Plunge attacks

Mualani's plunge attacks SHALL land on the enemies within a provisional reach, with no poise.

#### Scenario: Plunge lands within a provisional reach

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands on the enemies within a provisional reach

### Requirement: Nightsoul Blessing and constellations not yet built

Mualani's Nightsoul Blessing, Sharky's Bite, surfing, Ascension passives and constellations SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Mualani has the Blessing, a passive or a constellation unlocked
- **WHEN** the player fights with Mualani
- **THEN** those effects have no effect
