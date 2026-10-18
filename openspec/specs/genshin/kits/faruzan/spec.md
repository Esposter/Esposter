## Purpose

Faruzan's kit as built, with Wind Realm of Nasamjnin, The Wind's Secret Ways' Dazzling Polyhedron and its Whirlwind Pulses, and what is left of the Manifest Gale, Pressurized Collapse and her particles, passive and constellations.

## Requirements

### Requirement: Basic attacks

Faruzan's normal attacks SHALL be four strikes, a fully charged shot, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Faruzan is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four strikes play in order

### Requirement: Borrowed poise on the shot and plunges

Faruzan's fully charged shot and plunges SHALL deal poise borrowed from other characters, 20 for the shot, 50 for the low plunge and 100 for the high plunge.

#### Scenario: The fully charged shot deals 20 poise

- **GIVEN** Faruzan is the character on the field
- **WHEN** her fully charged shot hits an enemy
- **THEN** the enemy takes 20 poise damage

#### Scenario: The plunges deal 50 and 100 poise

- **GIVEN** Faruzan is in the air
- **WHEN** her low plunge and then her high plunge hit enemies
- **THEN** the low plunge deals 50 poise damage and the high plunge deals 100 poise damage

### Requirement: Wind Realm of Nasamjnin

Wind Realm of Nasamjnin SHALL deal its hit in a circle centred three metres ahead of Faruzan, and it SHALL cool down before it can be pressed again.

#### Scenario: Wind Realm of Nasamjnin deals its hit

- **GIVEN** Faruzan is the character on the field
- **WHEN** the player presses Wind Realm of Nasamjnin
- **THEN** its hit lands in the circle ahead of her

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Wind Realm of Nasamjnin was pressed and its cooldown has not ended
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: The Wind's Secret Ways and Dazzling Polyhedron

The Wind's Secret Ways SHALL deal its initial hit and set Dazzling Polyhedron standing for 745 frames, and it SHALL be refused without the energy it costs.

#### Scenario: The burst sets the polyhedron standing

- **GIVEN** Faruzan has enough energy
- **WHEN** the player casts The Wind's Secret Ways
- **THEN** its initial hit lands
- **AND** Dazzling Polyhedron stands for 745 frames, about 12.4 seconds

#### Scenario: The burst is refused without enough energy

- **GIVEN** Faruzan has less than the burst costs
- **WHEN** the player casts The Wind's Secret Ways
- **THEN** it does not cast

### Requirement: Whirlwind Pulses

While Dazzling Polyhedron stands, it SHALL fire Whirlwind Pulses, the first three seconds after the cast and then every two seconds, each lowering the Perfidious Wind's Ruin RES of enemies within 6 metres of the gadget that fires it.

#### Scenario: The first Pulse fires three seconds after the cast

- **GIVEN** Dazzling Polyhedron has just been cast
- **WHEN** three seconds pass
- **THEN** the first Whirlwind Pulse fires and lowers the RES of enemies within 6 metres of its gadget

#### Scenario: No Pulse fires after the polyhedron ends

- **GIVEN** Dazzling Polyhedron has stood for 745 frames
- **WHEN** the next Pulse would fire
- **THEN** no Pulse fires

### Requirement: Prayerful Wind's Gift

Dazzling Polyhedron SHALL give every member of the deployed team Prayerful Wind's Anemo DMG Bonus at the cast and at each Pulse, lasting four seconds.

#### Scenario: A Pulse refreshes the bonus for the team

- **GIVEN** Dazzling Polyhedron stands
- **WHEN** a Whirlwind Pulse fires
- **THEN** every member of the deployed team gains the Anemo DMG Bonus for four seconds

### Requirement: Second constellation lengthens the Dazzling Polyhedron by 6 seconds

From constellation 2, the Dazzling Polyhedron's field SHALL last 6 seconds longer, and its Whirlwind Pulses SHALL continue at their interval through the extra time.

#### Scenario: A Faruzan at constellation 2 gets the longer field

- **GIVEN** Faruzan is at constellation 2
- **WHEN** she casts her burst
- **THEN** the Dazzling Polyhedron's field lasts 6 seconds longer than at constellation 1

#### Scenario: A Faruzan below constellation 2 gets the base field

- **GIVEN** Faruzan is at constellation 1
- **WHEN** she casts her burst
- **THEN** the Dazzling Polyhedron's field lasts as long as the base talent gives
