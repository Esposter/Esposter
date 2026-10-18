## Purpose

Alhaitham's kit as built, with Universality's tap and hold, Particular Field's burst, the Mirrors they make with their Dendro infusion and Projection Attacks, Constellations 1, 2, 4 and 6, and what is left to build.

## Requirements

### Requirement: Universality's tap and hold act on the press length

Universality SHALL act as a tap when the skill is released quickly and as a hold when it is held past the hold threshold.

#### Scenario: A quick press is a tap

- **GIVEN** Alhaitham presses his skill
- **WHEN** the skill is released before the hold threshold
- **THEN** the tap is performed

#### Scenario: A long press is a hold

- **GIVEN** Alhaitham holds his skill
- **WHEN** the hold passes the hold threshold
- **THEN** the hold is performed

### Requirement: Particular Field strikes four hits plus two for each Mirror

Particular Field SHALL strike four hits plus two more for each Chisel-Light Mirror Alhaitham holds when it is cast.

#### Scenario: Particular Field's hit count grows with the Mirrors

- **GIVEN** Alhaitham holds two Mirrors
- **WHEN** Particular Field is cast
- **THEN** it strikes eight hits

### Requirement: Alhaitham holds up to three Mirrors that decay one at a time

Alhaitham SHALL hold up to three Chisel-Light Mirrors, one made by each use of his skill or burst, one of them decaying every 233 frames, and a swap SHALL clear every Mirror he holds.

#### Scenario: A Mirror decays every 233 frames

- **GIVEN** Alhaitham holds a Mirror
- **WHEN** 233 frames pass
- **THEN** one Mirror is removed

#### Scenario: A further Mirror leaves the decay running

- **GIVEN** Alhaitham holds a Mirror that has been decaying for 100 frames
- **WHEN** he makes a second Mirror
- **THEN** the decay is not restarted, and the next Mirror is removed when the first decay comes due, 233 frames after the first Mirror was made

#### Scenario: A swap clears every Mirror

- **GIVEN** Alhaitham holds one or more Mirrors
- **WHEN** another character is swapped in
- **THEN** every Mirror is cleared

### Requirement: Normal attacks deal Dendro while Alhaitham holds any Mirror

While Alhaitham holds any Mirror his normal attacks, charged attack and plunges SHALL deal Dendro damage, and that infusion SHALL end on a swap or when the burst is cast.

#### Scenario: Holding a Mirror infuses his attacks with Dendro

- **GIVEN** Alhaitham holds one or more Mirrors
- **WHEN** he performs a normal attack
- **THEN** the attack deals Dendro damage

#### Scenario: A swap ends the Dendro infusion

- **GIVEN** Alhaitham's attacks are infused with Dendro
- **WHEN** another character is swapped in
- **THEN** the infusion ends

### Requirement: A Mirror-holding hit triggers a Projection Attack once per cooldown

Each hit that strikes an enemy while Alhaitham holds a Mirror SHALL trigger a Projection Attack that strikes once for each Mirror, and a Projection Attack SHALL NOT trigger again within 1.6 seconds.

#### Scenario: A hit triggers a Projection Attack

- **GIVEN** Alhaitham holds a Mirror and no Projection Attack is on cooldown
- **WHEN** his normal attack strikes an enemy
- **THEN** a Projection Attack strikes once for each Mirror held

#### Scenario: A Projection Attack does not repeat inside its cooldown

- **GIVEN** a Projection Attack has just triggered
- **WHEN** another hit lands inside its cooldown
- **THEN** no further Projection Attack triggers

### Requirement: Ascension 4 adds a damage bonus per point of Elemental Mastery

At Ascension 4 Alhaitham's burst and Projection Attack hits SHALL gain a damage bonus per point of Elemental Mastery.

#### Scenario: Elemental Mastery raises projection damage

- **GIVEN** Alhaitham is at Ascension 4 with Elemental Mastery
- **WHEN** a Projection Attack strikes
- **THEN** its damage includes the bonus per point of his Elemental Mastery

### Requirement: Constellation 1 cuts Universality's cooldown on a Projection Attack's hit

From Constellation 1, a hit of a Projection Attack SHALL cut Universality's running cooldown by 1.2 seconds, at most once a second.

#### Scenario: A Projection Attack's hit cuts the cooldown

- **GIVEN** Alhaitham is at Constellation 1 and Universality's cooldown is running
- **WHEN** a Projection Attack's hit lands
- **THEN** the cooldown is cut by 1.2 seconds

#### Scenario: A second hit within a second cuts nothing

- **GIVEN** a Projection Attack's hit cut Universality's cooldown less than a second ago
- **WHEN** another Projection Attack's hit lands
- **THEN** the cooldown is unchanged

### Requirement: Constellation 2 gives Alhaitham Elemental Mastery for each Mirror made

From Constellation 2, each Mirror made SHALL give Alhaitham 50 Elemental Mastery for 8 seconds, up to four of these at once.

#### Scenario: A Mirror made gives Elemental Mastery

- **GIVEN** Alhaitham is at Constellation 2
- **WHEN** a Mirror is made
- **THEN** Alhaitham gains 50 Elemental Mastery for 8 seconds

#### Scenario: Four Mirrors give four at most

- **GIVEN** four of Constellation 2's buffs are on Alhaitham
- **WHEN** another Mirror is made
- **THEN** no fifth buff is added

### Requirement: Constellation 4 moves Elemental Mastery and Dendro DMG on the burst

From Constellation 4, Particular Field's burst SHALL give each member of the team other than Alhaitham 30 Elemental Mastery per Mirror it consumes, for 15 seconds. The Mirrors the regeneration makes afterwards SHALL give Alhaitham 10% Dendro DMG Bonus per Mirror made, for 15 seconds.

#### Scenario: The burst gives the team Elemental Mastery

- **GIVEN** Alhaitham is at Constellation 4 and holds two Mirrors
- **WHEN** Particular Field's burst is cast
- **THEN** each other member of the team gains 60 Elemental Mastery for 15 seconds

#### Scenario: Regenerated Mirrors give Dendro DMG

- **GIVEN** Alhaitham is at Constellation 4
- **WHEN** the burst's regeneration makes Mirrors
- **THEN** Alhaitham gains 10% Dendro DMG Bonus per Mirror made for 15 seconds

### Requirement: Constellation 6 makes three Mirrors and gives CRIT past three

From Constellation 6, the burst SHALL make three Mirrors whatever it consumed. Each Mirror made past three SHALL give Alhaitham 10% CRIT Rate and 70% CRIT DMG for 6 seconds, and each further one SHALL extend that time by 6 seconds.

#### Scenario: The burst makes three Mirrors

- **GIVEN** Alhaitham is at Constellation 6
- **WHEN** Particular Field's burst consumes all the Mirrors Alhaitham holds
- **THEN** the regeneration makes three Mirrors

#### Scenario: A Mirror past three gives CRIT

- **GIVEN** Alhaitham is at Constellation 6 and holds three Mirrors
- **WHEN** a fourth Mirror is made
- **THEN** Alhaitham gains 10% CRIT Rate and 70% CRIT DMG for 6 seconds
