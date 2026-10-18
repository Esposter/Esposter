## Purpose

Citlali's kit as built: her three strikes, charged attack, Obsidian Tzitzimitl's hit, Ice Storm and her plunges. Itzpapa, the Opal Shield, the Spirit Vessel skulls and her passives wait on their hooks.

## Requirements

### Requirement: Basic attacks

Citlali's normal attacks SHALL be three strikes, a charged attack, a collision attack, a low plunge and a high plunge.

#### Scenario: Strike chain plays three strikes in order

- **GIVEN** Citlali is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three strikes play in order
- **AND** each strike lands 10 frames after the hit point of its animation

#### Scenario: Charged attack costs stamina

- **GIVEN** Citlali has 50 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack spends 50 stamina

### Requirement: Obsidian Tzitzimitl

Obsidian Tzitzimitl SHALL deal its hit when pressed and SHALL cool down before it can be pressed again.

#### Scenario: Pressing Obsidian Tzitzimitl deals its hit

- **GIVEN** Citlali is the character on the field
- **WHEN** the player presses Obsidian Tzitzimitl
- **THEN** its hit lands on the enemies it reaches

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Obsidian Tzitzimitl was pressed and its cooldown has not ended
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Ice Storm

Ice Storm SHALL deal its burst hit and SHALL cost 60 energy.

#### Scenario: Ice Storm deals its hit

- **GIVEN** Citlali has 60 energy
- **WHEN** the player casts Ice Storm
- **THEN** its hit lands and the energy is spent

#### Scenario: Ice Storm is refused without enough energy

- **GIVEN** Citlali has less than 60 energy
- **WHEN** the player casts Ice Storm
- **THEN** it does not cast

### Requirement: Plunge timing

Citlali's collision, low and high plunges SHALL land at the start of their action, a provisional timing until a recording shows a later landing.

#### Scenario: A plunge lands at the start of its action

- **WHEN** the player plunges from the air
- **THEN** the plunge hits the enemies around her landing point as its action starts

#### Scenario: A recording settles the plunge timing

- **GIVEN** a recording of Citlali's plunge exists
- **WHEN** its landing is compared with the kit's
- **THEN** the start-of-action timing stays provisional until the comparison settles it

### Requirement: Nightsoul Blessing from the skill's press

Citlali's skill press SHALL enter the Nightsoul Blessing for 20 seconds with its Nightsoul points plus 24, and her burst SHALL give 24 points, up to 100.

#### Scenario: The press enters the Blessing with its points plus 24, which last twenty seconds

- **GIVEN** Citlali holds no Nightsoul points and is out of the Blessing
- **WHEN** the player presses Obsidian Tzitzimitl
- **THEN** the Blessing holds 24 points
- **AND** the Blessing ends 20 seconds later

#### Scenario: The burst gains 24 Nightsoul points

- **GIVEN** Citlali holds no Nightsoul points
- **WHEN** the player casts Ice Storm
- **THEN** she holds 24 Nightsoul points

### Requirement: Strikes and charged attack deal no poise

Citlali's strikes and charged attack SHALL deal no poise, a provisional value until a recording of the game's poise settles it.

#### Scenario: A strike deals no poise

- **GIVEN** Citlali is the character on the field
- **WHEN** one of her strikes hits an enemy
- **THEN** the enemy takes no poise damage
