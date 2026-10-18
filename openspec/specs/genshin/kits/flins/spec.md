## Purpose

Flins's kit as built, with his five strikes, charged attack, provisional plunges, Manifest Flame's press and the stance it starts, and Cometh the Night's initial and final hits, and what is left waiting on the Lunar-Charged hook and a stance's own skill cooldown.

## Requirements

### Requirement: Basic attacks

Flins's normal attacks SHALL be five physical strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays five strikes on their hit frames

- **GIVEN** Flins is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his five strikes land at 11, 11, 16, 20 and 29 frames into their animations, the fourth strike hitting twice

### Requirement: Charged attack box

Flins's charged attack SHALL hit a box on the near edge of his body, and it SHALL cost 25 stamina.

#### Scenario: The charged attack hits the box at 28 frames

- **GIVEN** Flins has 25 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack hits a box of 4 by 6 metres at 28 frames of its 60-frame animation
- **AND** 25 stamina is spent

### Requirement: Manifest Flame stance

Pressing Manifest Flame SHALL deal no damage and start a 10-second stance in which Flins's strikes and charged attack become Electro, the stance ending when he is swapped out.

#### Scenario: The stance makes his attacks Electro

- **GIVEN** Flins is the character on the field
- **WHEN** the player presses Manifest Flame
- **THEN** no damage is dealt
- **AND** his strikes and charged attack deal Electro damage for 10 seconds

#### Scenario: Swapping him out ends the stance

- **GIVEN** the stance stands
- **WHEN** the player swaps Flins out
- **THEN** the stance ends

#### Scenario: Pressing Manifest Flame again restarts the stance

- **GIVEN** the stance stands with time left
- **WHEN** the player presses Manifest Flame again
- **THEN** the stance restarts its 10 seconds

### Requirement: Cometh the Night hits

Cometh the Night SHALL deal an initial Electro hit 93 frames after it is cast and a final hit 164 frames after, each in a circle of 7 metres round Flins.

#### Scenario: The initial and final hits land

- **GIVEN** Flins has enough energy
- **WHEN** the player casts Cometh the Night
- **THEN** the initial Electro hit lands at 93 frames
- **AND** the final hit lands at 164 frames, after its 130-frame animation

### Requirement: Cometh the Night cooldown

Cometh the Night SHALL cool for 15 seconds before it can be cast again, a provisional value against the 20 seconds the game's table gives until a recording settles it.

#### Scenario: A cast during the cooldown does nothing

- **GIVEN** Cometh the Night was cast less than 15 seconds ago
- **WHEN** the player casts it again
- **THEN** it does not cast

### Requirement: Provisional plunges

Flins's plunges SHALL take timings and poise borrowed from another character, provisional until a recording of the game settles them.

#### Scenario: A recording settles the plunges

- **GIVEN** a recording of Flins's plunge exists
- **WHEN** its timing and poise are compared with the kit's
- **THEN** the borrowed values stay provisional until the comparison settles them
