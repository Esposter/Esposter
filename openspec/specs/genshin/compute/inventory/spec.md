## Purpose

The inventory's runs: the world's bag given a whole frame, and the interface's inventory screen given a fixture and a reference.

## Requirements

### Requirement: The bag's whole frame

The bag's whole frame SHALL be compared once a whole-frame reference exists, its score reported against the global default difference bar, and its image written by approve.

#### Scenario: Without a whole-frame reference the bag's score waits

- **GIVEN** no whole-frame moment of the bag has been named
- **WHEN** its score is considered
- **THEN** the score waits for a whole-frame reference

#### Scenario: A whole-frame reference above the bar still gets the bag its image

- **GIVEN** the bag's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the score is reported over the bar, and the bag's image is still written

### Requirement: A reference frame with a webcam over part of it

A reference frame with a webcam over part of it SHALL be masked over that part before it is scored.

#### Scenario: The webcam overlay is excluded from scoring

- **GIVEN** a reference frame has a webcam over its top left corner
- **WHEN** the frame is scored
- **THEN** the masked corner is not counted in the score
