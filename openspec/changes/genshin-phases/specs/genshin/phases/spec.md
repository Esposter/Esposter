## ADDED Requirements

### Requirement: Every unit of Genshin work belongs to exactly one phase

Every open Genshin change and every open item of the Genshin roadmap SHALL name the one phase whose exit gate fails without it, and a compute item SHALL take the phase of the area it measures.

#### Scenario: A genshin change names its phase

- **GIVEN** an open change whose first affected area is genshin
- **WHEN** its metadata is read
- **THEN** it names exactly one phase

#### Scenario: An open roadmap item sits in a phase section

- **GIVEN** the Genshin roadmap with an open item
- **WHEN** the roadmap is read
- **THEN** the item sits under the heading of one phase

#### Scenario: A compute item takes its area's phase

- **GIVEN** a compute page for an area that holds a phase
- **WHEN** its items are classified
- **THEN** each item has that area's phase

### Requirement: Work is taken from the lowest phase with a runnable unit

The fleet SHALL offer a machine the first unit of the lowest phase that the machine can run and no claim holds, and SHALL pass over a phase whose units all wait on the other machine or an input.

#### Scenario: The lowest phase with a runnable unit is taken first

- **GIVEN** open units in phases 1 and 3, both runnable on this machine
- **WHEN** the machine asks for its next unit
- **THEN** it is offered the phase 1 unit

#### Scenario: A phase whose units wait on the other machine is passed over

- **GIVEN** every open unit of phase 1 needs the game install this machine lacks, and a unit of phase 3 is runnable
- **WHEN** the machine asks for its next unit
- **THEN** it is offered the phase 3 unit

### Requirement: A unit is done by the check of its kind

A unit SHALL count as done only when the check its kind defines passes, and a unit whose kind has no command to check it SHALL be reported as not measurable and never as passing.

#### Scenario: A screen is done when every id is under its bar

- **GIVEN** a screen with three parity ids, two under their bars and one over
- **WHEN** the screen's check is read
- **THEN** the screen is not done

#### Scenario: A check with no command is not measurable

- **GIVEN** a quest unit and no scripted-session harness
- **WHEN** the report reads the quest's check
- **THEN** the check prints as not measurable

### Requirement: Progress is computed from the tree

The progress report SHALL derive every phase's counts from the checkboxes, the compute pages and the units' needs, and no page SHALL restate a count.

#### Scenario: A phase's progress counts its units by kind

- **GIVEN** a phase with two screens, one of them done, and one region
- **WHEN** the report is printed
- **THEN** the phase lists two screens with one done and one region
