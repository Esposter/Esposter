## Purpose

A new screen is derived in passes, each answering one kind of unknown from its most exact source and judged by its own measure, in the order the page runs them.

## Requirements

### Requirement: Passes run in a fixed order, each after the one before holds

A screen's passes SHALL run in a fixed order, and each pass SHALL be judged by its own measure before the next pass runs.

#### Scenario: Screen derived

- **GIVEN** a new screen or a new piece of one
- **WHEN** it is derived
- **THEN** each pass runs in the order the page gives
- **AND** a pass runs only after the passes before it hold

### Requirement: The frame's score is the screen's acceptance, not the measure a pass is worked on

The whole frame's score SHALL be the acceptance of a screen, and a pass SHALL be worked on its own measure until that measure holds.

#### Scenario: Pass being worked

- **GIVEN** a pass that does not yet hold
- **WHEN** the pass is worked
- **THEN** its own measure guides the work
- **AND** the frame is compared only once every pass before it holds

### Requirement: The passes command names the next work

The passes command SHALL run each pass's measure in order and stop at the first measure that fails or has no measure yet, naming that pass as the next work.

#### Scenario: Failing measure stops the run

- **GIVEN** a component whose measure fails at some pass
- **WHEN** the passes command runs on it
- **THEN** the run stops at that pass
- **AND** the component's report names the pass as the next work

#### Scenario: Pass with no measure yet

- **GIVEN** a component whose next pass has no measure yet
- **WHEN** the passes command runs on it
- **THEN** the run stops at that pass

#### Scenario: Pass the scene has nothing for

- **GIVEN** a component with no door a clip moves
- **WHEN** the passes command reaches the motion pass
- **THEN** the motion pass is printed as not owed
- **AND** the run goes on past it

### Requirement: Exact game data outranks a value measured from a recording

A derived value SHALL come from the game's own exact data before any value measured from a recording, and a recording SHALL measure only what the game's data does not hold.

#### Scenario: Anchor from the game's data

- **GIVEN** a rect whose anchor the game's data holds and a timing a recording shows
- **WHEN** the rect is derived
- **THEN** the anchor from the game's data is used
- **AND** the timing is not measured from the recording

#### Scenario: Value only a recording holds

- **GIVEN** a camera pose the game's data does not hold
- **WHEN** the value is derived
- **THEN** it is read from the recording

### Requirement: Every derived value cites its source

Every derived value SHALL name the key of the reference source it is taken from.

#### Scenario: Derived value recorded

- **GIVEN** a derived rect, curve, fitted shape or constant
- **WHEN** it is recorded
- **THEN** it names the key of the reference source it is taken from

### Requirement: A pass's gate is the noise of the data it reads

Each pass's gate SHALL be the noise of the data that pass reads, and a family too thin to meet itself SHALL read no gate.

#### Scenario: Family too thin to meet itself

- **GIVEN** a family too thin to be measured against itself
- **WHEN** its pass reads its gate
- **THEN** no gate is read for that family

### Requirement: The inventory holds only when every renderer is claimed

The inventory pass SHALL hold only once every renderer of the game's exports is claimed by a part of the scene, and SHALL fail while any renderer goes unclaimed.

#### Scenario: Renderer left unclaimed

- **GIVEN** a renderer of the game's exports that no part of the scene claims
- **WHEN** the inventory pass runs
- **THEN** the pass fails
- **AND** the unclaimed renderer is named

#### Scenario: Claim names not in the fixture

- **GIVEN** a component's claims naming a component the fixture does not list
- **WHEN** the inventory pass runs
- **THEN** the page fails on that name

### Requirement: The pass option runs one measure alone

The pass option SHALL run one named measure alone and rewrite only that pass's rows of the component's report.

#### Scenario: One pass rerun

- **GIVEN** a pass taken up ahead of a pass before it that still fails
- **WHEN** the pass option names it
- **THEN** only that measure runs
- **AND** only that pass's rows of the report are rewritten
