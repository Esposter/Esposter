## Purpose

Fontaine's region: its base ground, renderers, landmarks, camera, shape, surface, display, light and atmosphere, and its location's frame score.

## Requirements

### Requirement: The Fontaine landmarks

The Fontaine landmarks SHALL each be tied to a named mesh of the extracted game before the camera is solved from them.

#### Scenario: Unnamed Court buildings leave the landmark set empty

- **GIVEN** the Court's buildings are not yet named and rooted in the extraction
- **WHEN** the landmarks are read from the extraction
- **THEN** the Fontaine landmark set stays empty
- **AND** the camera is not solved from it

### Requirement: The Fontaine camera

The Fontaine camera SHALL be written only when its landmarks reproject within 2 pixels root mean square.

#### Scenario: A pose whose landmarks reproject beyond 2 pixels is not written

- **GIVEN** a camera pose is solved on the Court's landmarks
- **WHEN** the landmarks reproject more than 2 pixels root mean square off the reference
- **THEN** the pose is not written

#### Scenario: A pose within 2 pixels is written with its image

- **GIVEN** a camera pose is solved on the Court's landmarks
- **WHEN** the landmarks reproject within 2 pixels root mean square
- **THEN** the pose is written for the Fontaine location

### Requirement: The Fontaine sun direction

The Fontaine sun direction SHALL replace the provisional noon only when the solved shadow edges lie within 2 pixels.

#### Scenario: Solved shadow edges within 2 pixels set the held minute

- **GIVEN** the sun's direction is solved from the shadows' edges over flat receivers
- **WHEN** the solved edges lie within 2 pixels of the reference's
- **THEN** the held minute replaces the provisional noon

#### Scenario: Solved shadow edges outside 2 pixels leave the provisional noon in place

- **GIVEN** the sun's direction is solved from the shadows' edges
- **WHEN** the solved edges miss the reference's by more than 2 pixels
- **THEN** the provisional noon stays in place

### Requirement: The Fontaine frame's score

The Fontaine frame's score SHALL be reported without a numeric gate, and judged by eye.

#### Scenario: A frame comparison reports its score and is judged by eye

- **GIVEN** the Fontaine frame is compared against its reference
- **WHEN** the comparison finishes
- **THEN** its score is recorded and reported
- **AND** the frame is checked by eye
