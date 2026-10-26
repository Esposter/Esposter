## Purpose

Flins's kit as built, with his five strikes, charged attack, provisional plunges, Manifest Flame's press and the stance it starts, and Cometh the Night's initial, middle and final hits, with his first constellation's Energy built, and what is left waiting on the Lunar-Charged hook and a stance's own skill cooldown.

## Requirements

### Requirement: Basic attacks

Flins's normal attacks SHALL be five physical strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays five strikes on their hit frames

- **GIVEN** Flins is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his five strikes land their hits at 11, 11, 16, 20, 29 and 29 frames into their animations, the fourth strike hitting at 20 and 29 and the fifth at 29

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

Cometh the Night SHALL deal an initial Electro hit 93 frames after it is cast, two middle hits at 110 and 119 frames, and a final hit 164 frames after, each in a circle of 7 metres round Flins. Two more middle hits, at 128 and 137 frames, SHALL land while the team is at Ascendant Gleam.

#### Scenario: The initial and final hits land

- **GIVEN** Flins has enough energy
- **WHEN** the player casts Cometh the Night
- **THEN** the initial Electro hit lands at 93 frames
- **AND** the final hit lands at 164 frames, after its 130-frame animation

#### Scenario: Ascendant Gleam adds two middle hits

- **GIVEN** Flins has enough energy and the team is at Ascendant Gleam
- **WHEN** the player casts Cometh the Night
- **THEN** four middle hits land, at 110, 119, 128 and 137 frames

### Requirement: Cometh the Night cooldown

Cometh the Night SHALL cool for the game's 20 seconds before it can be cast again, as its table and the wiki give it; gcsim's 15 is not taken, and the built value is open in the design.

#### Scenario: A cast during the cooldown does nothing

- **GIVEN** Cometh the Night was cast less than 20 seconds ago
- **WHEN** the player casts it again
- **THEN** it does not cast

### Requirement: Provisional plunges

Flins's plunges SHALL take their timings from another character's gcsim plunge file and their poise from his own Pocztowy Demonspear page, provisional until a recording of the game settles them.

#### Scenario: A recording settles the plunges

- **GIVEN** a recording of Flins's plunge exists
- **WHEN** its timing and poise are compared with the kit's
- **THEN** the borrowed values stay provisional until the comparison settles them

### Requirement: Fourth constellation raises Flins's ATK by 20%

From constellation 4, Flins's ATK SHALL be raised by 20% as a passive bonus. Its change to Whispering Flame, 10% up to 220 Elemental Mastery, is not built.

#### Scenario: A Flins at constellation 4 gets the ATK bonus

- **GIVEN** Flins is at constellation 4
- **WHEN** his passive bonuses are read
- **THEN** they include an ATK percent bonus of 20%

#### Scenario: A Flins below constellation 4 gets no bonus

- **GIVEN** Flins is at constellation 3
- **WHEN** his passive bonuses are read
- **THEN** they are empty

### Requirement: First constellation gives Energy on a Lunar-Charged reaction

From constellation 1, a Lunar-Charged reaction that any member of the team triggers SHALL give Flins 8 Energy, and it SHALL do so once every 5.5 seconds.

#### Scenario: A Lunar-Charged reaction gives Energy

- **GIVEN** Flins is at constellation 1
- **WHEN** a Lunar-Charged reaction is triggered on an enemy
- **THEN** Flins gains 8 Energy

#### Scenario: A second reaction within 5.5 seconds gives nothing

- **GIVEN** Flins is at constellation 1 and a Lunar-Charged reaction gave him Energy less than 5.5 seconds ago
- **WHEN** another Lunar-Charged reaction is triggered
- **THEN** Flins gains no Energy

#### Scenario: A Flins below constellation 1 gains no Energy

- **GIVEN** Flins is at constellation 0
- **WHEN** a Lunar-Charged reaction is triggered
- **THEN** Flins gains no Energy
