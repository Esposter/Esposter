## Purpose

Citlali's kit as built: her three strikes, charged attack, Obsidian Tzitzimitl's hit, Ice Storm, her plunges, the Opal Fire with Itzpapa's Frostfall Storm, the Opal Shield and the Spirit Vessel skulls. Her constellations wait on their hooks.

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

The Opal Fire SHALL take effect in the Nightsoul Blessing at 50 Nightsoul points or more, SHALL drain eight points a second until none is left, and SHALL end in the step its Blessing runs out. While it is on, Itzpapa SHALL strike every enemy within 6 metres of the active character every 59 frames, from the first 59 frames after it takes effect.

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

#### Scenario: The Opal Fire ends with its Blessing

- **GIVEN** the Opal Fire is on with 72 points, and the Blessing has half a second left
- **WHEN** the Blessing runs out, with points still left to drain
- **THEN** the Opal Fire ends in that same step

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

### Requirement: Ascension 4

At Ascension 4 Citlali SHALL gain four Nightsoul points on each Nightsoul burst on the team, and Ice Storm and each Frostfall Storm SHALL add flat damage from her Elemental Mastery, 12 times it for Ice Storm and 0.9 times it for a Frostfall Storm.

#### Scenario: A Nightsoul burst on the team gives four points from Ascension 4

- **GIVEN** Citlali is at Ascension 4 and holds no Nightsoul points
- **WHEN** a Nightsoul burst goes off on the team
- **THEN** she holds four Nightsoul points

#### Scenario: A Nightsoul burst gives no points below Ascension 4

- **GIVEN** Citlali is at Ascension 3 and holds no Nightsoul points
- **WHEN** a Nightsoul burst goes off on the team
- **THEN** she holds no Nightsoul points

#### Scenario: Ice Storm adds 12 times Elemental Mastery as flat damage

- **GIVEN** Citlali is at Ascension 4 with 1000 Elemental Mastery
- **WHEN** Ice Storm's hit is priced
- **THEN** it adds 12000 flat damage

### Requirement: Ascension 1

At Ascension 1 a Melt or Frozen on an enemy during the Nightsoul Blessing SHALL give Citlali sixteen Nightsoul points, once each eight seconds, and SHALL lower that enemy's Hydro and Pyro RES by 20% for twelve seconds.

#### Scenario: A Melt during the Blessing gives sixteen points from Ascension 1

- **GIVEN** Citlali is at Ascension 1 and her skill's press has entered the Blessing with 24 points
- **WHEN** a Melt lands on an enemy
- **THEN** she holds 40 points

#### Scenario: A Melt gives no points below Ascension 1

- **GIVEN** Citlali is at Ascension 0 and her skill's press has entered the Blessing
- **WHEN** a Melt lands on an enemy
- **THEN** she still holds 24 points

#### Scenario: The points come at most once in eight seconds

- **GIVEN** a Melt has given her points
- **WHEN** a Frozen lands on an enemy seven seconds later
- **THEN** she gains no points
- **WHEN** a Frozen lands on an enemy nine seconds after the Melt
- **THEN** she gains sixteen points

#### Scenario: A Melt lowers the enemy's Hydro and Pyro RES for twelve seconds

- **GIVEN** Citlali is at Ascension 1 and in the Blessing
- **WHEN** a Melt lands on an enemy
- **THEN** the enemy's Hydro and Pyro RES are lowered by 20% for twelve seconds

#### Scenario: Outside the Blessing a Melt gives nothing

- **GIVEN** Citlali is at Ascension 1 and out of the Blessing
- **WHEN** a Melt lands on an enemy
- **THEN** she gains no points and the enemy's RES is unchanged

### Requirement: The Opal Shield

Citlali's skill press SHALL cast the Opal Shield 37 frames after it, as a Cryo shield of her Elemental Mastery times its share plus its flat health, lasting 20 seconds: at talent level 1 that is 5.76 times Elemental Mastery plus 1386.7, and at level 15 it is 13.68 times plus 4380.

#### Scenario: The Opal Shield comes 37 frames after the press

- **GIVEN** Citlali presses Obsidian Tzitzimitl with 1000 Elemental Mastery
- **WHEN** 36 frames pass
- **THEN** no shield is on the team
- **WHEN** one more frame passes
- **THEN** the team holds a Cryo shield of about 7146.7 health

#### Scenario: The Opal Shield lasts twenty seconds

- **GIVEN** the Opal Shield has come
- **WHEN** 19 seconds pass
- **THEN** the shield is still on the team
- **WHEN** another second passes
- **THEN** the shield has ended

### Requirement: The Spirit Vessel skulls

Ice Storm SHALL summon a Spirit Vessel skull on each of the first three enemies within 7 metres of Citlali as it is cast. Each skull SHALL land 205 to 235 frames after the press, give Citlali three Nightsoul points, and strike the enemies in its 3.5-metre circle where they stand as it lands.

#### Scenario: Ice Storm summons skulls on the first three enemies within 7 metres

- **GIVEN** four enemies stand within 7 metres of Citlali and a fifth stands 11 metres off
- **WHEN** the player casts Ice Storm
- **THEN** a skull is summoned on each of the first three enemies in reach
- **AND** none is summoned on the fourth or the fifth

#### Scenario: Each skull lands at its own draw, 205 to 235 frames after the press

- **GIVEN** three skulls are summoned, with their draws at the start, the middle and the end of their range
- **WHEN** 205, 220 and 235 frames pass
- **THEN** each skull lands in turn on its own enemy

#### Scenario: Each skull gives three Nightsoul points as it lands

- **GIVEN** Citlali is in the Blessing with 48 points
- **WHEN** three skulls land
- **THEN** she holds 57 points

#### Scenario: A skull strikes the enemies in its circle where they stand as it lands

- **GIVEN** a skull is summoned on an enemy 6 metres off, and a second enemy stands 9 metres off
- **WHEN** the first enemy steps to 1.5 metres from the second before the skull lands
- **THEN** the skull strikes both enemies

#### Scenario: A skull's multiplier grows with the burst's talent level

- **GIVEN** Citlali's burst is at talent level 15
- **WHEN** a skull lands
- **THEN** its multiplier is 3.192, from 1.344 at level 1

### Requirement: Strikes and charged attack deal no poise

Citlali's strikes and charged attack SHALL deal no poise, a provisional value until a recording of the game's poise settles it.

#### Scenario: A strike deals no poise

- **GIVEN** Citlali is the character on the field
- **WHEN** one of her strikes hits an enemy
- **THEN** the enemy takes no poise damage
