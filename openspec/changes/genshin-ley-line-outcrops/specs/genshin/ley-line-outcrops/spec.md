## ADDED Requirements

### Requirement: Touching an outcrop spawns its region's enemies

Touching an outcrop SHALL spawn its region's enemies at the World Level's level within the outcrop's fight radius.

#### Scenario: Touching an outcrop spawns its enemies

- **GIVEN** the player is in a region with an outcrop still waiting
- **WHEN** the player touches the outcrop
- **THEN** the region's enemies appear at the World Level's level
- **AND** they appear within the outcrop's fight radius

### Requirement: The blossom appears once the outcrop's enemies are defeated

The Ley Line Blossom SHALL appear once every enemy an outcrop spawned has been defeated.

#### Scenario: Defeating the last enemy reveals the blossom

- **GIVEN** an outcrop's enemies have been spawned
- **WHEN** the player defeats the last of them
- **THEN** the Ley Line Blossom appears at the outcrop

#### Scenario: An outcrop with an enemy still alive shows no blossom

- **GIVEN** an outcrop's enemies have been spawned
- **WHEN** at least one of them is still alive
- **THEN** no Ley Line Blossom is shown

### Requirement: Claiming a blossom pays the reward row for the reader's World Level

Claiming a Ley Line Blossom SHALL pay the reward row for the reader's World Level, and a World Level past the list SHALL pay the last row.

#### Scenario: World Level 0 claims the first reward row

- **GIVEN** the reader's World Level is 0
- **WHEN** the reader claims a blossom
- **THEN** the reward is the first row of the blossom's reward list

#### Scenario: World Level 9 claims the last of nine rows

- **GIVEN** the reader's World Level is 9 and the blossom's reward list has nine rows
- **WHEN** the reader claims a blossom
- **THEN** the reward is the ninth row of the list

#### Scenario: A claim without enough resin is refused

- **GIVEN** the reader holds less resin than a claim costs
- **WHEN** the reader tries to claim a blossom
- **THEN** the claim is refused
- **AND** the blossom stays unclaimed

### Requirement: A cleared outcrop stays until the daily reset

A cleared but unclaimed outcrop SHALL stay where it is until the daily reset.

#### Scenario: A cleared outcrop stays in place until the reset

- **GIVEN** an outcrop has been cleared and its blossom is not claimed
- **WHEN** the day has not yet reset
- **THEN** the outcrop stays in its place
- **AND** nothing moves

### Requirement: A claimed outcrop moves to the next place in its group

A claimed outcrop SHALL move to the next place in its group.

#### Scenario: Claiming moves the outcrop to its group's next place

- **GIVEN** an outcrop has been claimed
- **WHEN** the claim completes
- **THEN** the outcrop waits at the next place in its group

### Requirement: The daily reset draws new outcrop places

The daily reset SHALL start each open outcrop kind over at a newly drawn place.

#### Scenario: The daily reset draws new places for open outcrops

- **GIVEN** an outcrop kind is open to the reader
- **WHEN** the daily reset happens
- **THEN** the kind's outcrops wait at newly drawn places
