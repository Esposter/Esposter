## Purpose

The stone light is solved by regression from a reference's colours rather than searched, with the haze and the sky solved beside it.

## Requirements

### Requirement: The stone light is solved by regression, never searched

The stone light SHALL be recovered from a reference's colours by a regression solve, and SHALL NOT be found by searching over candidate lights.

#### Scenario: Light calibrated from a reference

- **GIVEN** a reference showing the stone
- **WHEN** the stone light is calibrated
- **THEN** the light is solved by regression from the reference's interior colours
- **AND** no search over candidate lights is run

### Requirement: The solve keeps every light physically possible

The solve SHALL hold each light it returns to physically possible values, with the ramp rising from none without falling, the sky lighting no face below none, and the height fall-off and the haze colours none or more.

#### Scenario: Unconstrained solve would cancel lights

- **GIVEN** a solve left free to choose any light
- **WHEN** the solve runs with its constraints
- **THEN** the lights do not cancel one another
- **AND** no fading light goes below none
- **AND** no tower takes a colour rising through its height

### Requirement: Each part's bins weigh the same

The solve SHALL weigh each part's bins equally, so that a thin far tower counts as much as the walkway.

#### Scenario: Thin tower beside the walkway

- **GIVEN** a thin far tower and the walkway in one reference
- **WHEN** the solve weighs the parts' bins
- **THEN** the tower's bins count as much as the walkway's

### Requirement: The solve reports its residual and writes the light only when asked

The solve SHALL print its residual beside the spread of its bins, and SHALL publish the light for the reference's hour only when it is told to write.

#### Scenario: Solve run without writing

- **GIVEN** a reference to calibrate
- **WHEN** the solve runs without the write option
- **THEN** its residual is printed beside the spread of its bins
- **AND** no light is published

#### Scenario: Solve run with writing

- **GIVEN** a reference to calibrate
- **WHEN** the solve runs with the write option
- **THEN** the light is published under the reference's hour

### Requirement: The solve hands back a known light when run on its own renders

The solve SHALL hand back the light it was shown, within a small margin, when it is run against the game's exports drawn under that light.

#### Scenario: Self check against known light

- **GIVEN** the game's exports drawn under a known light
- **WHEN** the solve runs against those renders
- **THEN** the light it returns matches the known light within a small margin

### Requirement: A solve with no usable bins fails

A bin holding under thirty pixels SHALL be dropped, and a solve left with no bins SHALL fail rather than return a light of none.

#### Scenario: No bin holds enough pixels

- **GIVEN** every bin of a reference holds under thirty pixels
- **WHEN** the solve runs
- **THEN** the solve fails
- **AND** no light is returned

### Requirement: The haze and the sky are solved beside the light

The haze over the stone SHALL take colours solved together with the light, while the cloud sea keeps the colours measured where it shows.

#### Scenario: Haze colours solved with the light

- **GIVEN** a reference showing the stone under haze
- **WHEN** the light is solved
- **THEN** the haze's two colours are solved with the light

#### Scenario: Cloud sea colours measured

- **GIVEN** a reference showing the cloud sea
- **WHEN** the sky is solved
- **THEN** the cloud sea keeps the colours measured where it shows
