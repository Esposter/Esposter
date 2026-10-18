## ADDED Requirements

### Requirement: Lava glows and lights the rock beside it

Lava SHALL show as a bright flow that lights the rock beside it.

#### Scenario: Lava lights the rock beside it at night

- **GIVEN** it is night in Natlan
- **WHEN** the player looks at a lava field
- **THEN** the lava shows as a bright flow
- **AND** the rock beside it is lit by its glow

### Requirement: Hot springs and vents send up steam

Each hot spring and vent in Natlan SHALL send up steam.

#### Scenario: Steam rises from a hot spring

- **GIVEN** the player stands by Toyac Springs
- **WHEN** the player looks at a hot spring
- **THEN** steam rises from it

### Requirement: An eruption suspends rain in its area

An eruption SHALL suspend rain in its area until it ends.

#### Scenario: An eruption stops the rain

- **GIVEN** rain is falling in the area
- **WHEN** an eruption begins
- **THEN** the rain stops for as long as the eruption lasts

#### Scenario: Rain resumes after an eruption

- **GIVEN** an eruption has ended in the area
- **WHEN** the eruption's last moment passes
- **THEN** the rain resumes

### Requirement: Each tribe's lands keep their own settlement style

Each tribe's lands SHALL draw their platforms, walls, roofs and murals in the tribe's own palette and form, built from the one building kit.

#### Scenario: The Children of Echoes' lands are built in canyon terraces

- **GIVEN** the player walks into the Children of Echoes' lands
- **WHEN** the settlement comes into view
- **THEN** its houses stand on canyon terraces

#### Scenario: Settlements of two tribes look different

- **GIVEN** the player walks from the People of the Springs' lands to the Flower-Feather Clan's lands
- **WHEN** the second settlement comes into view
- **THEN** its palette and form differ from the first settlement's

### Requirement: Natlan's landmarks match the game's references

Natlan's landmarks, the Stadium of the Sacred Flame and Ochkanatlan among them, SHALL be drawn to match the game's references at the same camera.

#### Scenario: The Stadium of the Sacred Flame matches its reference

- **GIVEN** the player stands at the Stadium of the Sacred Flame
- **WHEN** the view is taken from the reference's camera
- **THEN** the stadium's outline matches the reference's outline

### Requirement: Natlan's ground and springs draw in its saturated palette

Natlan's ground, flowers and springs SHALL draw in the region's saturated palette of red rock, orange and gold flowers, turquoise springs and green canopy.

#### Scenario: Toyac Springs' pools read turquoise

- **GIVEN** the player stands at Toyac Springs in daylight
- **WHEN** the player looks at the pools
- **THEN** the pools show turquoise
