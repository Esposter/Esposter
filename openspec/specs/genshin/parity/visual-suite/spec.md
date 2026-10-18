## Purpose

Every approved screen is held by a visual suite whose images live beside its component, and the suite's own runs cover the opening's handoffs.

## Requirements

### Requirement: Each approved screen matches its own last approved image

The visual suite SHALL render every screen and each of its variants and SHALL match each against its own last approved image, kept beside its component.

#### Scenario: Screen matches its image

- **GIVEN** a screen with an approved image
- **WHEN** the visual suite runs
- **THEN** the rendered screen matches the image beside its component

#### Scenario: Screen differs from its image

- **GIVEN** a screen whose render differs from its approved image
- **WHEN** the visual suite runs
- **THEN** the run fails for that screen

### Requirement: The visual suite runs apart from the ordinary test run

The visual suite SHALL run in its own run, so that an ordinary test run never starts a browser.

#### Scenario: Ordinary test run

- **GIVEN** an ordinary test run
- **WHEN** the run starts
- **THEN** no browser is started

### Requirement: The opening's run covers every handoff

The opening's run SHALL play the whole opening, including the login's flight, and SHALL fail if any screen is skipped along the way.

#### Scenario: Opening played through

- **GIVEN** the opening's run
- **WHEN** it plays the opening
- **THEN** every handoff between screens is checked
- **AND** the run fails if a screen is skipped on the way

### Requirement: A moving screen is held still through its fixture's still state

A moving screen SHALL be held still for the visual suite through its fixture's still state, which the parity page and the references do not read.

#### Scenario: Login scene held still

- **GIVEN** the login scene, which moves
- **WHEN** the visual suite renders it
- **THEN** the scene is drawn in the fixture's still state

### Requirement: An image is written only by approval

An image SHALL be written only by approval of its screen, and a whole-suite run without the update option SHALL NOT write an image.

#### Scenario: First run with no image

- **GIVEN** a screen with no approved image
- **WHEN** the visual suite first runs over it
- **THEN** the image is written
- **AND** the run fails for that screen

#### Scenario: Whole-suite run without update

- **GIVEN** a screen with no approved image
- **WHEN** a whole-suite run without the update option is made
- **THEN** no image is written

### Requirement: A pass's image waits on its comparison before it counts as approved

A screen image written by a pass SHALL NOT count as approved until its comparison clears the screen's bar.

#### Scenario: Pass image not yet compared

- **GIVEN** a screen image written by a pass whose comparison has not cleared the bar
- **WHEN** approval is judged
- **THEN** the image is not counted as approved
