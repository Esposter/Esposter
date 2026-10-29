## ADDED Requirements

### Requirement: Exit prompt draws at the game's own scale

The exit prompt SHALL be drawn at the scale of the game's own exit prompt, so that its panel and choices fall where the game's fall over the same frame, with the menu it opens over left visible behind it, dimmed.

#### Scenario: The prompt opens over the menu at the game's scale

- **GIVEN** the Paimon menu is open in the world
- **WHEN** the player chooses Quit Game
- **THEN** the exit prompt opens over the menu, which stays visible behind it, dimmed
- **AND** its panel is 910 by 576 of the game's 1080 high pixels, centred, with each choice 370 by 63 pixels, Cancel 66 pixels in from the panel's left and Confirm 475 in, as the English PC client's prompt draws it in the 2026 recording `yt-kIDee7nyD0w` at 29 seconds

### Requirement: Exit prompt offers Cancel and Confirm

The exit prompt SHALL offer Cancel and Confirm, the two choices the current build's prompt draws, and no others.

#### Scenario: Cancel returns to the menu

- **GIVEN** the exit prompt is open
- **WHEN** the player chooses Cancel
- **THEN** the prompt closes
- **AND** the Paimon menu is shown again

#### Scenario: Confirm leaves for the app's home

- **GIVEN** the exit prompt is open
- **WHEN** the player chooses Confirm
- **THEN** the player leaves the world for the app's home, the login screen that the recording shows from about 37 seconds of `yt-jHr2bERjkYc`
