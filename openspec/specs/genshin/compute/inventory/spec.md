## Purpose

The inventory's runs: the world's bag given a whole frame, and the interface's inventory screen given a fixture and a reference.

## Requirements

### Requirement: The bag's whole frame

The bag's whole frame SHALL be approved only once a whole-frame reference exists and scores within the global default difference bar.

#### Scenario: Without a whole-frame reference the bag's approval waits

- **GIVEN** no whole-frame moment of the bag has been named
- **WHEN** approval is considered
- **THEN** approval waits for a whole-frame reference

#### Scenario: A whole-frame reference above the bar keeps the bag unapproved

- **GIVEN** the bag's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the bag stays unapproved

### Requirement: A reference frame with a webcam over part of it

A reference frame with a webcam over part of it SHALL be masked over that part before it is scored.

#### Scenario: The webcam overlay is excluded from scoring

- **GIVEN** a reference frame has a webcam over its top left corner
- **WHEN** the frame is scored
- **THEN** the masked corner is not counted in the score
