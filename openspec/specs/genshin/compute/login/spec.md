## Purpose

The login screen's light and shadows, and the Japanese PC client's health notice.

## Requirements

### Requirement: The login screen's night light

The login screen's night light SHALL place its shadow edges within 2 pixels of the reference before its light pass is held.

#### Scenario: Shadow edges still more than 2 pixels off keep the light pass unheld

- **GIVEN** the night shadows' casters and softness are fitted and the light's direction is solved
- **WHEN** the shadow edges still miss the reference by more than 2 pixels
- **THEN** the light pass is not held

### Requirement: The Japanese PC client's health notice

The Japanese PC client's health notice SHALL show whole in the visual suite, with the PC watermark outside its region.

#### Scenario: The notice is compared in its own words

- **GIVEN** the notice's frame is taken from the Japanese client's opening
- **WHEN** the notice is compared
- **THEN** the notice shows whole
- **AND** the PC watermark lies outside the compared region
- **AND** a person judges the result by eye
