## ADDED Requirements

### Requirement: Exit prompt draws at the game's own scale

The exit prompt SHALL be drawn at the scale of the game's own exit prompt, so that its edges fall where the game's edges fall over the same frame.

#### Scenario: The prompt opens over the menu at the game's scale

- **GIVEN** the Paimon menu is open in the world
- **WHEN** the player chooses Quit Game
- **THEN** the exit prompt opens over the menu
- **AND** its frame's edges fall where the game's prompt frame's edges fall

### Requirement: Exit prompt keeps its three choices

The exit prompt SHALL offer Continue Game, Exit to Login Interface and Exit to Desktop, each leading to its own outcome.

#### Scenario: Continue Game returns to the world

- **GIVEN** the exit prompt is open
- **WHEN** the player chooses Continue Game
- **THEN** the prompt closes
- **AND** the world is shown again

#### Scenario: Exit to Login Interface or Exit to Desktop leaves for the app's home

- **GIVEN** the exit prompt is open
- **WHEN** the player chooses Exit to Login Interface or Exit to Desktop
- **THEN** the player leaves the world for the app's home
