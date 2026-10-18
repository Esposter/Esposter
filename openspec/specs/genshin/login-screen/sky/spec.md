## Purpose

The login sky, as built: each hour's clear sky solved as the game's sky draws it, and the sun or moon that lights the scene in that hour, with every colour measured on screen and inverted through the game's tone curve.

## Requirements

### Requirement: Each hour's sky matches its references

Each hour's clear sky SHALL be solved over every reference at that hour together, so that the sky reads as one sky across the frames of that hour.

#### Scenario: Hour's clear sky

- **WHEN** an hour is shown
- **THEN** its clear sky matches that hour's references

### Requirement: Frame drawn through the game's tone curve alone

The frame SHALL be drawn through the game's own tone curve with no grade or bloom, so that the colours measured on screen match the displayed reference.

#### Scenario: Frame is drawn

- **WHEN** a frame is drawn
- **THEN** only the tone curve is applied to it

### Requirement: Night white balance

The night SHALL pass through its own white balance before the tone curve, cooled to a temperature of minus 9.5 and tinted 16.

#### Scenario: Night frame

- **WHEN** the night is shown
- **THEN** its colours pass through that white balance before the tone curve

### Requirement: Sun and moon placement

The sun and the moon SHALL sit where their references show them, the light taking the direction of the body shown and the other body opposite.

#### Scenario: Dawn sun

- **WHEN** the dawn is shown
- **THEN** the sun sits just past the left edge, a little above the horizon

#### Scenario: Night moon

- **WHEN** the night is shown
- **THEN** the moon stands behind the lantern tower

### Requirement: Dusk sunlight direction

The dusk's sunlight SHALL fall 50 degrees up and 60 degrees left of the walkway.

#### Scenario: Dusk shadows

- **WHEN** the dusk is shown
- **THEN** the sun's shadows fall from that direction

### Requirement: Upward faces lit by the sky

Faces turned upward SHALL be lit by the sky's bright cloud colour and faces turned downward by its shade colour.

#### Scenario: Upward face

- **WHEN** a face turned upward is shown
- **THEN** it is lit by the sky's bright cloud colour
