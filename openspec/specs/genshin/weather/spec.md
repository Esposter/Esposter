## Purpose

Genshin's weather as built. The area the camera stands in names the weather, an area with several weathers turns through them, its cities hold clear inside their outlines, and a change blends over nine seconds, eased in and out. Each weather raises the sky's cloud cover, the fog's density and the ground's wetness over the region's own clear sky, tints the haze where it carries sand, and falls its particles in a box that follows the eye. Rain splashes where it meets the ground, and a thunderstorm's lightning flashes the sky and drops a bolt.

## Requirements

### Requirement: The area the camera stands in names the weather

The world's weather SHALL be the weather of the area the camera stands in, and SHALL be clear where no area holds the camera.

#### Scenario: Area with one weather

- **GIVEN** the camera stands in an area whose only weather is rain
- **WHEN** the weather is checked
- **THEN** the weather is rain

#### Scenario: Area with several weathers turns

- **GIVEN** the camera stands in an area with several weathers
- **WHEN** the area's change interval passes
- **THEN** the weather turns to the next one of the area's weathers

#### Scenario: Place no area holds

- **GIVEN** the camera stands where no area's outline holds it
- **WHEN** the weather is checked
- **THEN** the weather is clear

### Requirement: A city holds the weather clear inside its outline

A city's outline SHALL hold the weather clear while the area's weather goes on outside it.

#### Scenario: Entering a city

- **GIVEN** rain falls in the area outside a city
- **WHEN** the camera enters the city's outline
- **THEN** the weather changes to clear

#### Scenario: Leaving a city

- **GIVEN** the camera is inside a city's outline
- **WHEN** the camera leaves it
- **THEN** the area's weather, as it has turned meanwhile, returns

### Requirement: Weather changes blend over nine seconds

A weather change SHALL blend over nine seconds, eased in and out, starting from wherever the sky had reached when the change began.

#### Scenario: Change blends in

- **GIVEN** the weather changes from clear to rain
- **WHEN** the change begins
- **THEN** the sky, fog and rain build over nine seconds, eased in and out

#### Scenario: Change begun mid-blend

- **GIVEN** a change is part way through blending
- **WHEN** another change begins
- **THEN** the new blend starts from where the first had reached

#### Scenario: Weather at load set at once

- **GIVEN** the world is loading
- **WHEN** the first frame is drawn
- **THEN** the weather is already set with no blend

### Requirement: One kind of particle falls at a time

Only one kind of particle SHALL fall at a time, with the old kind fading out as the new one fades in.

#### Scenario: Rain turns to snow

- **GIVEN** rain is falling
- **WHEN** the weather changes to snow
- **THEN** the rain fades out over the first half of the change
- **AND** the snow fades in over the second half

### Requirement: A weather raises the sky's clouds and fog but never lowers them

A weather SHALL raise the region's cloud cover and fog density where it is above the region's own, and SHALL never lower them.

#### Scenario: Clear weather leaves the sky as it was

- **GIVEN** the weather is clear
- **WHEN** the sky is drawn
- **THEN** the region's own cloud cover and fog are unchanged

#### Scenario: Rain raises the clouds and fog

- **GIVEN** the weather is rain
- **WHEN** the sky is drawn
- **THEN** the cloud cover and fog density are raised over the region's own

### Requirement: Sandstorm haze takes the sand's colour

A sandstorm SHALL tint the haze toward the colour of sand.

#### Scenario: Sandstorm haze

- **GIVEN** the weather is a sandstorm
- **WHEN** the haze is drawn
- **THEN** the haze is tinted toward sand
- **AND** the sand streaks blow along the wind

### Requirement: Rain splashes where it meets the ground

Rain SHALL splash rings where it meets the ground or water, and snow and sand SHALL splash nothing.

#### Scenario: Rain splashing

- **GIVEN** rain is falling on the ground
- **WHEN** drops meet the ground
- **THEN** small rings widen and fade where they land

#### Scenario: Snow splashes nothing

- **GIVEN** snow is falling
- **WHEN** the flakes reach the ground
- **THEN** no splash rings appear

### Requirement: A thunderstorm strikes and flashes

A thunderstorm SHALL strike about 27.6 times a minute, each strike flashing the sky twice and dropping a bolt on the ground between one and six hundred metres from the eye.

#### Scenario: Strike flashes the sky

- **GIVEN** a thunderstorm is on
- **WHEN** a strike happens
- **THEN** the sky flashes twice, the second dimmer than the first

#### Scenario: Bolt drops on the ground

- **GIVEN** a strike happens
- **WHEN** its bolt is drawn
- **THEN** the bolt stands on the ground between one and six hundred metres from the eye

#### Scenario: No lightning outside a thunderstorm

- **GIVEN** the weather is rain or clear
- **WHEN** time passes
- **THEN** no lightning strikes

### Requirement: Wet ground darkens and glints in rain and storm

Wet ground SHALL darken and glint in the sun while it rains or thunders, and SHALL stay dry in clear, cloudy, fog, snow and sandstorm weather.

#### Scenario: Ground wet in rain

- **GIVEN** the weather is rain
- **WHEN** the ground is drawn
- **THEN** the ground darkens and glints in the sun

#### Scenario: Ground dry in snow

- **GIVEN** the weather is snow
- **WHEN** the ground is drawn
- **THEN** the ground stays dry

### Requirement: Water's haze replaces the weather under the surface

Under the water's surface the water's haze SHALL replace the weather's colour, and the fog the weather writes while the eye is under water SHALL be kept for surfacing.

#### Scenario: Under water

- **GIVEN** the eye is under the water's surface
- **WHEN** the haze is drawn
- **THEN** the water's haze replaces the weather's colour
