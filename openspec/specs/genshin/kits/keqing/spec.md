## Purpose

Keqing's kit as built: five strikes, a charged attack of two slashes, a collision and two plunges, Stellar Restoration with its Lightning Stiletto's recast and infusion, and Starward Sword's initial hit, eight slashes and final strike, with her passives and constellations not built.

## Requirements

### Requirement: Five strikes and two-slash charged attack

Keqing's five strikes and two-slash charged attack SHALL be her normal attacks, and the charged attack's gauge and frames SHALL stay provisional until a recording settles them.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Keqing is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five strikes play in order

#### Scenario: Charged attack plays two slashes

- **GIVEN** Keqing is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack plays two slashes
- **AND** its gauge and frames stay provisional until a recording settles them

### Requirement: Stellar Restoration leaves Lightning Stiletto for a recast

Stellar Restoration SHALL leave Lightning Stiletto, which a second press recasts within five seconds and twenty frames.

#### Scenario: Casting Stellar Restoration leaves the Stiletto

- **GIVEN** Keqing is the character on the field
- **WHEN** the player casts Stellar Restoration
- **THEN** Lightning Stiletto stands

#### Scenario: A press inside the window recasts and infuses

- **GIVEN** Lightning Stiletto stands
- **WHEN** the player presses again within five seconds and twenty frames
- **THEN** the recast lands
- **AND** her attacks are infused with Electro for six seconds
- **AND** the six seconds stay provisional until a recording settles them

#### Scenario: A press after the window recasts nothing

- **GIVEN** Lightning Stiletto stands
- **WHEN** the player presses after the window has closed
- **THEN** no recast happens

### Requirement: Starward Sword strikes its initial hit, eight slashes and final strike

Starward Sword SHALL strike an initial hit, eight slashes and a final strike, all Electro, in a circle of 8 metres round Keqing's body.

#### Scenario: Casting Starward Sword plays its hits in order

- **GIVEN** Keqing has the energy for the burst
- **WHEN** the player casts Starward Sword
- **THEN** the initial hit lands
- **AND** eight slashes follow, 11 frames apart from 82 frames
- **AND** the final strike lands
- **AND** each slash is its own hit

#### Scenario: Starward Sword cannot be cast during its cooldown

- **GIVEN** the burst is cooling down
- **WHEN** the player casts Starward Sword again
- **THEN** nothing happens

### Requirement: Provisional plunges

Keqing's collision and two plunges SHALL keep provisional timings and reaches until a recording settles them.

#### Scenario: A plunge deals its hit within its provisional reach

- **GIVEN** Keqing is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its own hit within its provisional reach
- **AND** the timing and reach stay provisional until a recording settles them
