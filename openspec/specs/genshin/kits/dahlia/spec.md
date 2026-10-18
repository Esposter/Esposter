## Purpose

Dahlia's kit as built: her four strikes, charged attack, Immersive Ordinance's tap and hold, and Radiant Psalter's shield. Her Benison stacks, Favonian Favor's attack speed and her passives wait on the Benison and attack-speed hooks.

## Requirements

### Requirement: Strikes and charged attack

Dahlia's normal attacks SHALL be four strikes and a charged attack, and neither SHALL deal poise.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Dahlia is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four strikes play in order
- **AND** no poise damage is dealt

#### Scenario: Charged attack costs 20 stamina

- **GIVEN** Dahlia has 20 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack spends 20 stamina

### Requirement: Plunge poise

Dahlia's low, high and collision plunges SHALL deal 150, 100 and 25 poise, a provisional value until the game's own values are checked.

#### Scenario: A low plunge deals 150 poise

- **GIVEN** Dahlia is in the air
- **WHEN** her low plunge hits an enemy
- **THEN** the enemy takes 150 poise damage

#### Scenario: A collision plunge deals 25 poise

- **GIVEN** Dahlia is in the air
- **WHEN** her collision plunge hits an enemy
- **THEN** the enemy takes 25 poise damage

### Requirement: Immersive Ordinance tap and hold

Immersive Ordinance SHALL act as a tap or a hold, and SHALL cool for 9 seconds after either before it can be used again.

#### Scenario: A tap casts Immersive Ordinance

- **GIVEN** Dahlia is the character on the field
- **WHEN** the player taps Immersive Ordinance
- **THEN** Immersive Ordinance casts and its cooldown starts

#### Scenario: A hold past the threshold casts the hold

- **GIVEN** Dahlia is the character on the field
- **WHEN** the player holds Immersive Ordinance past half a second, a provisional threshold
- **THEN** the hold version casts

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Immersive Ordinance was used less than 9 seconds ago
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Radiant Psalter shield

Radiant Psalter SHALL cost 60 energy, cool for 15 seconds, and place a shield on Dahlia 31 frames after the cast.

#### Scenario: The shield is placed 31 frames after the cast

- **GIVEN** Dahlia has 60 energy
- **WHEN** the player casts Radiant Psalter
- **THEN** a shield is placed on Dahlia 31 frames later, sized as a share of her max HP plus a flat amount
- **AND** the shield lasts the 12 seconds Favonian Favor holds, counted from its placement

#### Scenario: A broken shield is not made again

- **GIVEN** Radiant Psalter's shield has broken
- **WHEN** the shield's duration would otherwise continue
- **THEN** no new shield is made

#### Scenario: Radiant Psalter is refused during its cooldown

- **GIVEN** Radiant Psalter was cast less than 15 seconds ago
- **WHEN** the player casts it again
- **THEN** it does not cast
