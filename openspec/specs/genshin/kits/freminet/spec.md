## Purpose

Freminet's kit as built, with his four strikes, charged attack, plunges, Pressurized Floe's upward thrust and Shadowhunter's Ambush, and what is left of his Pers Time stance, Spiritbreath Thorn, stalking state and passives.

## Requirements

### Requirement: Basic attacks

Freminet's normal attacks SHALL be four strikes, a charged attack, a collision attack and two plunging attacks, each dealing physical or cryo damage as the game gives it.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Freminet is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order

### Requirement: Provisional charged attack

Freminet's charged attack SHALL be provisional, hitting a circle of radius 2.4 metres round the target at 42 frames and costing 40 stamina, until a recording of the game settles it.

#### Scenario: The charged attack hits the circle at 42 frames

- **GIVEN** Freminet has 40 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack hits a circle of radius 2.4 metres round the target at 42 frames
- **AND** 40 stamina is spent

### Requirement: Pressurized Floe upward thrust

Pressurized Floe SHALL deal an upward thrust that hits a cryo circle two metres ahead of Freminet, and it SHALL cool down before it can be pressed again.

#### Scenario: The thrust hits the circle ahead of Freminet

- **GIVEN** Freminet is the character on the field
- **WHEN** the player presses Pressurized Floe
- **THEN** the upward thrust hits a cryo circle two metres ahead of him

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Pressurized Floe was pressed and its cooldown has not ended
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Shadowhunter's Ambush burst

Shadowhunter's Ambush SHALL deal a cryo burst on the target, and it SHALL be refused without the energy it costs.

#### Scenario: The burst deals a cryo hit on the target

- **GIVEN** Freminet has enough energy
- **WHEN** the player casts Shadowhunter's Ambush
- **THEN** its cryo burst hits the target

#### Scenario: The burst is refused without enough energy

- **GIVEN** Freminet has less energy than the burst costs
- **WHEN** the player casts Shadowhunter's Ambush
- **THEN** it does not cast
