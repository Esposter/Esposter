## Purpose

Escoffier's kit as built: her three normal attacks, charged attack, low, high and collision plunges, Low-Temperature Cooking with its Frosty Parfait ticks and Surging Blade, Scoring Cuts with its heal, and Rehab Diet from Ascension 1. Her Cryo RES shred and her constellations wait on their hooks.

## Requirements

### Requirement: Basic attacks

Escoffier's normal attacks SHALL be three strikes, a charged attack costing 25 stamina, a low plunge, a high plunge and a collision attack.

#### Scenario: Strike chain plays three strikes in order

- **GIVEN** Escoffier is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three strikes play in order

### Requirement: Airborne plunge timings

Escoffier's plunges SHALL play as airborne moves, the low plunge landing at 41 frames of a 76-frame animation, the high plunge at 43 frames of 77, and the collision attack at 35 frames.

#### Scenario: The low plunge lands at 41 frames

- **GIVEN** Escoffier is in the air
- **WHEN** the player plunges low
- **THEN** the plunge lands at 41 frames of its 76-frame animation

### Requirement: No poise from strikes, charged attack and collision

Escoffier's normal attacks, charged attack and collision attack SHALL deal no poise.

#### Scenario: A normal attack deals no poise

- **GIVEN** Escoffier is the character on the field
- **WHEN** one of her normal attacks hits an enemy
- **THEN** the enemy takes no poise damage

### Requirement: Low-Temperature Cooking and Frosty Parfait

Low-Temperature Cooking SHALL summon Frosty Parfait, whose 21 ticks strike the primary target 5 frames after each tick, and it SHALL cool for 15 seconds before it can be pressed again.

#### Scenario: The Frosty Parfait ticks strike the primary target

- **GIVEN** Escoffier is the character on the field
- **WHEN** the player presses Low-Temperature Cooking
- **THEN** Frosty Parfait's 21 ticks strike the primary target, each 5 frames after its tick

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Low-Temperature Cooking was pressed less than 15 seconds ago
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Surging Blade interval

Low-Temperature Cooking SHALL queue Surging Blade at 83 frames only when its 10-second interval is not running at the press.

#### Scenario: Surging Blade is queued when the interval is clear

- **GIVEN** the Surging Blade interval is not running
- **WHEN** the player presses Low-Temperature Cooking
- **THEN** Surging Blade is queued to strike at 83 frames and the interval starts

#### Scenario: Surging Blade is not queued during the interval

- **GIVEN** the Surging Blade interval is running
- **WHEN** the player presses Low-Temperature Cooking
- **THEN** no Surging Blade is queued

### Requirement: Scoring Cuts heal

Scoring Cuts SHALL heal the active character once from its field, and it SHALL cost 60 energy and cool for 15 seconds before it can be cast again.

#### Scenario: Scoring Cuts heals the active character

- **GIVEN** Escoffier has 60 energy
- **WHEN** the player casts Scoring Cuts
- **THEN** the active character is healed once by the field

#### Scenario: Scoring Cuts is refused without enough energy

- **GIVEN** Escoffier has less than 60 energy
- **WHEN** the player casts Scoring Cuts
- **THEN** it does not cast

### Requirement: Rehab Diet from Ascension 1

From Ascension 1, Scoring Cuts SHALL also start Rehab Diet, a field of nine heals for the active character.

#### Scenario: Rehab Diet heals nine times

- **GIVEN** Escoffier is at Ascension 1
- **WHEN** Scoring Cuts is cast
- **THEN** Rehab Diet heals the active character nine times, starting 157 frames after the cast and every 58.5 frames after that, each heal at 1.3824 times Escoffier's ATK
