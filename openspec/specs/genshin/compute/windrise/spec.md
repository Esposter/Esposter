## Purpose

Windrise, the first scene: the great oak's shape, the surface's pass list and the sun's direction.

## Requirements

### Requirement: The great oak's outline, depth and normal

The great oak's outline, depth and normal SHALL each stay within the floor the exports' own halves read beside it.

#### Scenario: An oak whose crown outline is not drawn cannot reach the floor

- **GIVEN** the crown and the buried roots of the great oak are not drawn
- **WHEN** the oak's envelope is compared against its export
- **THEN** the outline does not reach its floor

### Requirement: The Windrise statue's outline

The Windrise statue's outline SHALL stay within 1 pixel, its depth within the depth gate, and its normal within 10 degrees.

#### Scenario: A statue whose normal geometry is not yet fitted stays blocked

- **GIVEN** the statue's normal geometry has not been read from a statue fit
- **WHEN** the statue's shape pass is run
- **THEN** the normal limit cannot be met and the pass is not held

### Requirement: The Windrise sun direction

The Windrise sun direction SHALL place the solved shadow edges within 2 pixels of the recording's.

#### Scenario: A solve whose edges miss by more than 2 pixels is not accepted

- **GIVEN** the sun's direction is solved from the statue's shadows
- **WHEN** the solved edges miss the recording's by more than 2 pixels
- **THEN** the solved direction is not accepted

### Requirement: Each other Windrise hour

Each other Windrise hour SHALL be named and its camera SHALL pass the same pose gate as the solved hours.

#### Scenario: A named hour's camera that fails the pose gate is not accepted

- **GIVEN** an hour's minute is read off its sun
- **WHEN** its camera fails the pose gate the solved hours pass
- **THEN** that hour is not accepted

### Requirement: The god rays' density and the bloom threshold

The god rays' density and the bloom threshold SHALL be read from a recording before they are set.

#### Scenario: Without a recording of the shafts the density stays unpriced

- **GIVEN** no published clip shows Windrise's shafts
- **WHEN** the god rays are considered
- **THEN** the density and the bloom threshold stay unset
