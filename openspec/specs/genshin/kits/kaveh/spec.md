## Purpose

Kaveh's kit as built, with his four strikes, a provisional charged attack, his plunges, Artistic Ingenuity's circle and Painted Dome's twelve-second stance, and what is left of the Dendro Cores his skill and burst rupture, Painted Dome's Bloom DMG Bonus, and his passives.

## Requirements

### Requirement: Four strikes, collision and plunges

Kaveh's four strikes, collision and two plunges SHALL be his normal attacks and plunges.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Kaveh is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order and each deals its own hit

#### Scenario: The collision deals no poise

- **GIVEN** Kaveh is in the air
- **WHEN** the collision lands
- **THEN** it deals no poise

### Requirement: Provisional charged attack that spins then finishes

Kaveh's charged attack SHALL spin at once and finish with a final hit at the longest duration the table allows, and both hits SHALL stay provisional until a recording settles them.

#### Scenario: Holding the charged attack spins and finishes

- **GIVEN** Kaveh is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** a spin of two-metre circles round his body lands at once
- **AND** a final two-metre circle round his body lands at the longest duration the table allows
- **AND** stamina drains for each second the attack is held
- **AND** both hits stay provisional until a recording settles them

### Requirement: Artistic Ingenuity strikes a Dendro circle

Artistic Ingenuity SHALL strike a Dendro circle of 5 metres round Kaveh 35 frames after it is cast.

#### Scenario: Casting Artistic Ingenuity strikes its circle

- **GIVEN** Kaveh is the character on the field and Artistic Ingenuity is off cooldown
- **WHEN** the player casts Artistic Ingenuity
- **THEN** its Dendro circle strikes round Kaveh 35 frames later

#### Scenario: Artistic Ingenuity cannot be cast during its cooldown

- **GIVEN** Artistic Ingenuity is cooling down
- **WHEN** the player casts it again
- **THEN** nothing happens

### Requirement: Painted Dome sets a twelve-second stance

Painted Dome SHALL strike a Dendro circle of 5 metres round Kaveh 36 frames after it is cast, and SHALL set a stance that lasts twelve seconds.

#### Scenario: Casting Painted Dome strikes and starts the stance

- **GIVEN** Kaveh is the character on the field and Painted Dome is off cooldown
- **WHEN** the player casts Painted Dome
- **THEN** its Dendro circle strikes round Kaveh 36 frames later
- **AND** the stance starts with the burst's animation and lasts twelve seconds

#### Scenario: Painted Dome cannot be cast during its cooldown

- **GIVEN** Painted Dome is cooling down
- **WHEN** the player casts it again
- **THEN** nothing happens

### Requirement: Painted Dome's stance widens strikes and ends on exit

While Painted Dome's stance lasts, Kaveh's strikes SHALL use wider fans, and the stance SHALL end when he leaves the field.

#### Scenario: A strike during the stance uses a wider fan

- **GIVEN** Painted Dome's stance stands
- **WHEN** one of Kaveh's strikes lands
- **THEN** its fan is wider than outside the stance

#### Scenario: Leaving the field ends the stance

- **GIVEN** Painted Dome's stance stands
- **WHEN** Kaveh leaves the field
- **THEN** the stance ends
- **AND** his strikes return to their normal fans
