## Purpose

Every screen is held by a visual suite whose images live beside its component, and the suite's own runs cover the opening's handoffs.

## Requirements

### Requirement: Each screen matches its own image

The visual suite SHALL render every screen and each of its variants and SHALL match each against its own image, kept beside its component.

#### Scenario: Screen matches its image

- **GIVEN** a screen with an image
- **WHEN** the visual suite runs
- **THEN** the rendered screen matches the image beside its component

#### Scenario: Screen differs from its image

- **GIVEN** a screen whose render differs from its image
- **WHEN** the visual suite runs
- **THEN** the run does not fail for that screen
- **AND** the screen is listed in the summary with the share of pixels that differ

### Requirement: The summary lists the cases over the bar

After every case, the visual suite SHALL print each case whose differing share is over one percent of its image, worst first, with the count of cases within the bar, and SHALL print one line when no case is over.

#### Scenario: Cases over the bar

- **GIVEN** cases whose images differ by more than one percent
- **WHEN** the run ends
- **THEN** each is printed with its percentage, worst first
- **AND** the count of cases within the bar follows them

#### Scenario: No case over the bar

- **GIVEN** no case differs from its image by more than one percent
- **WHEN** the run ends
- **THEN** one line says so

### Requirement: A failure other than a difference still fails the run

A render error or a timeout SHALL fail the run for its case.

#### Scenario: Render error

- **GIVEN** a screen that fails to render or does not settle within the matcher's timeout
- **WHEN** the visual suite runs
- **THEN** the run fails for that screen

### Requirement: A screen with no image is written beside its component

A run SHALL write the image of a screen that has none beside its component where the update mode writes new images, which is the default outside CI, and SHALL count the case with the screens that have no image otherwise.

#### Scenario: First run with no image

- **GIVEN** a screen with no image, outside CI
- **WHEN** the visual suite first runs over it
- **THEN** the image is written beside its component
- **AND** the case is counted with the screens that have no image

#### Scenario: Run in CI with no image

- **GIVEN** a screen with no image, in CI
- **WHEN** the visual suite runs over it
- **THEN** the shot is kept in the suite's diffs folder and no image is written beside the component
- **AND** the case is counted with the screens that have no image

### Requirement: An existing image is replaced only by an update run

An existing image SHALL be replaced only by a run with the update option, and `genshin:parity approve` SHALL make that run for one screen alone.

#### Scenario: Mismatch keeps the image

- **GIVEN** a screen whose render differs from its image
- **WHEN** a whole-suite run without the update option is made
- **THEN** the image is not replaced

#### Scenario: Approve replaces one screen's image

- **GIVEN** a screen with an image
- **WHEN** the operator runs approve on it
- **THEN** only that screen's image is replaced, by the render

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

## Open

- [ ] **The opening's run fails when a screen is skipped** — no source yet: the browser test expects each screen in turn (`packages/genshin-world/src/components/Game/Opening/Index.browser.test.ts:113-152`), but no run that skips a screen is cited.
