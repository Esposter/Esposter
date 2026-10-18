## Purpose

Lisa's kit as built: four strikes, a charged attack, Violet Arc's press and its hold, released by itself at 4 seconds, Lightning Rose's thirty discharges, Constellation 1's Energy from the hold, and Constellation 6's Conductive when she takes the field, with the Lightning Rose activation dealing no damage and Constellations 2 and 4 not built.

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

### Requirement: Ascension 1 charged attack stacks

From Ascension 1, each enemy Lisa's charged attack strikes SHALL gain one Conductive stack, up to three per enemy.

#### Scenario: Charged attack at Ascension 1 adds a stack

- **GIVEN** Lisa has her first ascension
- **WHEN** her charged attack strikes an enemy
- **THEN** that enemy gains one Conductive stack

#### Scenario: Charged attack below Ascension 1 adds none

- **GIVEN** Lisa has not reached her first ascension
- **WHEN** her charged attack strikes an enemy
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

### Requirement: Constellation 6 Conductive on taking the field

From Constellation 6, when Lisa takes the field, each opponent within 5 metres of her SHALL gain three stacks of Conductive, once every 5 seconds.

#### Scenario: Constellation 6 stacks Conductive on opponents near Lisa

- **GIVEN** Lisa has Constellation 6
- **WHEN** she takes the field
- **THEN** each opponent within 5 metres of her gains three stacks of Conductive
- **AND** an opponent farther away gains none

#### Scenario: A swap within 5 seconds of the last gives no stacks

- **GIVEN** Constellation 6 stacked Conductive less than 5 seconds ago
- **WHEN** Lisa takes the field again
- **THEN** no stacks are added

#### Scenario: Another character taking the field, or below Constellation 6, changes nothing

- **GIVEN** Lisa has Constellation 5, or another character takes the field
- **WHEN** the swap happens
- **THEN** no stacks are added

### Requirement: Constellation 1 Energy from Violet Arc's hold

From Constellation 1, each opponent Violet Arc's hold strikes SHALL regenerate 2 Energy for Lisa, and one hold SHALL regenerate no more than 10 Energy in all.

#### Scenario: Each opponent a hold strikes regenerates Energy

- **GIVEN** Lisa has Constellation 1
- **WHEN** a Violet Arc hold strikes three opponents
- **THEN** Lisa regenerates 6 Energy

#### Scenario: One hold regenerates at most 10 Energy

- **GIVEN** Lisa has Constellation 1
- **WHEN** a Violet Arc hold strikes six opponents
- **THEN** Lisa regenerates 10 Energy

#### Scenario: Below Constellation 1 a hold regenerates no Energy

- **GIVEN** Lisa has Constellation 0
- **WHEN** a Violet Arc hold strikes an opponent
- **THEN** Lisa regenerates no Energy

### Requirement: Unbuilt Lisa effects

Lisa's Constellations 2 and 4 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Lisa has Constellation 2 or 4
- **WHEN** the player fights with Lisa
- **THEN** that effect has no effect
