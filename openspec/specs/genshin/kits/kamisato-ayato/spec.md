## Purpose

Kamisato Ayato's kit as built: his strikes, charged attack and plunges, Kamisato Art: Kyouka with its water illusion and Soukai Kanka stance of Shunsuiken strikes and Namisen stacks, and Kamisato Art: Suiyuu's field, with his fourth-ascension and off-field effects left unbuilt.

## Requirements

### Requirement: Five strikes, charged attack and plunges

Kamisato Ayato's five strikes, charged attack, collision and two plunges SHALL be his normal attacks and plunges.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Ayato is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his five strikes play in order and each deals its own hit

### Requirement: Kamisato Art: Kyouka explodes an illusion and starts a stance

Kamisato Art: Kyouka SHALL explode a water illusion 35 frames after its cast and SHALL start the Soukai Kanka stance.

#### Scenario: The illusion explodes after 35 frames

- **GIVEN** Ayato is the character on the field
- **WHEN** the player casts Kamisato Art: Kyouka
- **THEN** the illusion's hit lands 35 frames after the cast
- **AND** the Soukai Kanka stance begins
- **AND** the 35-frame delay stays provisional until a recording settles it

### Requirement: Soukai Kanka strikes build Namisen stacks

While Soukai Kanka lasts, Ayato's normal attacks SHALL be Shunsuiken strikes that add a share of his Max HP per Namisen stack to their damage, and each enemy struck SHALL add a stack.

#### Scenario: A Shunsuiken strike adds damage per stack

- **GIVEN** Soukai Kanka stands and Namisen stacks are held
- **WHEN** a Shunsuiken strike lands on an enemy
- **THEN** its damage rises by a share of Ayato's Max HP for each stack
- **AND** the enemy struck adds one Namisen stack

#### Scenario: Namisen stacks stop at their cap

- **GIVEN** Namisen stacks are at their cap of four or five
- **WHEN** a Shunsuiken strike lands on an enemy
- **THEN** no further stack is added

### Requirement: Leaving the field ends the stacks and the stance

The Namisen stacks and the Soukai Kanka stance SHALL end when Ayato leaves the field.

#### Scenario: Switching Ayato off the field clears the stacks

- **GIVEN** Soukai Kanka stands and Namisen stacks are held
- **WHEN** the player switches Ayato off the field
- **THEN** the stacks are cleared
- **AND** the stance ends

### Requirement: Kamisato Art: Suiyuu's field follows Ayato

Kamisato Art: Suiyuu SHALL raise a field that follows Ayato's body for eighteen seconds and strikes on each of its ticks.

#### Scenario: The field strikes every enemy in reach on each tick

- **GIVEN** Ayato is the character on the field
- **WHEN** the player casts Kamisato Art: Suiyuu
- **THEN** the field follows Ayato's body for eighteen seconds
- **AND** on each tick it strikes every enemy within 12.5 metres of his body, not one random enemy
