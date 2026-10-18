## Purpose

Dori's kit as built: her three strikes, a provisional charged attack, a collision and two plunges, Troubleshooter Shot with its After-Sales Service Round, and Alcazarzaray's Exactitude's Connector field, with her healing, energy and passives left unbuilt.

## Requirements

### Requirement: Basic attacks

Dori's normal attacks SHALL be three strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays three strikes in order

- **GIVEN** Dori is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three strikes play in order

### Requirement: Provisional charged attack

Dori's charged attack SHALL be provisional, with a spin that lands at the start and a final hit at its maximum duration, until a recording of the game settles the timings.

#### Scenario: Charging plays the spin and the final hit

- **GIVEN** Dori is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** the spin lands at the start of the charge
- **AND** the final hit lands at the charged attack's maximum duration

### Requirement: Troubleshooter Shot and After-Sales Service Round

Troubleshooter Shot SHALL deal its hit when pressed, and its After-Sales Service Round SHALL land two hits 72 and 85 frames after the press, cooling down before it can be pressed again.

#### Scenario: A press lands the shot and the service round

- **GIVEN** Dori is the character on the field
- **WHEN** the player presses Troubleshooter Shot
- **THEN** its hit lands
- **AND** the After-Sales Service Round lands its two hits 72 and 85 frames after the press

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Troubleshooter Shot was pressed and its cooldown has not ended
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Alcazarzaray's Exactitude's Connector field

Alcazarzaray's Exactitude's Connector SHALL keep ticking until 772 frames after it is cast, past its 12-second duration, and SHALL be refused without the energy it costs.

#### Scenario: The Connector ticks through its schedule

- **GIVEN** Dori has enough energy
- **WHEN** the player casts Alcazarzaray's Exactitude's Connector
- **THEN** its field ticks 32 times
- **AND** the ticks continue until 772 frames after the cast

#### Scenario: The Connector is refused without enough energy

- **GIVEN** Dori has less energy than the burst costs
- **WHEN** the player casts Alcazarzaray's Exactitude's Connector
- **THEN** it does not cast

### Requirement: Poise from the shot, the Connector and the collision

Troubleshooter Shot and the Connector SHALL deal no poise, and the plunging collision SHALL deal 25 poise, a value borrowed from another character.

#### Scenario: The shot and the Connector deal no poise

- **GIVEN** Dori is the character on the field
- **WHEN** Troubleshooter Shot or the Connector hits an enemy
- **THEN** the enemy takes no poise damage

#### Scenario: The plunging collision deals 25 poise

- **GIVEN** Dori is in the air
- **WHEN** her plunging collision hits an enemy
- **THEN** the enemy takes 25 poise damage
