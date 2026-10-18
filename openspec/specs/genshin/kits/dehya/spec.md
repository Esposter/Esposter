## Purpose

Dehya's kit as built, with her four strikes, a provisional charged attack, her plunges and Molten Inferno's initial hit, and what is left of her Sanctum, Ranging Flame, Flame-Mane's Fist and Incineration Drive, and her passives.

## Requirements

### Requirement: Basic attacks

Dehya's normal attacks SHALL be four blunt strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Dehya is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four strikes play in order, each dealing blunt damage

### Requirement: Provisional charged attack

Dehya's charged attack SHALL be provisional, with a spin that hits at once and a final hit at its longest charge, until a recording of the game settles them.

#### Scenario: Charging plays the spin and the final hit

- **GIVEN** Dehya is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** a spin hits the circle of radius 2 metres round her at once
- **AND** a final hit lands at the charged attack's maximum duration, in the same circle

### Requirement: Molten Inferno initial hit

Molten Inferno SHALL deal an initial Pyro hit in a circle of radius 5 metres, landing 20 frames after it is cast, and SHALL be refused without the energy it costs.

#### Scenario: The initial hit lands 20 frames after the cast

- **GIVEN** Dehya has enough energy
- **WHEN** the player casts Molten Inferno
- **THEN** its Pyro hit lands 20 frames later on the enemies inside the circle of radius 5 metres

#### Scenario: Molten Inferno is refused without enough energy

- **GIVEN** Dehya has less energy than Molten Inferno costs
- **WHEN** the player casts Molten Inferno
- **THEN** it does not cast
