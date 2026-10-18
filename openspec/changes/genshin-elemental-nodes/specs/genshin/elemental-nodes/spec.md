## ADDED Requirements

### Requirement: A node pulses once every fifteen seconds

An Elemental Node SHALL pulse once every fifteen seconds, and a step that passes more than one pulse's time SHALL count each pulse it passes.

#### Scenario: A node pulses once each fifteen seconds

- **GIVEN** a node whose next pulse is fifteen seconds away
- **WHEN** fifteen seconds pass
- **THEN** the node pulses once
- **AND** its next pulse is fifteen seconds away again

#### Scenario: A long step counts each pulse it passes

- **GIVEN** a node whose next pulse is fifteen seconds away
- **WHEN** thirty-five seconds pass
- **THEN** the node pulses twice

### Requirement: A pulse lays its element on an enemy in reach

A node's pulse SHALL lay its element on each enemy in its reach, the full gauge on an enemy without the buff, and on an enemy with it a further 1.2 gauge up to 3.6, and the gauge SHALL NOT decay with time.

#### Scenario: An unbuffed enemy gains the node's full gauge, which does not decay

- **GIVEN** an enemy carries no node's buff
- **WHEN** a node pulses on it
- **THEN** the enemy gains 3.6 gauge of the node's element
- **AND** the gauge does not decay

#### Scenario: A buffed enemy gains 1.2 more gauge, up to 3.6

- **GIVEN** an enemy carries a node's buff with less than 3.6 gauge
- **WHEN** a node pulses on it
- **THEN** the enemy gains 1.2 more gauge
- **AND** its gauge is at most 3.6

#### Scenario: A pulse on an enemy cooling down spends the pulse and lays nothing

- **GIVEN** an enemy is cooling down from a depleted buff, with two pulses left
- **WHEN** a node pulses on it
- **THEN** the enemy gains no gauge
- **AND** one pulse is left

### Requirement: A buffed enemy resists more while the buff lasts

An enemy carrying a node's buff SHALL resist 50% more to every damage type, and 50% more again to the node's own element, for as long as the buff's gauge lasts.

#### Scenario: A buffed enemy resists more to its node's element and to every other while the buff lasts

- **GIVEN** an enemy carries a node's buff of an element
- **WHEN** its resistance is read
- **THEN** it resists 100% more to that element
- **AND** it resists 50% more to every other element and to physical hits

### Requirement: A reaction spending the buff ends it

A reaction that spends a node's buff SHALL end the buff at the next step, and its enemy SHALL wait two pulses before the buff can return. A buff still held SHALL be kept through a step.

#### Scenario: A buff a reaction depletes is lifted at the next step and its enemy waits two pulses to regain it

- **GIVEN** an enemy carries a node's buff
- **WHEN** a reaction spends the buff's gauge
- **AND** the next step runs
- **THEN** the buff is lifted
- **AND** the enemy waits two pulses before the buff can return

#### Scenario: A buff still held is kept through a step

- **GIVEN** an enemy carries a node's buff with gauge left
- **WHEN** the next step runs
- **THEN** the buff is kept
- **AND** the enemy waits no pulses
