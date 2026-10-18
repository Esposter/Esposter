## Purpose

Yelan's kit as built, with Lingering Lifeline and Depth-Clarion Dice's field of Exquisite Throws, and what is left of Breakthrough Barb and her passives and constellations.

## Requirements

### Requirement: Strikes and charged shot

Yelan's normal attack SHALL be four strikes, followed by a fully charged shot with its arrow, a collision and two plunges.

#### Scenario: Normal attack lands four strikes

- **WHEN** the player strikes with Yelan's normal attack
- **THEN** four strikes land in order

### Requirement: Lingering Lifeline

Yelan's skill SHALL deal Lingering Lifeline's hit, and each hit SHALL deal damage scaled by a share of her Max HP.

#### Scenario: Skill hit lands

- **WHEN** the player presses Yelan's skill
- **THEN** Lingering Lifeline's hit lands on the enemies it reaches
- **AND** each enemy struck takes damage scaled by her Max HP

#### Scenario: Skill press during its cooldown

- **WHEN** the player presses Yelan's skill while its cooldown is still running
- **THEN** no hit lands

### Requirement: Depth-Clarion Dice field

Yelan's burst SHALL start a field that waves an Exquisite Throw each second and throws one more on each Lingering Lifeline hit while the field stands.

#### Scenario: Burst starts the field

- **WHEN** the player casts Yelan's burst
- **THEN** its initial hit lands and the field's waves begin a second later

#### Scenario: Lifeline hit throws a dart

- **GIVEN** the field stands
- **WHEN** a Lingering Lifeline hit lands
- **THEN** an Exquisite Throw is thrown

#### Scenario: Throw timing

- **WHEN** a wave is waved
- **THEN** its throws land 20, 26 and 32 frames after it

### Requirement: Breakthrough Barb and passives not built

Breakthrough Barb, Yelan's passives and her constellations SHALL have no effect yet.

#### Scenario: Lifeline hits without Barb

- **WHEN** Lingering Lifeline hits an enemy
- **THEN** no Breakthrough Barb roll occurs
