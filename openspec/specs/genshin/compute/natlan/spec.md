## Purpose

Natlan's region: its base ground, renderers, landmarks, camera, shape, surface, display, light and atmosphere, and its location's frame score.

## Requirements

### Requirement: The People of the Springs location's seven landmarks

The People of the Springs location's seven landmarks SHALL each be tied to a named mesh of the extracted game before its camera is solved from them.

#### Scenario: A landmark with no mesh in the extraction blocks the camera

- **GIVEN** one of the seven landmarks has no mesh in the extraction
- **WHEN** the camera is to be solved
- **THEN** the camera is not solved from that landmark

### Requirement: The People of the Springs camera

The People of the Springs camera SHALL be written only when its seven landmarks reproject within 2 pixels root mean square.

#### Scenario: A pose whose landmarks reproject beyond 2 pixels is not written

- **GIVEN** a camera pose is solved on the seven landmarks
- **WHEN** the landmarks reproject more than 2 pixels root mean square off the reference
- **THEN** the pose is not written

#### Scenario: Seven landmarks solve the pose without a starting pose

- **GIVEN** the seven landmarks are set for the location
- **WHEN** the pose is solved
- **THEN** it is solved without a starting pose

### Requirement: Each Natlan pass

Each Natlan pass SHALL wait on the pass or camera it reads and SHALL be held only when its readout meets the bar its page names.

#### Scenario: The layout pass waits for the camera

- **GIVEN** the Natlan layout pass reads the location's camera
- **WHEN** the camera has not been written
- **THEN** the layout pass does not run

#### Scenario: A pass whose readout misses its bar is not held

- **GIVEN** a Natlan pass has run
- **WHEN** its readout misses the bar its page names
- **THEN** the pass is not held

### Requirement: The People of the Springs sun direction

The People of the Springs sun direction SHALL replace the provisional noon only when the solved shadow edges lie within 2 pixels.

#### Scenario: Solved shadow edges within 2 pixels set the held minute

- **GIVEN** the sun's direction is solved from the shadows' edges over flat receivers
- **WHEN** the solved edges lie within 2 pixels of the reference's
- **THEN** the held minute replaces the provisional noon

### Requirement: The People of the Springs frame's score

The People of the Springs frame's score SHALL be reported without a numeric gate, and judged by eye.

#### Scenario: A frame comparison reports its score and is judged by eye

- **GIVEN** the People of the Springs frame is compared against its reference
- **WHEN** the comparison finishes
- **THEN** its score is recorded and reported
- **AND** the frame is checked by eye
