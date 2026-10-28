## Purpose

Gorou's kit as built: his strikes, fully charged shot and plunges, Inuzaka All-Round Defense and its General's War Banner, and Juuga with its following field and Crystal Collapse, with Constellations 1, 4 and 6 built and Constellation 2 left unbuilt.

## Requirements

### Requirement: Strikes, shot and plunges

Gorou's four strikes, fully charged shot, collision and two plunges SHALL be his normal attacks and plunges.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Gorou is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order and each deals its own hit

#### Scenario: Holding the attack fires the fully charged shot

- **GIVEN** Gorou is the character on the field
- **WHEN** the player holds the attack button to full charge and releases it
- **THEN** his fully charged shot fires

### Requirement: Inuzaka All-Round Defense raises a General's War Banner

Inuzaka All-Round Defense SHALL raise a General's War Banner whose ticks give the active character flat DEF for two seconds, and Crunch's Geo DMG Bonus when the team holds three Geo characters.

#### Scenario: The banner's ticks buff the active character

- **GIVEN** Gorou is the character on the field
- **WHEN** the player casts Inuzaka All-Round Defense
- **THEN** the General's War Banner is raised
- **AND** on each of its ticks the active character gains the banner's flat DEF for two seconds

#### Scenario: Crunch needs three Geo characters on the team

- **GIVEN** the team holds three Geo characters
- **WHEN** a tick of the banner lands
- **THEN** the active character gains a 15% Geo DMG Bonus for two seconds

#### Scenario: Crunch gives nothing without three Geo characters

- **GIVEN** the team holds fewer than three Geo characters
- **WHEN** a tick of the banner lands
- **THEN** the active character gains no Geo DMG Bonus from Crunch

#### Scenario: The skill cannot be cast during its cooldown

- **GIVEN** Inuzaka All-Round Defense is cooling down
- **WHEN** the player casts it again
- **THEN** nothing happens

### Requirement: Juuga raises a field that follows Gorou

Juuga SHALL raise a field that follows Gorou's body and gives the active character the banner's buffs on each tick.

#### Scenario: The field follows Gorou as he moves

- **GIVEN** Gorou is the character on the field
- **WHEN** the player casts Juuga and then moves Gorou
- **THEN** the field stays centred on Gorou's body
- **AND** on each of its ticks the active character gains the banner's buffs, wherever the field has moved

### Requirement: Crystal Collapse follows Gorou's body

Crystal Collapse SHALL follow Gorou's body and strike on five ticks, ending nine seconds from its hit.

#### Scenario: Crystal Collapse strikes on five ticks

- **GIVEN** Juuga's Crystal Collapse is cast
- **WHEN** its five ticks come due
- **THEN** each tick strikes while Crystal Collapse follows Gorou's body
- **AND** it ends nine seconds from the hit, as the field does

### Requirement: Ascension 1 gives the party DEF from Juuga

From his first ascension, Juuga SHALL add 25% DEF to the party for twelve seconds.

#### Scenario: Juuga gives the party DEF

- **GIVEN** Gorou has his first ascension
- **WHEN** the player uses Juuga
- **THEN** the party gains 25% DEF for twelve seconds

### Requirement: Ascension 4 adds a share of DEF to the skill and burst

From his fourth ascension, Inuzaka All-Round Defense and Juuga SHALL add a share of Gorou's DEF to their base damage.

#### Scenario: Either skill's hit includes a share of DEF

- **GIVEN** Gorou has his fourth ascension
- **WHEN** the hit of Inuzaka All-Round Defense or Juuga lands
- **THEN** its base damage includes a share of Gorou's DEF

### Requirement: Constellation 1 cuts the skill's cooldown for a nearby character's Geo hit in the field

At Constellation 1 Gorou SHALL cut Inuzaka All-Round Defense's cooldown by 2 seconds when a character other than Gorou lands a Geo hit inside the General's War Banner's or Juuga's circle of 8 metres, once every 10 seconds.

#### Scenario: A nearby Geo hit in the banner cuts the cooldown

- **GIVEN** Gorou is at Constellation 1 and has placed the General's War Banner
- **WHEN** another character's Geo hit lands inside the banner's circle
- **THEN** Inuzaka All-Round Defense's cooldown is cut by 2 seconds

#### Scenario: Juuga's circle counts too

- **GIVEN** Gorou is at Constellation 1 and has cast Juuga
- **WHEN** another character's Geo hit lands within 8 metres of Gorou
- **THEN** Inuzaka All-Round Defense's cooldown is cut by 2 seconds

#### Scenario: A second Geo hit within 10 seconds cuts nothing

- **GIVEN** a nearby Geo hit has just cut the cooldown
- **WHEN** another nearby Geo hit lands within the next 10 seconds
- **THEN** the cooldown is not cut again

#### Scenario: A hit that is not Geo, is Gorou's own, or lands outside the circle cuts nothing

- **GIVEN** Gorou is at Constellation 1 and has placed the General's War Banner
- **WHEN** a Hydro hit lands inside the circle, a Geo hit by Gorou lands inside it, or a Geo hit by another character lands outside it
- **THEN** the cooldown is not cut

### Requirement: Constellation 4 heals the active character while General's Glory stands

At Constellation 4 Gorou SHALL heal the active character by half his DEF every 1.5 seconds from Juuga's burst hit while General's Glory stands, when two Geo characters are on the team at the cast.

#### Scenario: The heal reaches the active character every 1.5 seconds

- **GIVEN** Gorou is at Constellation 4 and two Geo characters are on the team
- **WHEN** Juuga is cast
- **THEN** the active character is healed by half of Gorou's DEF at the cast, first 1.5 seconds after the burst's hit and every 1.5 seconds after, while General's Glory stands

#### Scenario: The heal ends with General's Glory

- **GIVEN** the heal has been ticking
- **WHEN** General's Glory ends
- **THEN** no further heal is given

#### Scenario: A new Juuga replaces the heal standing rather than adding to it

- **GIVEN** the heal is ticking
- **WHEN** Juuga is cast again
- **THEN** one heal every 1.5 seconds is given, not two

#### Scenario: One Geo character, or Constellation 3, gives no heal

- **GIVEN** Gorou is at Constellation 4 with no other Geo character on the team, or is at Constellation 3 with two
- **WHEN** Juuga is cast
- **THEN** no heal is given

### Requirement: Constellation 6 gives the party CRIT DMG on Geo for 12 seconds after a skill or burst

At Constellation 6 Gorou SHALL give every party member 10% CRIT DMG on Geo for 12 seconds after Inuzaka All-Round Defense or Juuga, at 20% with two Geo characters on the team and 40% with three or more.

#### Scenario: Three Geo characters give the party 40% for 12 seconds

- **GIVEN** Gorou is at Constellation 6 and three Geo characters are on the team
- **WHEN** Inuzaka All-Round Defense is used
- **THEN** every party member's Geo strikes gain 40% CRIT DMG for 12 seconds, and their non-Geo strikes gain none

#### Scenario: A burst after the skill refreshes the CRIT DMG rather than stacking it

- **GIVEN** Gorou is at Constellation 6 and has used Inuzaka All-Round Defense
- **WHEN** Juuga is cast
- **THEN** each party member's Geo strikes gain 40% CRIT DMG, not 80%

#### Scenario: Below Constellation 6 nothing is given

- **GIVEN** Gorou is at Constellation 5 and three Geo characters are on the team
- **WHEN** Inuzaka All-Round Defense is used
- **THEN** no party member gains CRIT DMG on Geo
