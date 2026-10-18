## Purpose

Mavuika's kit as built outside her Nightsoul Blessing, and her skill's press entering the blessing with its points:

## Requirements

### Requirement: Mavuika's four strikes outside the blessing

Mavuika's four strikes SHALL land in order, hitting the enemies within reach, while she is not in her Flamestrider Blessing.

#### Scenario: Four strikes in sequence

- **GIVEN** Mavuika is not in her Flamestrider Blessing
- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

### Requirement: Mavuika's charged attack

Mavuika's charged attack SHALL need 50 stamina to start.

#### Scenario: Charged attack with enough stamina

- **GIVEN** Mavuika has at least 50 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack lands on the enemies within reach

#### Scenario: Charged attack refused without stamina

- **GIVEN** Mavuika has less than 50 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack does not start

### Requirement: Mavuika's plunge attacks

Mavuika's low, high and collision plunges SHALL land on the enemies within reach.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the low or high plunge land on the enemies within reach

### Requirement: Flamestrider press enters the blessing

Mavuika's skill press SHALL enter the Flamestrider Blessing with 80 Nightsoul points, or 120 from Constellation 1, which drain five a second, and a press while in the blessing SHALL refill them to their maximum. The press SHALL deal no hit and SHALL spend its 15-second cooldown until the Ring of Searing Radiance is built.

#### Scenario: Skill press enters the blessing and its points drain

- **WHEN** the player presses Mavuika's skill
- **THEN** Mavuika is in the Flamestrider Blessing with 80 points, or 120 from Constellation 1
- **AND** her points drop by five a second
- **AND** no hit lands
- **AND** the skill goes on a 15-second cooldown

#### Scenario: A press in the blessing refills its points

- **GIVEN** Mavuika is in the Flamestrider Blessing with fewer points than its maximum
- **WHEN** the player presses Mavuika's skill
- **THEN** her points are at their maximum

### Requirement: Sunfell Slice cannot be cast yet

Mavuika's burst Sunfell Slice SHALL NOT be castable until Fighting Spirit is built, since its cost is paid in Fighting Spirit.

#### Scenario: Burst refused without Fighting Spirit

- **WHEN** the player presses Mavuika's burst
- **THEN** Sunfell Slice is not cast

### Requirement: Nightsoul-dependent effects not yet built

Mavuika's Ring of Searing Radiance hit, the drain's pause while her burst lasts, her Flamestrider strikes, charged attack and plunges inside the blessing, and her Ascension 1 and 4 and Constellations 1, 2 and 4, SHALL NOT take effect.

#### Scenario: Blessing-dependent effects do nothing

- **GIVEN** Mavuika has an Ascension or constellation from the Nightsoul set unlocked
- **WHEN** the player fights with Mavuika
- **THEN** that effect has no effect
