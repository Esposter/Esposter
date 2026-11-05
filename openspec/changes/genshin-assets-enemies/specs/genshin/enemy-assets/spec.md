## ADDED Requirements

### Requirement: Enemies nearer the character are drawn first

An enemy nearer the character SHALL be drawn before one farther away, and when the draw is full the farther enemies stay undrawn.

#### Scenario: An enemy beside the character is drawn when more are loaded than the draw holds

- **GIVEN** more enemies are loaded than the draw holds
- **WHEN** the enemies are drawn
- **THEN** the enemies nearest the character are drawn, up to the draw's capacity

#### Scenario: A farther enemy is not drawn once the draw is full

- **GIVEN** the draw holds as many enemies as its capacity, and one more enemy stands farther away than all of them
- **WHEN** the enemies are drawn
- **THEN** the farther enemy is not drawn

### Requirement: A defeated enemy drops what its drop family gives

A defeated enemy SHALL drop the Mora and materials its drop family gives; an enemy with no drop family drops neither.

#### Scenario: A defeated common enemy drops its family's Mora and materials

- **GIVEN** a common enemy whose kind has a drop family
- **WHEN** it is defeated
- **THEN** it drops the Mora and materials its family's table gives for its level band

#### Scenario: A defeated enemy with no drop family drops no Mora or materials

- **GIVEN** an enemy whose kind has no drop family
- **WHEN** it is defeated
- **THEN** it drops no Mora and no materials

### Requirement: An enemy with a fitted body is drawn with it

An enemy whose kind has a fitted body SHALL be drawn with that body in place of its capsule.

#### Scenario: An enemy with a fitted body is drawn with it

- **GIVEN** an enemy whose kind has a fitted body
- **WHEN** it is drawn
- **THEN** the body stands where the enemy stands, turned to its heading, in place of the capsule

#### Scenario: A kind with no fitted body keeps its capsule

- **GIVEN** an enemy whose kind has no fitted body
- **WHEN** it is drawn
- **THEN** its capsule is drawn as before

### Requirement: A windup shows a telegraph of its reach

An enemy in its windup SHALL show a ground telegraph of its attack's reach until the windup passes.

#### Scenario: An enemy in windup shows a telegraph of its reach

- **GIVEN** an enemy in its windup
- **WHEN** it is drawn
- **THEN** a ground telegraph of its attack's reach is drawn beneath it
- **AND** the telegraph stays until the windup passes

#### Scenario: An enemy not winding up shows no telegraph

- **GIVEN** an enemy that is not in its windup
- **WHEN** it is drawn
- **THEN** no telegraph is drawn beneath it

### Requirement: An attack deals the damage its combat table gives

An enemy's attack SHALL deal the damage its combat table gives it; an attack the table does not name strikes at the flat strike.

#### Scenario: An enemy's attack deals the damage its combat table gives

- **GIVEN** an enemy whose combat table gives one of its attacks a damage multiplier
- **WHEN** it lands that attack on a target
- **THEN** the target takes the damage the multiplier gives from the enemy's attack

#### Scenario: An attack the table does not name strikes at the flat strike

- **GIVEN** an enemy whose combat table names no damage for an attack it makes
- **WHEN** the attack lands on a target
- **THEN** the target takes the flat strike's damage from the enemy's attack
