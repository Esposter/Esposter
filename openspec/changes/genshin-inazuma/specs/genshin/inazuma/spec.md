## ADDED Requirements

### Requirement: Inazuma's storm is an area setting lifted by default

Inazuma's permanent thunderstorm SHALL be lifted by default in each area that holds it, and SHALL be restorable from the hour and weather control.

#### Scenario: Inazuma's storm is lifted by default

- **GIVEN** the player is in Inazuma with no change made to the weather control
- **WHEN** the area loads
- **THEN** no thunderstorm is drawn over the area

#### Scenario: The storm returns when restored from the weather control

- **GIVEN** the storm is lifted in an area that holds it
- **WHEN** the player restores the storm from the hour and weather control
- **THEN** the thunderstorm and its violet sky are drawn over the area

### Requirement: Each island shows its own palette

Each island of Inazuma SHALL draw its own palette of ground, sky and landmarks, distinct from the other islands.

#### Scenario: Watatsumi Island shows its sea-tinted sky and coral

- **GIVEN** the player is on Watatsumi Island
- **WHEN** the player looks across the island
- **THEN** the sky is tinted like the sea
- **AND** pale sand and purple and pink coral are drawn on the shore

#### Scenario: Yashiori Island shows the serpent's ribs

- **GIVEN** the player is on Yashiori Island
- **WHEN** the player looks across the island
- **THEN** grey earth and the ribs of a colossal serpent's skeleton are drawn

### Requirement: Torii gates line Inazuma City at the game's count

Inazuma City SHALL draw the game's 32 torii gates in its buildings.

#### Scenario: The capital shows the game's torii gates

- **GIVEN** the player is in Inazuma City
- **WHEN** the player looks along the capital's streets
- **THEN** 32 torii gates are drawn in its buildings

### Requirement: The Grand Narukami Shrine matches the game's landmark pose by pose

The Grand Narukami Shrine SHALL be drawn matched pose by pose to the game's own landmark, with its sacred sakura.

#### Scenario: The shrine stands as the game's landmark does

- **GIVEN** the player stands in the shrine's plaza
- **WHEN** the player looks at the shrine
- **THEN** the shrine and its sacred sakura match the game's reference of the same view

### Requirement: Enkanomiya is entered at its gate and lit by its artificial sun

Enkanomiya SHALL be entered at its gate beneath Watatsumi Island and SHALL be lit by its artificial sun rather than by the sky's clock.

#### Scenario: Passing the gate changes the light to the artificial sun

- **GIVEN** the player stands at the gate beneath Watatsumi Island
- **WHEN** the player passes through the gate into Enkanomiya
- **THEN** Enkanomiya is lit by its artificial sun
- **AND** the light does not follow the sky's clock

### Requirement: Enkanomiya's white stone ruins are drawn from their own kit

Enkanomiya's ruins SHALL be drawn from a kit of their own, separate from the other islands' building kit.

#### Scenario: A ruin in Enkanomiya is drawn from the ruin kit

- **GIVEN** the player is in Enkanomiya
- **WHEN** the player comes upon a white stone ruin
- **THEN** the ruin is drawn from the ruin kit
