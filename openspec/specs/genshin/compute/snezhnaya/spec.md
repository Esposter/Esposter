## Purpose

Snezhnaya's region: its base ground, renderers, landmarks, camera, shape, surface, display, light and atmosphere, and its location's frame score.

## Requirements

### Requirement: The Snezhnaya ground fit

The Snezhnaya ground fit SHALL hold its features within the gate read from the ground itself, on samples within 60 metres of the region's centre.

#### Scenario: A ground whose residual exceeds the gate is not published

- **GIVEN** the ground is fitted on samples within 60 metres of the region's centre
- **WHEN** the fit's residual is above its gate
- **THEN** the ground is not published

#### Scenario: A fit that depends on the neighbouring region's centre waits

- **GIVEN** the region's centre is set by hand on another region's ground
- **WHEN** the ground fit is considered
- **THEN** the fit waits for the centre's place in the game's data

### Requirement: The Everfrozen Earth location's seven landmarks

The Everfrozen Earth location's seven landmarks SHALL each be tied to a named mesh of the extracted game before its camera is solved from them.

#### Scenario: A landmark with no mesh blocks the camera

- **GIVEN** a landmark of the location has no mesh in the extraction
- **WHEN** the camera is to be solved
- **THEN** the camera is not solved from that landmark

### Requirement: The Everfrozen Earth camera

The Everfrozen Earth camera SHALL be written only when its landmarks reproject within 2 pixels root mean square.

#### Scenario: A pose whose landmarks reproject beyond 2 pixels is not written

- **GIVEN** a camera pose is solved on the seven landmarks
- **WHEN** the landmarks reproject more than 2 pixels root mean square off the reference
- **THEN** the pose is not written

### Requirement: Snezhnaya's shape

Snezhnaya's shape SHALL match the exports' outline within 1 pixel, depth within 0.01 and normals within 10 degrees.

#### Scenario: A shape within all three limits passes

- **GIVEN** the region's kit parts are drawn at the reference's camera beside the exports
- **WHEN** the outline, depth and normals each stay within their limit
- **THEN** the shape pass passes

### Requirement: Snezhnaya's light

Snezhnaya's light SHALL place the lit stone's colour within 2.3 DeltaE of the reference at its held minute.

#### Scenario: A night light whose stone colour stays within 2.3 DeltaE passes

- **GIVEN** the night light is read at its held minute
- **WHEN** the lit stone's colour is compared against the reference
- **THEN** the light pass passes only where the colour is within 2.3 DeltaE

### Requirement: The Snezhnaya frame's score

The Snezhnaya frame's score SHALL be reported without a numeric gate, and judged by eye.

#### Scenario: A frame comparison reports its score and is judged by eye

- **GIVEN** the Everfrozen Earth frame is compared against its reference
- **WHEN** the comparison finishes
- **THEN** its score is recorded and reported
- **AND** the frame is checked by eye
