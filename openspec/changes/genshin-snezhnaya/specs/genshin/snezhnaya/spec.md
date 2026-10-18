## ADDED Requirements

### Requirement: Snezhnaya's chill thickens its fog and snowfall

Snezhnaya SHALL show denser fog and heavier snowfall in an area as its chill level rises, and regular snow weather where the chill is lower.

#### Scenario: A colder area has denser fog and heavier snowfall

- **GIVEN** two areas of Snezhnaya, one at a higher chill level than the other
- **WHEN** the player stands in each area
- **THEN** the colder area shows denser fog and heavier snowfall

#### Scenario: A milder area has regular snow weather

- **GIVEN** an area of Snezhnaya at the lowest chill level
- **WHEN** the player stands in the area
- **THEN** the area shows regular snow weather

### Requirement: Each settlement's torch is the brightest light at night

Each settlement's Kresnik's Torch SHALL show as a warm light, and SHALL be the brightest point of the scene at night.

#### Scenario: A village's torch is the brightest light at night

- **GIVEN** a village of Snezhnaya at night with its Kresnik's Torch lit
- **WHEN** the player looks across the village
- **THEN** the torch shows as a warm light with bloom
- **AND** it is the brightest point in the view

### Requirement: Snezhnaya's vegetation is birch, conifer and tundra grass

Snezhnaya SHALL show white birch forests, dark conifers on its peaks and sparse tundra grass showing through the snow.

#### Scenario: A birch forest stands in snow

- **GIVEN** a birch forest in Snezhnaya under snow
- **WHEN** the player walks through the forest
- **THEN** the trees are white birches standing in snow

#### Scenario: Tundra grass shows through the snow in Volkodlak Tundra

- **GIVEN** the Volkodlak Tundra area under snow
- **WHEN** the player looks at the ground
- **THEN** sparse tundra grass shows through the snow

#### Scenario: Dark conifers stand on the peaks

- **GIVEN** a peak in Snezhnaya
- **WHEN** the player looks up at the peak
- **THEN** dark conifers stand on it

### Requirement: The world map lists Snezhnaya's areas by the game's names

The world map SHALL list Snezhnaya's areas as the game names them.

#### Scenario: The map lists Snezhnaya's areas by the game's names

- **GIVEN** the world map open on Snezhnaya
- **WHEN** the player reads the area names
- **THEN** each area is named as the game names it

### Requirement: Everfrozen Earth is built with Snezhnograd and its palace

Everfrozen Earth SHALL show Snezhnograd and the Zapolyarny Palace once the game's data places the capital.

#### Scenario: Snezhnograd's main street is drawn in Everfrozen Earth

- **GIVEN** the game's data places Snezhnograd in Everfrozen Earth
- **WHEN** the player walks Snezhnograd's main street
- **THEN** the street and the Zapolyarny Palace are drawn
