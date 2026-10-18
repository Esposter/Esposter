## Purpose

The game's pause menu, opened over the world by Escape or a pad's Start, with its contents and side bar in the game's own order, the entries of screens not yet built drawn disabled, and the quit prompt and World Level dialog it opens.

## Requirements

### Requirement: The menu opens over the world from Escape or Start

The world SHALL open the Paimon menu over play when Escape or a pad's Start is pressed, and in single-player SHALL pause everything except particles and music while it is open.

#### Scenario: Opened from the keyboard

- **GIVEN** the world is in play with no screen over it
- **WHEN** the player presses Escape
- **THEN** the Paimon menu opens over the world

#### Scenario: Opened from a pad

- **GIVEN** the world is in play with no screen over it
- **WHEN** the player presses the pad's Start
- **THEN** the Paimon menu opens over the world

#### Scenario: Single-player pause

- **GIVEN** the player is in single-player
- **WHEN** the Paimon menu is open
- **THEN** everything except particles and music is paused

### Requirement: Contents and side bar follow the game's order and words

The Paimon menu SHALL list its side bar from Back to Quit Game and its contents in the game's own order, each labelled in the game's own text.

#### Scenario: Menu open

- **GIVEN** the Paimon menu is open
- **WHEN** the player looks over its side bar and contents
- **THEN** the side bar runs from Back to Quit Game in the game's order
- **AND** the contents follow the game's order, labelled with the game's own words
- **AND** Community and Feedback are drawn disabled at the foot of the contents
- **AND** entries the game shows but the references do not are left out

### Requirement: Entries whose screen is not built are drawn disabled

The Paimon menu SHALL draw each entry whose screen is not built as disabled, and SHALL open the entry's screen once that screen is built.

#### Scenario: Entry whose screen is not built

- **GIVEN** an entry whose screen the world has not built
- **WHEN** the Paimon menu opens
- **THEN** that entry is drawn disabled

#### Scenario: Entry whose screen is built

- **GIVEN** an entry whose screen the world has built
- **WHEN** the player chooses the entry
- **THEN** the entry's screen opens

### Requirement: Back closes the menu and Quit Game asks first

The Paimon menu SHALL close when Back is chosen, and SHALL open the quit prompt over the world when Quit Game is chosen.

#### Scenario: Back closes the menu

- **GIVEN** the Paimon menu is open
- **WHEN** the player chooses Back
- **THEN** the menu closes and the world is shown again

#### Scenario: Quit Game asks first

- **GIVEN** the Paimon menu is open
- **WHEN** the player chooses Quit Game
- **THEN** the quit prompt opens over the world
- **AND** the menu is set aside while the prompt shows

#### Scenario: Continue Game from the prompt

- **GIVEN** the quit prompt is open
- **WHEN** the player chooses Continue Game
- **THEN** the world is set back in play

### Requirement: The quit prompt offers three choices and both exits leave the world

The quit prompt SHALL offer Continue Game, Exit to Login Interface and Exit to Desktop, and each exit SHALL leave the world for the app's home.

#### Scenario: Exit to Login Interface

- **GIVEN** the quit prompt is open
- **WHEN** the player chooses Exit to Login Interface
- **THEN** the player leaves the world for the app's home

#### Scenario: Exit to Desktop

- **GIVEN** the quit prompt is open
- **WHEN** the player chooses Exit to Desktop
- **THEN** the player leaves the world for the app's home in the same way

### Requirement: The menu opens and closes on a fixed timing

The Paimon menu SHALL fade its side bar in on opening and draw its panel a tenth of a second later on the same curve, and SHALL close in reverse with its panel first, while Quit Game SHALL replace the menu at once.

#### Scenario: Menu opening

- **GIVEN** the world is in play
- **WHEN** the Paimon menu opens
- **THEN** the side bar fades in
- **AND** the panel follows a tenth of a second later on the same curve
- **AND** the menu is fully open within 26 hundredths of a second

#### Scenario: Menu closing

- **GIVEN** the Paimon menu is open
- **WHEN** the player chooses Back
- **THEN** the panel closes first
- **AND** the side bar closes after it

#### Scenario: Quit Game is not animated

- **GIVEN** the Paimon menu is open
- **WHEN** the player chooses Quit Game
- **THEN** the quit prompt replaces the menu at once

### Requirement: Side bar buttons and entries light under the pointer

A side bar button SHALL light when the pointer rests on it, and a panel entry SHALL take its tint under the pointer.

#### Scenario: Pointer rests on a side bar button

- **GIVEN** the Paimon menu is open
- **WHEN** the pointer rests on a side bar button
- **THEN** the button's gold icon turns cream and grows on a navy disc
- **AND** the button's name is shown beside it over the panel

#### Scenario: Side bar button pressed

- **GIVEN** the pointer is on a side bar button
- **WHEN** the button is pressed
- **THEN** the disc turns cream under an ink icon at its resting size

### Requirement: The profile card shows the rank and opens the World Level dialog

The profile card SHALL show the Traveler's rank and World Level, and the info icon beside the World Level SHALL open the World Level dialog over the dimmed menu.

#### Scenario: Card shows rank and World Level

- **GIVEN** the Paimon menu is open
- **WHEN** the profile card is shown
- **THEN** the rank and the World Level each stand right-aligned beside their row's end

#### Scenario: Info icon opens the dialog

- **GIVEN** the Paimon menu is open
- **WHEN** the player presses the info icon beside the World Level
- **THEN** the World Level dialog opens over the dimmed menu

#### Scenario: Birthday before the profile is backed

- **GIVEN** the profile is not yet backed
- **WHEN** the profile card is shown
- **THEN** the Birthday row stands over an empty value

### Requirement: The World Level dialog shows its help text and lowering button

The World Level dialog SHALL show its help text and a cream lowering button with a red arrow.

#### Scenario: Dialog open

- **GIVEN** the World Level dialog is open
- **WHEN** the player reads the dialog
- **THEN** its help text is shown in the game's own words
- **AND** the cream lowering button with its red arrow is shown

### Requirement: The Settings screen shows the game's tabs and rows

The Settings screen SHALL list its tabs down the left in the game's order and draw the open tab's headings and rows in the game's own words.

#### Scenario: Graphics tab open

- **GIVEN** the Settings screen is open on the Graphics tab
- **WHEN** the player reads its rows
- **THEN** the graphics quality row is set by the world, its words marking the device's own tier as the default
- **AND** every other row shows its value disabled

#### Scenario: Pointer over a row

- **GIVEN** the Settings screen is open
- **WHEN** the pointer rests on a row or the row holds keyboard focus
- **THEN** the row lights with a white rim round its edge
