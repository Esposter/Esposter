## Purpose

Jahoda's kit as built: her three strikes, a fully charged shot, a collision and two plunges, Savvy Strategy's pursuit with its flask and drains, and Hidden Aces' first hit and heals, Constellation 6's Moonsign buff, and her Moonsign Benediction, Rooftop Dash, as her record holds it, with her robots, Meowball and the rest of her Moonsign kit not yet built.

## Requirements

### Requirement: Three strikes and fully charged shot deal no poise

Jahoda's three strikes and fully charged shot SHALL be her normal attacks, and none of their hits SHALL deal poise.

#### Scenario: Strike chain plays three strikes in order

- **GIVEN** Jahoda is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three strikes play in order

#### Scenario: A fully charged shot hits its target

- **GIVEN** Jahoda has charged her shot fully
- **WHEN** the player releases the shot
- **THEN** the shot hits its target

#### Scenario: Strikes and shot deal no poise

- **GIVEN** Jahoda is the character on the field
- **WHEN** a strike or the fully charged shot lands
- **THEN** it deals no poise

### Requirement: Savvy Strategy drains its flask on a second press

Savvy Strategy SHALL drain its flask on a second press, and the drain SHALL land 2 frames after that press when the flask is full and 4 frames after it when the flask is not full.

#### Scenario: A full flask drains 2 frames after the press

- **GIVEN** Savvy Strategy's flask is full
- **WHEN** the player presses Savvy Strategy again
- **THEN** the drain lands 2 frames after the press, cast where Jahoda stands

#### Scenario: An unfilled flask drains 4 frames after the press

- **GIVEN** Savvy Strategy's flask is not full
- **WHEN** the player presses Savvy Strategy again
- **THEN** the drain lands 4 frames after the press, cast where Jahoda stands

#### Scenario: The cooldown starts at the press

- **GIVEN** Savvy Strategy is off cooldown
- **WHEN** the player presses Savvy Strategy
- **THEN** its 15-second cooldown starts at that press

### Requirement: Hidden Aces deals its first hit

Hidden Aces SHALL deal its first hit when Jahoda casts it.

#### Scenario: Casting Hidden Aces lands its first hit

- **GIVEN** Jahoda is the character on the field and Hidden Aces is off cooldown
- **WHEN** the player casts Hidden Aces
- **THEN** its first hit lands

#### Scenario: Hidden Aces cannot be cast during its cooldown

- **GIVEN** Hidden Aces is cooling down
- **WHEN** the player casts Hidden Aces again
- **THEN** nothing happens

### Requirement: Hidden Aces heals on its own clock

Hidden Aces SHALL heal the active character every 87 frames from its 12th frame for the burst's 790 frames, and while the active character has over 70% of her health SHALL heal the member with the lowest share of health as well.

#### Scenario: The active character is healed on each of nine ticks

- **GIVEN** Jahoda is the character on the field and her health is at 10%
- **WHEN** the player casts Hidden Aces
- **THEN** she is healed on frames 12, 99, 186, 273, 360, 447, 534, 621 and 708, and on no frame after

#### Scenario: Above 70% of her health, the lowest member is healed on the first tick

- **GIVEN** Jahoda is at 90% of her health and a partner at 40%
- **WHEN** the player casts Hidden Aces
- **THEN** the partner is healed on frame 12

#### Scenario: At 70% of her health or below, only the active character is healed

- **GIVEN** Jahoda is at 50% of her health and a partner at 40%
- **WHEN** the player casts Hidden Aces
- **THEN** the partner's health does not change

### Requirement: Plunges land at once with the shared reach

Jahoda's collision and two plunges SHALL land at once with the shared reach, and their timing SHALL stay borrowed until a recording settles it.

#### Scenario: A plunge lands at once

- **GIVEN** Jahoda is in the air
- **WHEN** the player plunges
- **THEN** the plunge lands at once with the shared reach
- **AND** its timing stays borrowed until a recording settles it

### Requirement: Constellation 6 buffs the Moonsign team when a full flask drains at Ascendant Gleam

#### Scenario: A full flask drains at Ascendant Gleam and buffs each Moonsign member

- **GIVEN** Jahoda has Constellation 6 and the deployed team is at Ascendant Gleam
- **WHEN** Savvy Strategy's flask drains full
- **THEN** each deployed member with a Moonsign Benediction gains 5% Crit Rate and 40% Crit DMG for 20 seconds

#### Scenario: A team at Nascent Gleam gets no Constellation 6 buff

- **GIVEN** Jahoda has Constellation 6 and the deployed team is at Nascent Gleam
- **WHEN** Savvy Strategy's flask drains full
- **THEN** no member gains a buff

#### Scenario: Constellation 5 gives no Moonsign buff

- **GIVEN** Jahoda has Constellation 5 and the deployed team is at Ascendant Gleam
- **WHEN** Savvy Strategy's flask drains full
- **THEN** no member gains a buff
