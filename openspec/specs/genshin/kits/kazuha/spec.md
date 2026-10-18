## Purpose

Kazuha's kit as built: Chihayaburu's press and hold, and Kazuha Slash with its five-tick Autumn Whirlwind, with the absorption-dependent passives not built.

## Requirements

### Requirement: Five strikes and two-slash charged attack

Kazuha's five strikes, two-slash charged attack, collision and two plunges SHALL be his normal attacks and plunges.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Kazuha is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his five strikes play in order

#### Scenario: Charged attack plays two slashes

- **GIVEN** Kazuha is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack plays two slashes

### Requirement: Chihayaburu releases as a press or a hold

Chihayaburu SHALL release as a press when tapped and as a hold when held for half a second, and the half-second threshold SHALL stay provisional until a recording settles it.

#### Scenario: A tap releases the press

- **GIVEN** Kazuha is the character on the field
- **WHEN** the player taps Chihayaburu
- **THEN** Chihayaburu releases as a press

#### Scenario: A hold of half a second releases the hold

- **GIVEN** Kazuha is the character on the field
- **WHEN** the player holds Chihayaburu for half a second or longer
- **THEN** Chihayaburu releases as its hold
- **AND** the half-second threshold stays provisional until a recording settles it

### Requirement: Skill, burst and collision deal no poise

Kazuha's skill, burst and collision SHALL deal no poise, a provisional value until a recording settles it.

#### Scenario: A hit from the skill, burst or collision deals no poise

- **GIVEN** Kazuha is on the field
- **WHEN** a hit from his skill, his burst or his collision lands
- **THEN** it deals no poise

### Requirement: Kazuha Slash raises an Autumn Whirlwind

Kazuha Slash SHALL raise an Autumn Whirlwind that ticks five times with Anemo, reaching 9 metres round where he cast it.

#### Scenario: The Autumn Whirlwind ticks five times

- **GIVEN** Kazuha is the character on the field
- **WHEN** the player casts Kazuha Slash
- **THEN** the Autumn Whirlwind ticks five times with Anemo
- **AND** each tick reaches 9 metres round where he cast it

### Requirement: The Autumn Whirlwind takes one elemental aura

The Autumn Whirlwind SHALL take one aura, in the order Pyro, Hydro, Electro and Cryo, from an enemy within its reach.

#### Scenario: An absorb check takes an aura

- **GIVEN** an enemy within reach holds Pyro
- **WHEN** an absorb check runs from 81 frames in, every 18 frames, at most 17 times
- **THEN** the Autumn Whirlwind takes Pyro

#### Scenario: Each later Anemo tick is preceded by an elemental tick

- **GIVEN** the Autumn Whirlwind has taken an aura
- **WHEN** an Anemo tick comes due
- **THEN** an elemental tick of 1 unit of gauge in the taken element lands just before it
- **AND** the Anemo tick Swirls that element

#### Scenario: No second aura is taken

- **GIVEN** the Autumn Whirlwind has taken an aura
- **WHEN** later absorb checks run
- **THEN** no further element is taken

### Requirement: Constellations 1 and 6 change cooldowns and infuse

Kazuha's first constellation SHALL cut a tenth off both of his skill cooldowns, and his sixth SHALL give him an Anemo infusion for five seconds after each press, hold or slash.

#### Scenario: The first constellation shortens skill cooldowns

- **GIVEN** Kazuha is at constellation 1
- **WHEN** one of his skill cooldowns runs
- **THEN** it is a tenth shorter

#### Scenario: The sixth constellation infuses his attacks with Anemo

- **GIVEN** Kazuha is at constellation 6
- **WHEN** he presses, holds or slashes
- **THEN** he is infused with Anemo for five seconds
