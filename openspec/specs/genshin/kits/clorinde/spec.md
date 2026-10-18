## Purpose

Clorinde's kit as built, with her five strikes, her charged attack, Last Lightfall's five strikes and her plunges, and what is left of Hunter's Vigil's Night Vigil stance, her Bond of Life and her constellations, bar the sixth's crit buff.

## Requirements

### Requirement: Normal attack chain

Clorinde's normal attacks SHALL be five strikes, the fourth striking three boxes in front of her and the fifth striking a single circle.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Clorinde is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five strikes play in order
- **AND** the fourth strike hits three boxes in front of her

### Requirement: Charged attack

Clorinde's charged attack SHALL hit a circle round her and SHALL cost 20 stamina.

#### Scenario: Charged attack hits the circle round her

- **GIVEN** Clorinde has 20 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack hits the circle round her at 38 frames, in an animation of 68 frames
- **AND** 20 stamina is spent

### Requirement: Last Lightfall

Last Lightfall SHALL strike five times at 97, 103, 109, 115 and 121 frames of its 128-frame animation, and SHALL be refused without the energy it costs.

#### Scenario: Last Lightfall strikes five times

- **GIVEN** Clorinde has enough energy
- **WHEN** the player casts Last Lightfall
- **THEN** its five strikes land at 97, 103, 109, 115 and 121 frames

#### Scenario: Last Lightfall is refused without enough energy

- **GIVEN** Clorinde has less energy than the burst costs
- **WHEN** the player casts Last Lightfall
- **THEN** it does not cast

### Requirement: Hunter's Vigil press

Pressing Hunter's Vigil SHALL play its 33-frame animation and start a 16-second cooldown, dealing no damage.

#### Scenario: Pressing Hunter's Vigil plays its animation

- **GIVEN** Clorinde is the character on the field
- **WHEN** the player presses Hunter's Vigil
- **THEN** its 33-frame animation plays and a 16-second cooldown starts
- **AND** no damage is dealt

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Hunter's Vigil was pressed less than 16 seconds ago
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: No poise from normal attacks and plunges

Clorinde's normal attacks and plunges SHALL deal no poise, and her plunges SHALL land as their action starts, both provisional until a recording settles them.

#### Scenario: A normal attack deals no poise

- **GIVEN** Clorinde is the character on the field
- **WHEN** one of her normal attacks hits an enemy
- **THEN** the enemy takes no poise damage

#### Scenario: A plunge lands as its action starts

- **WHEN** the player plunges from the air
- **THEN** the plunge lands as its action starts, a provisional timing

### Requirement: Sixth constellation raises her crit after Hunter's Vigil

From her sixth constellation, Hunter's Vigil SHALL raise Clorinde's CRIT Rate by 10% and her CRIT DMG by 70% for 12 seconds.

#### Scenario: Hunter's Vigil raises her crit from the sixth constellation

- **GIVEN** Clorinde has six constellations
- **WHEN** the player uses Hunter's Vigil
- **THEN** her CRIT Rate and CRIT DMG are raised for 12 seconds

#### Scenario: Below the sixth constellation Hunter's Vigil raises no crit

- **GIVEN** Clorinde has five constellations
- **WHEN** the player uses Hunter's Vigil
- **THEN** her CRIT Rate and CRIT DMG are unchanged
