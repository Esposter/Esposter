## Purpose

Chiori's kit as built: her four strikes, charged attack, collision and two plunges, Fluttering Hasode's upward sweep with its Tamoto doll and hold, and Hiyoku: Twin Blades, and what is left of Tapestry and Tailoring, the Geo constructs and her constellations.

## Requirements

### Requirement: Basic attacks

Chiori's normal attacks SHALL be four strikes, a charged attack of two thrusts, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Chiori is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four strikes play in order
- **AND** the third strike deals two hits

#### Scenario: Charged attack plays two thrusts

- **GIVEN** Chiori is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** her charged attack plays its two thrusts

#### Scenario: Plunge hits the area around its landing point

- **WHEN** the player plunges from the air
- **THEN** the plunge hits the enemies inside its area around her landing point

### Requirement: Provisional high plunge

Chiori's high plunge SHALL land with the low plunge's timing and 150 poise, a provisional value until a recording of the game settles its frames and amount.

#### Scenario: A recording settles the high plunge

- **GIVEN** a recording of Chiori's high plunge exists
- **WHEN** its frames and poise are compared with the kit's
- **THEN** the provisional values stay until the comparison settles them

### Requirement: Fluttering Hasode press

Pressing Fluttering Hasode SHALL sweep upward in front of Chiori and summon Tamoto where she stands.

#### Scenario: Pressing Fluttering Hasode sweeps and summons Tamoto

- **GIVEN** Chiori is the character on the field
- **WHEN** the player presses Fluttering Hasode
- **THEN** the upward sweep lands 21 frames after the press and hits the enemies inside its box, 3.5 metres ahead and 5.5 metres wide
- **AND** Tamoto appears 19 frames after the press

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Fluttering Hasode was pressed less than 16 seconds ago
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Fluttering Hasode hold

Holding Fluttering Hasode SHALL start its upward sweep and summon Tamoto later than a press does, once the hold passes a half-second threshold that stays provisional.

#### Scenario: Holding Fluttering Hasode sweeps later than a press

- **GIVEN** Chiori is the character on the field
- **WHEN** the player holds Fluttering Hasode past the threshold
- **THEN** the upward sweep lands 37 frames after the hold starts
- **AND** Tamoto appears 34 frames after the hold starts

#### Scenario: A release before the threshold plays as a press

- **GIVEN** Chiori is the character on the field
- **WHEN** the player releases Fluttering Hasode before the threshold
- **THEN** it plays as a press

### Requirement: Tamoto attacks

Tamoto SHALL attack 60, 276, 492, 708 and 924 frames after it is summoned and then every 216 frames while it stands, each attack striking the target it finds within 12 metres of Chiori.

#### Scenario: Tamoto strikes an enemy within 12 metres

- **GIVEN** Tamoto stands and an enemy is within 12 metres of Chiori
- **WHEN** one of Tamoto's attacks lands
- **THEN** the attack hits that enemy inside a circle of radius 1.2 metres

#### Scenario: Tamoto finds no target beyond 12 metres

- **GIVEN** Tamoto stands and no enemy is within 12 metres of Chiori
- **WHEN** one of Tamoto's attacks lands
- **THEN** the attack finds no target

### Requirement: Tamoto standing time

Tamoto SHALL stand for a provisional seventeen and a half seconds after it is summoned, a length a recording may change.

#### Scenario: Tamoto leaves when its time runs out

- **GIVEN** Tamoto was summoned
- **WHEN** 17.5 seconds pass
- **THEN** Tamoto leaves the field

### Requirement: Hiyoku Twin Blades burst

Hiyoku: Twin Blades SHALL strike 92 frames after it is pressed, hitting every enemy inside a circle of radius 12 metres around Chiori and dealing 200 poise, and it SHALL cost 50 energy.

#### Scenario: The burst strikes the area around Chiori

- **GIVEN** Chiori has 50 energy
- **WHEN** the player presses Hiyoku: Twin Blades
- **THEN** its strike lands 92 frames later on every enemy inside 12 metres of her

#### Scenario: The burst is refused without full energy

- **GIVEN** Chiori has less than 50 energy
- **WHEN** the player presses Hiyoku: Twin Blades
- **THEN** it does not cast

#### Scenario: The burst is refused within its cooldown

- **GIVEN** Hiyoku: Twin Blades was cast less than 13.5 seconds ago
- **WHEN** the player presses it again
- **THEN** it does not cast
