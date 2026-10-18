## Purpose

Gaming's kit as built: his four strikes, a provisional charged attack, a collision and two plunges, and Bestial Ascent and Suanni's Gilded Dance's strike, with his Man Chai, his heals and his passives left unbuilt.

## Requirements

### Requirement: Strikes

Gaming's four strikes SHALL play in order from the attack button as his normal attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Gaming is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order and each deals its own hit

### Requirement: Plunges

Gaming's collision and two plunges SHALL each deal their own hit.

#### Scenario: Plunge deals its own hit

- **GIVEN** Gaming is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its own hit

### Requirement: Provisional charged attack

Gaming's charged attack SHALL take a timing and reach borrowed from another character and stay provisional until a recording of the attack settles them.

#### Scenario: Charged attack costs stamina as it plays

- **GIVEN** Gaming has at least 40 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack plays with its provisional timing and reach
- **AND** 40 stamina is spent

#### Scenario: A recording settles the charged attack

- **GIVEN** a recording of Gaming's charged attack exists
- **WHEN** its timing and reach are compared with the kit's
- **THEN** the charged attack stays provisional until the comparison settles them

### Requirement: Bestial Ascent deals no damage of its own

Bestial Ascent SHALL play Gaming's cast animation and start its cooldown, and it SHALL deal no damage of its own.

#### Scenario: Casting Bestial Ascent plays its animation

- **GIVEN** Gaming is the character on the field and Bestial Ascent is off cooldown
- **WHEN** the player casts Bestial Ascent
- **THEN** its cast animation plays
- **AND** its cooldown starts
- **AND** it deals no damage of its own

#### Scenario: Bestial Ascent cannot be cast during its cooldown

- **GIVEN** Bestial Ascent is cooling down
- **WHEN** the player casts Bestial Ascent again
- **THEN** nothing happens

### Requirement: Suanni's Gilded Dance strikes once

Suanni's Gilded Dance SHALL strike one circle of radius 5 metres round Gaming's body, 60 frames after it is cast.

#### Scenario: Casting Suanni's Gilded Dance strikes its circle

- **GIVEN** Gaming has the energy for the burst
- **WHEN** the player casts Suanni's Gilded Dance
- **THEN** its circle strikes round Gaming's body 60 frames in
- **AND** the burst's energy cost is spent

#### Scenario: Suanni's Gilded Dance cannot be cast without its energy

- **GIVEN** Gaming has less energy than the burst costs
- **WHEN** the player casts Suanni's Gilded Dance
- **THEN** the burst does not start
