## Purpose

Keqing's kit as built: five strikes, a charged attack of two slashes, a collision and two plunges, Stellar Restoration with its Lightning Stiletto's recast and infusion, and Starward Sword's initial hit, eight slashes and final strike, with her Ascension 4 passive and Constellations 1, 4 and 6 built, and her other passives and Constellation 2 not built.

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

### Requirement: Keqing's Constellations 1, 4 and 6

Constellation 1 SHALL add an Electro hit of 50% of ATK 3 frames into each Stellar Restoration recast and another at its hitmark. Constellation 4 SHALL give Keqing 25% ATK for 10 seconds when an Electro-related reaction she triggers lands. Constellation 6 SHALL give her 6% Electro DMG Bonus for 8 seconds from each Normal Attack, Charged Attack, Elemental Skill and Burst, a repeat of the same kind restarting its own.

#### Scenario: Recast adds Electro hits at Constellation 1

- **GIVEN** Keqing has Constellation 1
- **WHEN** the player recasts Stellar Restoration
- **THEN** an Electro hit of 50% of ATK lands 3 frames in, and another at the recast's hitmark

#### Scenario: Electro reaction raises ATK at Constellation 4

- **GIVEN** Keqing has Constellation 4
- **WHEN** she triggers an Electro-related reaction
- **THEN** she gains 25% ATK for 10 seconds

#### Scenario: Each kind of action gives Electro DMG Bonus at Constellation 6

- **GIVEN** Keqing has Constellation 6
- **WHEN** she starts a Normal Attack, Charged Attack, Elemental Skill and Burst
- **THEN** each gives 6% Electro DMG Bonus for 8 seconds, and a repeat of the same kind restarts its own

### Requirement: Unbuilt Keqing effects

Constellation 2 and her other passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Keqing has Constellation 2 or an unbuilt passive
- **WHEN** the player fights with Keqing
- **THEN** that effect has no effect

### Requirement: Provisional plunges

Keqing's collision and two plunges SHALL keep provisional timings and reaches until a recording settles them.

#### Scenario: A plunge deals its hit within its provisional reach

- **GIVEN** Keqing is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its own hit within its provisional reach
- **AND** the timing and reach stay provisional until a recording settles them
