## Purpose

Freminet's kit as built, with his four strikes, charged attack, plunges, Pressurized Floe's upward thrust, Spiritbreath Thorn, Shadowhunter's Ambush and Constellations 4 and 6, and what is left of his Pers Time stance, stalking state, ascension passives and Constellations 1 and 2.

## Requirements

### Requirement: Basic attacks

Freminet's normal attacks SHALL be four strikes, a charged attack, a collision attack and two plunging attacks, each dealing physical or cryo damage as the game gives it.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Freminet is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order

### Requirement: Provisional charged attack

Freminet's charged attack SHALL be provisional, hitting a circle of radius 2.4 metres half a metre ahead of him at 42 frames and costing 40 stamina, until a recording of the game settles it.

#### Scenario: The charged attack hits the circle at 42 frames

- **GIVEN** Freminet has 40 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack hits a circle of radius 2.4 metres half a metre ahead of him at 42 frames
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

### Requirement: Fourth and sixth constellations stack on his reactions

From constellation 4, a Shatter, Frozen, Superconduct or Stellar-Conduct that Freminet's own attack triggers SHALL give him a stack of 9% ATK, up to two, for six seconds, and from constellation 6 each such trigger SHALL also give a stack of 12% CRIT DMG, up to three, for six seconds. A trigger within 18 frames of the last one SHALL give no stack.

#### Scenario: A reaction at constellation 4 gives an ATK stack

- **GIVEN** Freminet is at constellation 4
- **WHEN** his attack triggers a Shatter
- **THEN** he gains 9% ATK for six seconds

#### Scenario: A second reaction at constellation 4 gives a second stack

- **GIVEN** Freminet is at constellation 4 and holds one ATK stack
- **WHEN** his attack triggers a Frozen more than 18 frames after the last
- **THEN** his ATK bonus is 18% for six seconds

#### Scenario: A reaction at constellation 6 also gives a CRIT DMG stack

- **GIVEN** Freminet is at constellation 6
- **WHEN** his attack triggers a Superconduct
- **THEN** he gains 12% CRIT DMG for six seconds, with the 9% ATK stack

#### Scenario: A reaction within 18 frames of the last gives nothing

- **GIVEN** Freminet is at constellation 4 and a reaction gave him a stack less than 18 frames ago
- **WHEN** his attack triggers another reaction
- **THEN** no stack is gained

#### Scenario: A reaction below constellation 4 changes nothing

- **GIVEN** Freminet is at constellation 3
- **WHEN** his attack triggers a Shatter
- **THEN** he gains no ATK
