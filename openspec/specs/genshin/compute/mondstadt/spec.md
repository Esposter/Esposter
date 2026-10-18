## Purpose

Mondstadt's region: its base ground, renderers, landmarks, camera, shape, surface, display, light and atmosphere, and its location's frame score.

## Requirements

### Requirement: The Mondstadt City location's landmarks

The Mondstadt City location's landmarks SHALL each be tied to a named mesh of the extracted game before its camera is solved from them.

#### Scenario: Unnamed landmarks leave the set empty and the camera unsolved

- **GIVEN** the extraction names no mesh for the location's landmarks
- **WHEN** the camera is to be solved
- **THEN** the landmark set stays empty
- **AND** the camera is not solved

### Requirement: The Mondstadt City camera

The Mondstadt City camera SHALL be written only when its landmarks reproject within 2 pixels root mean square. It is blocked on the six landmark meshes: `DerivedAssetLandmarkMap` holds Mondstadt as an empty set until the extraction names a mesh for each landmark, so no pose can be solved from them. The camera pass reads its landmarks on the frozen layout, so it also waits on the layout being held.

#### Scenario: A pose whose landmarks reproject beyond 2 pixels is not written

- **GIVEN** a camera pose is solved on the location's six landmarks
- **WHEN** the landmarks reproject more than 2 pixels root mean square off the reference
- **THEN** the pose is not written

#### Scenario: The camera waits on the six landmark meshes

- **GIVEN** the landmark set holds Mondstadt as an empty set
- **WHEN** the camera is to be solved
- **THEN** no pose is solved
- **AND** no camera is written

### Requirement: The Mondstadt City layout

The Mondstadt City layout SHALL place each family's part within 0.02 metres and each family's pixel gap within 2 pixels, seen from the reference's camera. It waits on the camera pose written by the camera requirement, since it reads the scene's camera from that pose.

#### Scenario: A layout whose parts miss the bar is not held

- **GIVEN** the layout is read from the witness at the reference's camera
- **WHEN** a family's part lies more than 0.02 metres off, or its pixel gap more than 2 pixels
- **THEN** the layout is not held

#### Scenario: The layout waits while no camera is written

- **GIVEN** no camera pose is written for the Mondstadt City location
- **WHEN** the layout pass is run
- **THEN** the layout waits
- **AND** its snapshot is not written

### Requirement: The Mondstadt City shape

The Mondstadt City shape SHALL keep its outline within 1 pixel, its depth within 0.01 and its normals within 10 degrees of the exports, seen from the reference's camera. It waits on the camera pass.

#### Scenario: A shape whose normals miss 10 degrees is not held

- **GIVEN** the shape is compared with the exports at the reference's camera
- **WHEN** a normal lies more than 10 degrees off
- **THEN** the shape is not held

### Requirement: The Mondstadt City surface

The Mondstadt City surface SHALL match the exports' mean colour within 2.3 DeltaE for each family, and its structure within the outline gate. It waits on the shape pass.

#### Scenario: A family whose mean colour misses 2.3 DeltaE is not held

- **GIVEN** a family's mean colour is compared with the exports' at the reference's camera
- **WHEN** the colours differ by more than 2.3 DeltaE
- **THEN** the surface is not held

### Requirement: The Mondstadt City display

The Mondstadt City display SHALL keep the shipped contrast's excess within 0.1 of the reference's current build, across the tone curve, grading and bloom of the post profile. It waits on the surface pass.

#### Scenario: A contrast excess beyond 0.1 is not held

- **GIVEN** the shipped contrast is read against the reference's current build
- **WHEN** its excess is more than 0.1
- **THEN** the display is not held

### Requirement: The Mondstadt City sun direction

The Mondstadt City sun direction SHALL replace the provisional noon only when the solved shadow edges lie within 2 pixels. It waits on the camera pass and the display pass.

#### Scenario: Solved shadow edges within 2 pixels set the held minute

- **GIVEN** the sun's direction is solved from the shadows' edges over flat receivers
- **WHEN** the solved edges lie within 2 pixels of the reference's
- **THEN** the held minute replaces the provisional noon

### Requirement: The Mondstadt City light

The Mondstadt City light SHALL place the shadow edges within 2 pixels and match the lit stone's colour within 2.3 DeltaE. It waits on the sun direction and the surface pass.

#### Scenario: Shadow edges missing by more than 2 pixels are not held

- **GIVEN** the light is compared with the reference's shadow edges
- **WHEN** an edge misses by more than 2 pixels
- **THEN** the light is not held

### Requirement: The Mondstadt City atmosphere

The Mondstadt City atmosphere SHALL keep the sky's statistics within the spread of the reference's own sky halves, and its clear sky within 2.3 DeltaE. It waits on the light pass.

#### Scenario: A sky outside the reference's own spread is not held

- **GIVEN** the sky's statistics are compared with the reference's two sky halves
- **WHEN** the statistics fall outside the spread between those halves
- **THEN** the atmosphere is not held

### Requirement: The Mondstadt City frame's score

The Mondstadt City frame's score SHALL be reported without a numeric gate, and judged by eye. It waits on every pass.

#### Scenario: A frame comparison reports its score and is judged by eye

- **GIVEN** the Mondstadt City frame is compared against its reference
- **WHEN** the comparison finishes
- **THEN** its score is recorded and reported
- **AND** the frame is checked by eye
