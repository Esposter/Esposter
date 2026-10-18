## Purpose

How the world moves between the screens the game opens over it — one at a time, each opened by its shortcut or the Paimon menu and closed back to the world by Escape, a pad's Start or cancel, or its own shortcut, while a talk over the world closes only at its own end. Each screen holds the world's fixed-step loops and clock or not, hides the HUD or not, and lets the pointer go or keeps it, by one map. A screen nobody has built opens as a placeholder under its title.

## Requirements

### Requirement: One screen opens over the world at a time

The world SHALL show at most one screen at a time, and each screen SHALL open from the world by its own shortcut or from the Paimon menu.

#### Scenario: A screen's shortcut opens it from the world

- **GIVEN** the world is shown with nothing over it
- **WHEN** the player presses the map's shortcut
- **THEN** the map opens over the world

#### Scenario: Another shortcut waits while a screen is open

- **GIVEN** the map is open over the world
- **WHEN** the player presses the character screen's shortcut
- **THEN** the character screen does not open
- **AND** the map stays open

#### Scenario: The Paimon menu opens a screen from its entries

- **GIVEN** the Paimon menu is open
- **WHEN** the player chooses an enabled entry
- **THEN** that screen replaces the menu

### Requirement: Escape, Start and cancel return a screen to the world

Escape, the Start button and a pad's cancel SHALL close any screen back to the world, and a screen's own shortcut SHALL close it again.

#### Scenario: Escape closes a screen

- **GIVEN** a screen is open over the world
- **WHEN** the player presses Escape
- **THEN** the world is shown again

#### Scenario: A screen's own shortcut closes it

- **GIVEN** the map is open over the world
- **WHEN** the player presses the map's shortcut
- **THEN** the world is shown again

#### Scenario: Back in the Paimon menu returns to the world

- **GIVEN** the Paimon menu is open
- **WHEN** the player chooses Back
- **THEN** the world is shown again

### Requirement: A talk stays open until its own end

A talk over the world SHALL stay open against every key, Escape and the Start button included, and SHALL close only at its own end.

#### Scenario: Escape does not close a talk

- **GIVEN** a talk is open over the world
- **WHEN** the player presses Escape
- **THEN** the talk stays open

#### Scenario: A talk's end returns the world

- **GIVEN** a talk is open over the world
- **WHEN** the talk reaches its end
- **THEN** the world is shown again

### Requirement: A menu holds the world and a talk does not

While a menu is open the world's fixed-step loops and its character SHALL stand still, while the world keeps drawing behind the screen.

#### Scenario: The world stays visible and still behind a menu

- **GIVEN** a menu is open over the world
- **WHEN** the frame is shown
- **THEN** the world is visible behind the menu
- **AND** the character on the field stands where it was

#### Scenario: The world's clock runs behind a talk

- **GIVEN** a talk is open over the world
- **WHEN** time passes in the talk
- **THEN** the clouds and the sky keep moving behind the speaker

### Requirement: A screen that needs a cursor releases the pointer

A screen that needs a cursor SHALL release the pointer when it opens, and a click on the world SHALL take the pointer back.

#### Scenario: Opening a menu releases the pointer

- **GIVEN** the pointer is held by the world
- **WHEN** a screen that needs a cursor opens
- **THEN** the pointer is released

#### Scenario: A click on the world takes the pointer back

- **GIVEN** the pointer was released by an open screen
- **WHEN** the screen closes and the player clicks the world
- **THEN** the pointer is taken again by the world

### Requirement: The key that closes a screen is spent

The key or click that closes a screen SHALL NOT also act in the world.

#### Scenario: A closing click does not interact with the world

- **GIVEN** a screen is closed by a click
- **WHEN** the world is shown again
- **THEN** the click does not start an interaction, a jump or an attack

### Requirement: Losing the pointer in play opens the Paimon menu

Losing the pointer lock while the world is in play SHALL open the Paimon menu, as the Escape key would.

#### Scenario: A lost pointer lock opens the menu

- **GIVEN** the world is in play with the pointer locked
- **WHEN** the pointer lock is lost
- **THEN** the Paimon menu opens

### Requirement: An unbuilt screen opens as a placeholder with a way back

A screen nobody has built SHALL open as a placeholder under its title in the game's words, with a way back to the world.

#### Scenario: An unbuilt screen shows its title

- **GIVEN** a screen has no built content
- **WHEN** its shortcut is pressed
- **THEN** the screen opens showing its title over a veil

#### Scenario: The placeholder closes back to the world

- **GIVEN** a placeholder screen is open
- **WHEN** the player presses Escape
- **THEN** the world is shown again
