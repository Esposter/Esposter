## Purpose

Liyue's region: its base ground, renderers, landmarks, camera, shape, surface, display, light and atmosphere, and its location's frame score.

## Requirements

### Requirement: The Liyue Harbor location's landmarks

The Liyue Harbor location's landmarks SHALL each be tied to a named mesh of the extracted game before its camera is solved from them.

#### Scenario: A landmark with no mesh in the extraction blocks the camera

- **GIVEN** a landmark of the Liyue Harbor location has no mesh in the extraction
- **WHEN** the camera is to be solved
- **THEN** the camera is not solved from that landmark

### Requirement: The Liyue Harbor camera

The Liyue Harbor camera SHALL be written only when its landmarks reproject within 2 pixels root mean square.

#### Scenario: A pose whose landmarks reproject beyond 2 pixels is not written

- **GIVEN** a camera pose is solved on the location's six landmarks
- **WHEN** the landmarks reproject more than 2 pixels root mean square off the reference
- **THEN** the pose is not written

### Requirement: The Liyue Harbor sun direction

The Liyue Harbor sun direction SHALL replace the provisional noon only when the solved shadow edges lie within 2 pixels.

#### Scenario: Solved shadow edges within 2 pixels set the held minute

- **GIVEN** the sun's direction is solved from the shadows' edges over flat receivers
- **WHEN** the solved edges lie within 2 pixels of the reference's
- **THEN** the held minute replaces the provisional noon

### Requirement: The Liyue Harbor frame's score

The Liyue Harbor frame's score SHALL be reported without a numeric gate, and judged by eye.

#### Scenario: A frame comparison reports its score and is judged by eye

- **GIVEN** the Liyue Harbor frame is compared against its reference
- **WHEN** the comparison finishes
- **THEN** its score is recorded and reported
- **AND** the frame is checked by eye
