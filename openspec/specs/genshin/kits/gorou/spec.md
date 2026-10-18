## Purpose

Gorou's kit as built: his strikes, fully charged shot and plunges, Inuzaka All-Round Defense and its General's War Banner, and Juuga with its following field and Crystal Collapse, with his constellations left unbuilt.

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

Crystal Collapse SHALL follow Gorou's body and strike on six ticks, ending nine seconds from its hit.

#### Scenario: Crystal Collapse strikes on six ticks

- **GIVEN** Juuga's Crystal Collapse is cast
- **WHEN** its six ticks come due
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
