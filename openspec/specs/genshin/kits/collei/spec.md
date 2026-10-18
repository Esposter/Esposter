## Purpose

Collei's kit as built: her four strikes, fully charged shot, collision and two plunges, Floral Brush's two hits, and Trump-Card Kitty's explosion and leap field, with Constellation 1's Energy Recharge off the field built, and her other passives and constellations 2 and 6 left unbuilt.

## Requirements

### Requirement: Basic attacks

Collei's normal attacks SHALL be four strikes, a fully charged shot, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Collei is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four strikes play in order

#### Scenario: Fully charged shot fires an arrow

- **GIVEN** Collei is the character on the field
- **WHEN** the player holds the attack button until the shot is fully charged
- **THEN** the fully charged shot fires an arrow

### Requirement: Floral Brush

Floral Brush SHALL deal two hits and SHALL cool down before it can be pressed again.

#### Scenario: Floral Brush deals two hits

- **GIVEN** Collei is the character on the field
- **WHEN** the player presses Floral Brush
- **THEN** it deals two hits

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Floral Brush was pressed and its cooldown has not ended
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Trump-Card Kitty explosion and leap

Trump-Card Kitty SHALL explode when it is cast, then leap, and each leap tick SHALL land a circle of radius 4 metres around the spot where the kitty was cast, first at 68 frames and then every 30 frames.

#### Scenario: The leap ticks around the cast spot

- **GIVEN** Trump-Card Kitty was cast
- **WHEN** its leap ticks land
- **THEN** each tick hits the enemies inside a circle of radius 4 metres around the cast spot

#### Scenario: A cast during the cooldown does nothing

- **GIVEN** Trump-Card Kitty was cast and its cooldown has not ended
- **WHEN** the player casts it again
- **THEN** it does not cast

### Requirement: Leap length

The Trump-Card Kitty leap SHALL run 378 frames from its explosion, a provisional length until a recording settles it against the table's six-second duration.

#### Scenario: The leap ends after 378 frames

- **GIVEN** the Trump-Card Kitty leap is running
- **WHEN** 378 frames pass from its explosion
- **THEN** no further leap ticks land

### Requirement: Leap ticks use the team's buffs

Each leap tick SHALL deal damage using the stats and team buffs present when that tick lands.

#### Scenario: A tick reads the buffs active at its landing

- **GIVEN** the leap is running and a team buff is active
- **WHEN** a leap tick lands
- **THEN** the tick's damage includes that buff

### Requirement: No poise from arrows, Floral Brush and Trump-Card Kitty

Collei's arrows, Floral Brush and Trump-Card Kitty SHALL deal no poise.

#### Scenario: An arrow deals no poise

- **GIVEN** Collei is the character on the field
- **WHEN** one of her arrows hits an enemy
- **THEN** the enemy takes no poise damage

### Requirement: Fourth constellation raises the other members' Elemental Mastery from Trump-Card Kitty

From her fourth constellation, Trump-Card Kitty SHALL raise the Elemental Mastery of each other deployed member by 60 for 12 seconds.

#### Scenario: Trump-Card Kitty raises the other members from the fourth constellation

- **GIVEN** Collei has four constellations and a teammate is deployed
- **WHEN** the player casts Trump-Card Kitty
- **THEN** the teammate gains 60 Elemental Mastery for 12 seconds
- **AND** Collei gains none

#### Scenario: Below the fourth constellation Trump-Card Kitty raises no Elemental Mastery

- **GIVEN** Collei has three constellations and a teammate is deployed
- **WHEN** the player casts Trump-Card Kitty
- **THEN** no member gains Elemental Mastery from it

### Requirement: Constellation 1 gives Energy Recharge off the field

From Constellation 1, Collei SHALL gain 20% Energy Recharge while she is not the character on the field.

#### Scenario: Off the field

- **GIVEN** Collei has Constellation 1 and is deployed off the field
- **WHEN** her passive bonuses are read
- **THEN** she gains 20% Energy Recharge

#### Scenario: On the field

- **GIVEN** Collei has Constellation 1 and is the character on the field
- **WHEN** her passive bonuses are read
- **THEN** she gains no Energy Recharge from it

#### Scenario: Constellation 0

- **GIVEN** Collei has no constellation
- **WHEN** her passive bonuses are read off the field
- **THEN** she gains no Energy Recharge from it
