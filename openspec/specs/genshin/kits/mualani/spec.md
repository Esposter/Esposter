## Purpose

Mualani's kit as built: her three strikes, charged attack, collision and two plunges, and Boomsharka-laka's share of Max HP. Her skill's press enters her Nightsoul Blessing with its points, while Sharky's Bite, its surfing and her constellations are not built.

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

### Requirement: Skill press with no hit

Mualani's skill press SHALL deal no damage and SHALL go on a six-second cooldown until Sharky's Bite is built.

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

Mualani's Sharky's Bite, its surfing, Ascension 1 and her constellations SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Mualani has the Blessing, Ascension 1 or a constellation unlocked
- **WHEN** the player fights with Mualani
- **THEN** those effects have no effect

### Requirement: Ascension 4 spends Wavechaser's Exploits on her burst

From Ascension 4, each Nightsoul Burst a party member triggers SHALL stack Wavechaser's Exploits on Mualani, up to three, and her burst SHALL spend the stacks it casts with, adding 0.15 of her Max HP to Boomsharka-laka's damage for each.

#### Scenario: A fourth stack is not kept

- **GIVEN** Mualani holds three stacks at Ascension 4
- **WHEN** a party member triggers a Nightsoul Burst
- **THEN** she still holds three stacks

#### Scenario: A burst after the cast keeps its stacks for the next burst

- **GIVEN** Mualani casts her burst with two stacks
- **WHEN** a party member triggers a Nightsoul Burst before the hit lands
- **THEN** the hit adds 0.30 of her Max HP, and the new stack waits for her next burst

### Requirement: Skill press enters the Nightsoul Blessing

Mualani's skill press SHALL enter her Nightsoul Blessing with 60 Nightsoul points, which drain ten a second, when she is not in it, and SHALL leave the blessing when she is.

#### Scenario: Press enters the blessing and its points drain

- **WHEN** the player presses Mualani's skill outside the blessing
- **THEN** Mualani is in the Nightsoul Blessing with 60 points
- **AND** her points drop by ten a second

#### Scenario: A press in the blessing leaves it

- **GIVEN** Mualani is in the Nightsoul Blessing
- **WHEN** the player presses Mualani's skill
- **THEN** she is no longer in the blessing
