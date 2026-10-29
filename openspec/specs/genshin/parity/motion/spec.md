## Purpose

Motion is matched at the moments a person samples from a recording as labelled screenshots, and the repository never reads the recording.

## Requirements

### Requirement: A moment of motion is matched by a screenshot

A moment of a screen's motion SHALL be matched against a labelled screenshot sampled from the recording outside the repository, never against the recording.

#### Scenario: Moment matched

- **GIVEN** a screen with a transition and a recording of the transition
- **WHEN** the transition is matched
- **THEN** each moment is compared against a screenshot a person sampled at that second
- **AND** the recording is never read by the repository

### Requirement: A screen's motion is held at its start and then played by its fixture

The parity page SHALL hold a screen's own animations at their start as it mounts, then let them finish and apply the fixture's motion props before the transitions they start are held.

#### Scenario: Still of a moving screen

- **GIVEN** a screen with its own animations and a fixture carrying motion props
- **WHEN** the screen is shot as a still
- **THEN** the screen shows the fixture's first state

#### Scenario: Motion props applied

- **GIVEN** a screen whose own animations have finished on mount
- **WHEN** its motion props are applied
- **THEN** the transitions the props start are held at the moments they are shot

### Requirement: A fade or a wipe is judged by a curve of one region's darkness

A fade's duration and a wipe's steps SHALL be read from the curve of one region's darkness across the screenshots sampled from the recording and across our shots, not judged by eye.

#### Scenario: Fade compared with its screenshots

- **GIVEN** a fade in a screen and screenshots sampled from a recording of the fade
- **WHEN** the darkness of one region is printed across both sets of images
- **THEN** the fade's duration is read from the two curves

### Requirement: A window capture is sampled outside the repository

A window capture SHALL be sampled into labelled screenshots outside the repository, so the repository compares only those screenshots.

#### Scenario: Window capture sampled

- **GIVEN** a window capture of the game
- **WHEN** it is compared
- **THEN** only its sampled screenshots are compared
