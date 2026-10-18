## Purpose

Illuga's kit as built: his four strikes, charged attack, plunges, Press of his skill and burst's two hits, with his skill's Hold not built and his timings provisional.

## Requirements

### Requirement: Four strikes

Illuga's four strikes SHALL play in order from the attack button as his normal attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Illuga is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order

### Requirement: Charged attack and plunges

Illuga's charged attack and plunges SHALL each deal their own hits.

#### Scenario: Charged attack deals its hits

- **GIVEN** Illuga is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack deals its own hits

#### Scenario: Plunge deals its own hit

- **GIVEN** Illuga is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its own hit

### Requirement: Skill's Press deals two hits

Pressing Illuga's skill SHALL deal the two hits of its Press.

#### Scenario: Pressing the skill lands the Press

- **GIVEN** Illuga is the character on the field
- **WHEN** the player presses the skill
- **THEN** the two hits of the Press land

#### Scenario: Holding the skill deals only the Press

- **GIVEN** Illuga is the character on the field
- **WHEN** the player holds the skill
- **THEN** the two Press hits land alone
- **AND** no hit of the Hold is dealt

### Requirement: Burst deals two hits

Illuga's burst SHALL deal its two hits.

#### Scenario: Casting the burst lands both hits

- **GIVEN** Illuga is the character on the field
- **WHEN** the player casts the burst
- **THEN** both of its hits land

### Requirement: Provisional timings and areas

Illuga's hit timings and areas SHALL stay provisional, borrowed from other characters' attacks, until a recording of his attacks settles them.

#### Scenario: A recording settles the timings

- **GIVEN** a recording of Illuga's attacks exists
- **WHEN** its timings and areas are compared with the kit's
- **THEN** the timings and areas stay provisional until the comparison settles them
