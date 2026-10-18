## Purpose

Motion is matched frame by frame against sampled recordings, with a scene's own motion filmed on a faked clock.

## Requirements

### Requirement: A recording's motion is matched frame by frame

A recording's events SHALL be found by sampling it at one frame a second, and each event SHALL then be read at its full rate over its own window.

#### Scenario: Events found and read

- **GIVEN** a recording with motion in it
- **WHEN** the motion is matched
- **THEN** the recording is first sampled at one frame a second to find its events
- **AND** each event is then read at its full rate over its own window

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

A fade's duration and a wipe's steps SHALL be read from the curve of one region's darkness across both sets of frames, not judged by eye.

#### Scenario: Fade compared with its recording

- **GIVEN** a fade in a screen and a recording of the fade
- **WHEN** the darkness of one region is printed across both sets of frames
- **THEN** the fade's duration is read from the two curves

### Requirement: A fit to a window capture is judged over the whole curve

A curve taken from window capture SHALL be judged over the whole curve, since frames skipped by capture make it jitter by a frame or two.

#### Scenario: Curve with skipped frames

- **GIVEN** a curve taken from window capture, where frames were skipped
- **WHEN** a fit is judged
- **THEN** the fit is judged over the whole curve rather than one frame

### Requirement: A scene's own motion is filmed on a faked clock

A scene's motion SHALL be filmed on a clock the tool moves one frame at a time, so the screen is shot at exact moments however slowly the page draws.

#### Scenario: Scene filmed at exact moments

- **GIVEN** a scene whose motion runs on its frames' clock
- **WHEN** the scene is filmed
- **THEN** the page's clock is moved a frame at a time
- **AND** the screen is shot at the exact moments requested

### Requirement: Props are set at the moments a click or a load would set them

The parity page SHALL set a screen's props at moments that play its stages as a click or a load would, and SHALL place the stills beside a recording sampled at the same rate.

#### Scenario: Stages played as a click would

- **GIVEN** a screen with props that change its stages
- **WHEN** the props are set at their moments
- **THEN** each stage is shot as a click or a load would show it
- **AND** the stills are placed in a contact sheet beside the recording sampled at the same rate

### Requirement: With the witness, a scene's motion is filmed on the game's exports

When the witness is used, the scene's motion SHALL be filmed on the game's exports in place of our parts.

#### Scenario: Witness film

- **GIVEN** a scene filmed with the witness
- **WHEN** the film is shot
- **THEN** the game's exports are drawn in place of our parts
