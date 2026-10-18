## Purpose

Genshin's sky and clock. The game's own day, one in-game minute per real second, so a day passes in twenty-four minutes. A painted sky as the scene's background, with a gradient, a sun and moon, stars and stepped clouds, and every colour the world is lit by read off the sky at that minute, from a region's keyframes.

## Requirements

### Requirement: The day runs at one in-game minute per real second

The world's clock SHALL run at one in-game minute per real second, so that a full day passes in twenty-four real minutes.

#### Scenario: A real minute passes an in-game hour

- **GIVEN** the world's clock is running
- **WHEN** one real minute passes
- **THEN** one in-game hour has passed

#### Scenario: A region opens at its reference hour

- **GIVEN** the world is opened in a region with a reference hour
- **WHEN** the world first shows
- **THEN** the clock reads that region's reference hour

### Requirement: The sun rises in the east at dawn and sets in the west at dusk

The sun SHALL rise due east at six in the morning, stand highest at noon and set due west at six in the evening, with the moon opposite it.

#### Scenario: The sun is due east at dawn

- **GIVEN** the clock reads six in the morning
- **WHEN** the sun is shown
- **THEN** the sun is due east

#### Scenario: The sun is highest at noon

- **GIVEN** the clock reads noon
- **WHEN** the sun is shown
- **THEN** the sun stands at its highest point in the sky

#### Scenario: The moon lights the world when the sun is below the horizon

- **GIVEN** the sun is below the horizon
- **WHEN** the world is lit
- **THEN** the light comes from the moon

### Requirement: The light passes from the sun to the moon without a visible swap

The world's light SHALL pass from the sun to the moon at dawn and dusk without a visible jump.

#### Scenario: The light hands over at dawn without a jump

- **GIVEN** the clock passes six in the morning
- **WHEN** the light changes from the moon to the sun
- **THEN** the change in the world's lighting is not visible as a jump

### Requirement: The day's colours blend smoothly between a region's keyframes

The day's colours SHALL blend smoothly between a region's keyframes and SHALL wrap through midnight, while a set hour SHALL jump rather than sweep.

#### Scenario: Colours blend between two keyframes

- **GIVEN** the clock lies between two of a region's keyframes
- **WHEN** the sky is shown
- **THEN** its colours are blended between those two keyframes

#### Scenario: Colours wrap through midnight

- **GIVEN** the clock lies between the last keyframe of the day and the first
- **WHEN** the sky is shown
- **THEN** its colours blend across midnight

#### Scenario: A set hour jumps the sky

- **GIVEN** the clock is set to a new hour
- **WHEN** the sky is next shown
- **THEN** the sky jumps to that hour without a sweep

### Requirement: The sky shows a gradient, sun, moon, stars and stepped clouds

The sky SHALL show a gradient, a sun and a moon, stars and stepped clouds in the region's colours, and the clouds SHALL have hard edges and stepped shading.

#### Scenario: Stars brighten at night

- **GIVEN** the clock reads midnight
- **WHEN** the sky is shown
- **THEN** the stars are bright

#### Scenario: Clouds have hard edges and stepped shade

- **GIVEN** a cloud layer is shown
- **WHEN** the clouds are seen
- **THEN** their edges are hard
- **AND** their shade steps in bands rather than falling off smoothly

#### Scenario: Clouds fade toward the horizon

- **GIVEN** clouds lie low toward the horizon
- **WHEN** the sky is shown
- **THEN** the clouds fade out near the horizon

### Requirement: Every colour the world is lit by is read from the sky at the current minute

Every colour the world is lit by SHALL be read from the sky at the current minute, so that the lighting, the fog and the rim shift with the sky as the clock moves.

#### Scenario: The world's lighting shifts as the clock moves

- **GIVEN** the clock moves from one minute to the next
- **WHEN** the world is shown
- **THEN** the light, the fog and the rim on surfaces shift to the sky's colours at the new minute
