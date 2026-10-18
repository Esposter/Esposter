## Purpose

Lisa's kit as built: four strikes, a charged attack, Violet Arc's press and its hold, released by itself at 4 seconds, and Lightning Rose's thirty discharges, with the Lightning Rose activation dealing no damage.

## Requirements

### Requirement: Lisa's strikes and charged attack

Lisa's four strikes SHALL land in order, and her charged attack SHALL land on the enemies within reach, each hit applying Electro gauge.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack lands

- **WHEN** the player uses the charged attack
- **THEN** its hits land on the enemies within reach

### Requirement: Violet Arc's press and Conductive stacks

Violet Arc's press SHALL apply one Conductive stack to each enemy it strikes, up to three per enemy, and Conductive stacks SHALL NOT expire.

#### Scenario: Each press hit adds a stack

- **WHEN** the player presses Violet Arc and it strikes an enemy
- **THEN** that enemy gains one Conductive stack

#### Scenario: Stacks stop at three

- **GIVEN** an enemy already has three Conductive stacks
- **WHEN** another press hit strikes it
- **THEN** the enemy keeps three stacks

#### Scenario: Normal attacks apply no stacks

- **WHEN** the player uses a normal attack that strikes an enemy
- **THEN** no Conductive stack is applied

### Requirement: Violet Arc's hold

Holding Violet Arc SHALL release the hold on its own after 4 seconds, and the hold SHALL strike each enemy for more damage and poise the more Conductive stacks it has, consuming those stacks.

#### Scenario: Hold releases after four seconds

- **WHEN** the player holds Violet Arc for four seconds
- **THEN** the hold is released by itself

#### Scenario: Hold reads and consumes the stacks

- **GIVEN** an enemy holds Conductive stacks
- **WHEN** the hold strikes that enemy
- **THEN** the damage and poise scale with its stacks
- **AND** those stacks are consumed

### Requirement: Lightning Rose's discharges

Lightning Rose SHALL deliver thirty discharges on the enemies within its reach, and its activation SHALL deal no damage.

#### Scenario: Activation deals no damage

- **WHEN** the player activates Lightning Rose
- **THEN** no damage is dealt

#### Scenario: Discharges land on the enemies in reach

- **GIVEN** Lightning Rose is standing
- **WHEN** its discharges come due
- **THEN** each discharge lands on the enemies within reach

### Requirement: Lisa's plunge attacks

Lisa's plunge attacks SHALL land a collision and two plunges on the enemies within reach.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach
