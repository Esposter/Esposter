## Purpose

Nod-Krai's region: its base ground, renderers, landmarks, camera, shape, surface, display, light and atmosphere, and its location's frame score.

## Requirements

### Requirement: The Nod-Krai landmarks

The Nod-Krai landmarks SHALL each be tied to a named mesh of the extracted game before the camera is solved from them, and the central tower's landmarks SHALL stay empty until it is placed.

#### Scenario: The central tower's unplaced pieces leave the landmark set empty

- **GIVEN** the central tower's pieces are not yet placed by the game's streams
- **WHEN** the landmarks are read from the extraction
- **THEN** the Nod-Krai landmark set stays empty
- **AND** the camera is not solved from it

### Requirement: The Nasha Town camera

The Nasha Town camera SHALL be written only when its seven landmarks reproject within 2 pixels root mean square.

#### Scenario: A pose whose landmarks reproject beyond 2 pixels is not written

- **GIVEN** a camera pose is solved on the seven landmarks
- **WHEN** the landmarks reproject more than 2 pixels root mean square off the reference
- **THEN** the pose is not written

### Requirement: The Nasha Town sun direction

The Nasha Town sun direction SHALL replace the provisional noon only when the solved shadow edges lie within 2 pixels.

#### Scenario: Solved shadow edges within 2 pixels set the held minute

- **GIVEN** the sun's direction is solved from the shadows' edges over flat receivers
- **WHEN** the solved edges lie within 2 pixels of the reference's
- **THEN** the held minute replaces the provisional noon

### Requirement: The Nasha Town frame's score

The Nasha Town frame's score SHALL be reported without a numeric gate, and judged by eye.

#### Scenario: A frame comparison reports its score and is judged by eye

- **GIVEN** the Nasha Town frame is compared against its reference
- **WHEN** the comparison finishes
- **THEN** its score is recorded and reported
- **AND** the frame is checked by eye
