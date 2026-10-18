## Purpose

Phaser scenes as Vue components, scene switching, the input-resolver chain, and mobile joystick support. The player moves through the game's screens and controls it the same way on desktop and on mobile.

## Requirements

### Requirement: Game opens on loading, then the title screen

The game SHALL load all of its assets before showing the title screen, which SHALL offer New Game, Continue, and Settings.

#### Scenario: Assets load before the title appears

- **WHEN** the player opens the game
- **THEN** all assets finish loading before the title screen is shown

#### Scenario: New Game or Continue opens the world

- **WHEN** the player chooses New Game or Continue on the title screen
- **THEN** the world is shown

#### Scenario: Settings opens the settings screen

- **WHEN** the player chooses Settings on the title screen
- **THEN** the settings screen is shown

#### Scenario: A wild encounter switches to battle and back

- **WHEN** a wild encounter starts in the world
- **THEN** the battle replaces the world
- **AND** when the battle finishes the world is shown again

### Requirement: Scene changes fade

Every change of screen SHALL fade to the new screen rather than cut to it.

#### Scenario: Moving between screens fades

- **WHEN** the player moves from one screen to another, such as from the world to a menu or to a battle
- **THEN** the screen fades to the new screen

### Requirement: Pixel art stays crisp and painted art stays smooth

The game SHALL show pixel-art textures with crisp edges when they are enlarged, and SHALL show painted artwork smoothly.

#### Scenario: An enlarged tileset keeps crisp edges

- **WHEN** a tileset or pixel-art sprite is enlarged on screen
- **THEN** its edges stay crisp

#### Scenario: An enlarged painted background stays smooth

- **WHEN** a painted background is enlarged on screen
- **THEN** it is shown with smooth edges

### Requirement: Keyboard on desktop and joystick on mobile

The game SHALL take input from the keyboard on desktop and from an on-screen joystick on mobile, and each screen SHALL respond the same way to either.

#### Scenario: Arrow keys move the character on desktop

- **GIVEN** the player is on a desktop device
- **WHEN** the player presses an arrow key
- **THEN** the character moves in that direction

#### Scenario: The joystick moves the character on mobile

- **GIVEN** the player is on a mobile device
- **WHEN** the player moves the on-screen joystick
- **THEN** the character moves in that direction

#### Scenario: Confirm works the same on either device

- **WHEN** the player presses Enter on desktop or taps the confirm control on mobile
- **THEN** the same action is taken

#### Scenario: Movement and confirm work at the same time on mobile

- **GIVEN** the player is on a mobile device
- **WHEN** the player moves the joystick and presses confirm at the same time
- **THEN** both inputs are read

### Requirement: The on-screen joystick stays above the screen

The on-screen joystick SHALL stay drawn above the screen that is showing.

#### Scenario: The joystick stays visible during battle

- **GIVEN** the player is on a mobile device
- **WHEN** a battle is showing
- **THEN** the joystick is drawn above the battle

### Requirement: Characters move in four directions

Characters SHALL move only up, down, left, or right, never diagonally.

#### Scenario: Movement is never diagonal

- **WHEN** the player moves a character
- **THEN** the character moves in one of the four directions only

### Requirement: Open layers consume input first

When a menu or dialog is open, input SHALL go to the topmost open layer first, and only input that layer does not use SHALL reach the layers beneath it.

#### Scenario: Dialog takes Confirm before the world

- **GIVEN** a dialog is open over the world
- **WHEN** the player presses Confirm
- **THEN** the dialog advances
- **AND** the character in the world does not respond

#### Scenario: A menu takes direction input before the world

- **GIVEN** the world menu is open
- **WHEN** the player presses a direction
- **THEN** the menu's highlight moves
- **AND** the character in the world does not move

### Requirement: Menus are navigated by direction across a grid

Every menu SHALL be navigated with direction input across a grid of options.

#### Scenario: A direction moves the highlight to the next option

- **GIVEN** a menu is open with its highlight on one option
- **WHEN** the player presses a direction
- **THEN** the highlight moves to the adjacent option in that direction

### Requirement: Game text uses the game's own font

All text in the game SHALL use the game's own font unless a screen defines its own text style.

#### Scenario: Dialog text uses the game's font

- **WHEN** dialog text is shown
- **THEN** it is drawn in the game's font
