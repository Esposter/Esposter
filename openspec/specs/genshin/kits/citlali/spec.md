## Purpose

Citlali's kit as built: her three strikes, charged attack, Obsidian Tzitzimitl's hit, Ice Storm, her plunges, and the Opal Fire with Itzpapa's Frostfall Storm. Constellation 2's Elemental Mastery for herself is built, and the Opal Shield, the Spirit Vessel skulls and her passives wait on their hooks.

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

#### Scenario: The burst's points raise a generation event

- **GIVEN** a field on the team is listening for kit events
- **WHEN** the player casts Ice Storm
- **THEN** the field hears a Nightsoul points gained event of 24 points for Citlali

### Requirement: Opal Fire and Itzpapa's Frostfall Storm

The Opal Fire SHALL take effect in the Nightsoul Blessing at 50 Nightsoul points or more and SHALL drain eight points a second until none is left. While it is on, Itzpapa SHALL strike every enemy within 6 metres of the active character every 59 frames, from the first 59 frames after it takes effect.

#### Scenario: The Opal Fire takes effect at 50 points in the Blessing, not below

- **GIVEN** Citlali's skill press has entered the Blessing with 24 points
- **WHEN** she casts Ice Storm, giving 48 points, and casts it again, giving 72
- **THEN** the Opal Fire takes effect on the second cast and not on the first

#### Scenario: The Opal Fire takes no effect outside the Blessing

- **GIVEN** Citlali is out of the Blessing
- **WHEN** she casts Ice Storm three times
- **THEN** no Frostfall Storm strike lands

#### Scenario: The Opal Fire drains eight points a second and ends at none

- **GIVEN** the Opal Fire is on with 72 points
- **WHEN** one second passes
- **THEN** she holds 64 points
- **AND** when her points run out the Opal Fire ends while the Blessing lasts on

#### Scenario: Frostfall Storm strikes every 59 frames within 6 metres

- **GIVEN** the Opal Fire is on, with one enemy 3 metres away and another 8 metres away
- **WHEN** 59 frames pass, then 59 more
- **THEN** the enemy 3 metres away takes a Frostfall Storm strike at each 59 frames
- **AND** the enemy 8 metres away takes none

#### Scenario: Frostfall Storm's Cryo applies on every other hit within its cooldown

- **GIVEN** the Opal Fire is on and an enemy stands 3 metres away
- **WHEN** Frostfall Storm strikes it twice within 1.5 seconds, then once more after the cooldown ends
- **THEN** the first and third strikes apply Cryo to it and the second applies none
- **AND** every strike deals its damage

### Requirement: Strikes and charged attack deal their poise

Citlali's strikes and charged attack SHALL deal the poise the design gives them, a provisional value until a recording of the game's poise settles it.

#### Scenario: A strike deals its poise

- **GIVEN** Citlali is the character on the field
- **WHEN** one of her strikes hits an enemy
- **THEN** the enemy takes the poise the design gives that strike

### Requirement: Constellation 2 gives her own Elemental Mastery

From constellation 2, Citlali SHALL gain 125 Elemental Mastery for as long as she has the constellation.

#### Scenario: Citlali gains Elemental Mastery at constellation 2

- **GIVEN** Citlali is at constellation 2
- **WHEN** her hits are priced
- **THEN** her Elemental Mastery is 125 higher

#### Scenario: Below constellation 2 she gains none

- **GIVEN** Citlali is at constellation 1
- **WHEN** her hits are priced
- **THEN** her Elemental Mastery is not raised by the constellation
