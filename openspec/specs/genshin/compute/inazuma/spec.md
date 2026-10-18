## Purpose

Inazuma's region: its base ground, renderers, landmarks, camera, shape, surface, display, light and atmosphere, and its location's frame score.

## Requirements

### Requirement: The Inazuma landmarks

The Inazuma landmarks SHALL each be tied to a named mesh of the extracted game before the camera is solved from them, and the seven that a camera cannot yet tell apart SHALL stay out of the set.

#### Scenario: Look-alike buildings stay out of the landmark set

- **GIVEN** the extraction places several identical houses and platforms near the keep
- **WHEN** the landmarks are read from the extraction
- **THEN** the seven landmarks that the camera cannot yet tell apart stay out of the set

### Requirement: The Inazuma camera

The Inazuma camera SHALL be written only when its landmarks reproject within 2 pixels root mean square.

#### Scenario: A pose whose landmarks reproject beyond 2 pixels is not written

- **GIVEN** a camera pose is solved on the city's landmarks
- **WHEN** the landmarks reproject more than 2 pixels root mean square off the reference
- **THEN** the pose is not written

### Requirement: Each Inazuma family's layout

Each Inazuma family's layout SHALL sit within 0.02 metres of the exports and within 2 pixels of its pixel gap.

#### Scenario: A family's part that drifts beyond the bar fails the layout pass

- **GIVEN** the layout is compared against the exports at the reference's camera
- **WHEN** a family's part is more than 0.02 metres off, or its pixel gap is more than 2 pixels off
- **THEN** the layout pass does not pass

### Requirement: Inazuma's shape

Inazuma's shape SHALL match the exports' outline within 1 pixel, depth within 0.01 and normals within 10 degrees.

#### Scenario: A shape within all three limits passes

- **GIVEN** the city's kit parts are drawn at the reference's camera beside the exports
- **WHEN** the outline, depth and normals each stay within their limit
- **THEN** the shape pass passes

### Requirement: Inazuma's light

Inazuma's light SHALL place its shadow edges within 2 pixels and its stone colour within 2.3 DeltaE of the reference.

#### Scenario: A light pass with shadow edges within 2 pixels and stone colour within 2.3 DeltaE passes

- **GIVEN** the sun's direction is solved from the shadows' edges
- **WHEN** the shadow edges and the stone's colour each stay within their limit
- **THEN** the light pass passes

### Requirement: The Inazuma frame's score

The Inazuma frame's score SHALL be reported without a numeric gate, and judged by eye.

#### Scenario: A frame comparison reports its score and is judged by eye

- **GIVEN** the Inazuma frame is compared against its reference
- **WHEN** the comparison finishes
- **THEN** its score is recorded and reported
- **AND** the frame is checked by eye
