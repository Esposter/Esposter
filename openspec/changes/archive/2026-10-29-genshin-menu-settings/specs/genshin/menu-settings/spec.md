## ADDED Requirements

### Requirement: Settings opens from the Paimon menu's side bar

The Settings screen SHALL open from the Settings entry of the Paimon menu's side bar and show its Graphics and Audio tabs.

#### Scenario: Settings opens from the side bar

- **GIVEN** the Paimon menu is open in the world
- **WHEN** the player chooses Settings
- **THEN** the Settings screen opens with its Graphics and Audio tabs

#### Scenario: A row the world does not back is drawn disabled

- **GIVEN** the Settings screen is open on the Graphics tab
- **WHEN** the player looks at a row the world does not back
- **THEN** the row is drawn disabled
- **AND** it shows the value the game's recording shows

### Requirement: Graphics Quality keeps its tier on this device

The Graphics Quality row SHALL offer the renderer's quality tiers and keep the tier chosen for the player's own device.

#### Scenario: A chosen quality tier is kept on this device

- **GIVEN** the player has chosen a quality tier on the Graphics tab
- **WHEN** the player reopens the game in the same browser
- **THEN** the chosen tier is selected on the Graphics tab

#### Scenario: Another browser starts from the default tier

- **GIVEN** the player has chosen a quality tier in one browser
- **WHEN** the player opens the game in a different browser
- **THEN** the default tier is selected there

### Requirement: Volume rows set levels from 1 to 10

The Volume, Music Volume and SFX Volume rows SHALL each set a level from 1 to 10 that the music or the sound effects follow.

#### Scenario: Music Volume sets the music level

- **GIVEN** the Audio tab is open
- **WHEN** the player sets Music Volume to 4
- **THEN** the music plays at level 4

#### Scenario: A volume beyond the row's range stops at its limit

- **GIVEN** the Audio tab is open
- **WHEN** the player drags SFX Volume past 10
- **THEN** SFX Volume stays at 10

### Requirement: Game Language offers the game's fifteen languages

The Game Language row SHALL offer the fifteen languages of the game's own text and show the screen's labels in the language chosen.

#### Scenario: The language list holds fifteen languages

- **GIVEN** the Settings screen is open
- **WHEN** the player opens the Game Language row
- **THEN** fifteen languages are listed

#### Scenario: Choosing a language changes the screen's labels

- **GIVEN** the Settings screen is open
- **WHEN** the player chooses a language
- **THEN** the screen's labels show that language's game text
