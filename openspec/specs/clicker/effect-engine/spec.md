## Purpose

How upgrade effects are folded over base power — effect types, targets, and the pure apply pipeline.

## Requirements

### Requirement: Power is recomputed from purchases on every read

The clicker SHALL recompute the power of each building and of each click from the player's purchases every time it is read, and SHALL NOT keep a stored power value.

#### Scenario: Upgrade takes effect immediately

- **GIVEN** a player who has just bought an upgrade that raises production
- **WHEN** the next second of production is counted
- **THEN** the production reflects the upgrade

### Requirement: Building base power is its base value times units owned

A building SHALL contribute its base value multiplied by the number of its units the player owns, before any upgrade effect is applied.

#### Scenario: Base production with no upgrades

- **GIVEN** a player who owns units of a building and has bought no upgrades
- **WHEN** the building's power is read
- **THEN** the power equals the building's base value multiplied by the number of units owned

### Requirement: Each effect is one of four kinds

An upgrade's effect SHALL be exactly one of four kinds: additive, multiplicative, per owned unit of named buildings, or per owned unit of every building other than the named ones.

#### Scenario: Additive effect adds its value

- **GIVEN** a bought upgrade with an additive effect
- **WHEN** the power is read
- **THEN** the effect's value is added to the power

#### Scenario: Multiplicative effect multiplies the power

- **GIVEN** a bought upgrade with a multiplicative effect
- **WHEN** the power is read
- **THEN** the power is multiplied by the effect's value

#### Scenario: Per-unit effect counts the named buildings

- **GIVEN** a bought upgrade with a per-unit effect naming one building
- **WHEN** the power is read
- **THEN** the effect's value is added once for each unit of that building the player owns

#### Scenario: Per-unit effect counts every other building

- **GIVEN** a bought upgrade whose per-unit effect names some buildings to exclude
- **WHEN** the power is read
- **THEN** the effect's value is added once for each unit of every building not excluded

### Requirement: Effects apply in a fixed order

Effects SHALL be applied in a fixed order in which additive effects land before multiplicative effects.

#### Scenario: Multiplier scales the additive amount

- **GIVEN** a bought additive effect and a bought multiplicative effect on the same power
- **WHEN** the power is read
- **THEN** the multiplicative effect scales the power including the amount the additive effect added

### Requirement: An effect aimed at an upgrade changes that upgrade

An effect that targets another upgrade SHALL change that upgrade's own effects instead of changing production directly.

#### Scenario: Effect changes a bought upgrade

- **GIVEN** a bought upgrade whose effect targets a second bought upgrade
- **WHEN** the power is read
- **THEN** the second upgrade's effects are changed as the first upgrade specifies

#### Scenario: Effect aimed at an unbought upgrade changes nothing

- **GIVEN** a bought upgrade whose effect targets an upgrade the player has not bought
- **WHEN** the power is read
- **THEN** the unbought upgrade has no effect on production

### Requirement: A click is worth one point before mouse upgrades

Each click SHALL add one point before any mouse upgrade is applied.

#### Scenario: Click with no mouse upgrades

- **GIVEN** a player who has bought no mouse upgrades
- **WHEN** the player clicks the central item
- **THEN** one point is added
