## Purpose

Yelan's kit as built, with Lingering Lifeline and Depth-Clarion Dice's field of Exquisite Throws, and what is left of Breakthrough Barb and Constellations 4 and 6, with Constellations 1 and 2 and her Ascension 1 and 4 passives built.

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

### Requirement: Constellation 1 charge

From Constellation 1, Lingering Lifeline SHALL have one more charge than its base.

#### Scenario: Constellation 1 adds a charge

- **GIVEN** Yelan has Constellation 1
- **WHEN** her skill's charges are read
- **THEN** it has one more charge than the base

#### Scenario: Constellation 0 adds nothing

- **GIVEN** Yelan has no constellation
- **WHEN** her skill's charges are read
- **THEN** no charge is added

### Requirement: Constellation 2 hit on the primary enemy

From Constellation 2, each Exquisite Throw volley SHALL add a hit of 14% of Yelan's Max HP on the primary enemy, 17 frames after the volley, and no such hit SHALL come within 1.8 seconds of the last.

#### Scenario: A volley adds a hit on the primary enemy

- **GIVEN** Yelan has Constellation 2, Depth-Clarion Dice stands and an enemy is the primary target
- **WHEN** an Exquisite Throw volley is thrown
- **THEN** the primary enemy takes a 14% of Max HP hit 17 frames after the volley

#### Scenario: The hit waits out its interval

- **GIVEN** Yelan has Constellation 2 and a hit on the primary enemy landed 1 second ago
- **WHEN** another volley is thrown
- **THEN** no further hit on the primary enemy is added

#### Scenario: Constellation 1 adds no hit

- **GIVEN** Yelan has Constellation 1
- **WHEN** an Exquisite Throw volley is thrown
- **THEN** no hit on the primary enemy is added

### Requirement: Breakthrough Barb and Constellations 4 and 6 not built

Breakthrough Barb and Yelan's Constellations 4 and 6 SHALL have no effect yet.

#### Scenario: Lifeline hits without Barb

- **WHEN** Lingering Lifeline hits an enemy
- **THEN** no Breakthrough Barb roll occurs
