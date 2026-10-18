## Purpose

The game's default bindings on a PC and a gamepad, stated once in the engine's input and read once a frame into the actions held and pressed. A binding is a list of chords over keys, mouse buttons and gamepad buttons alike, the longest chord a press completes winning, so a pad's bumper turns its face buttons into shortcuts as the game's does. A bound key's browser default is prevented, but a key typed into a field stays the field's.

## Requirements

### Requirement: Every bound action keeps the game's default controls

The world SHALL bind each action to the game's own default keys and buttons on a PC and a gamepad, and SHALL remap none of them.

#### Scenario: The map key opens the map

- **GIVEN** the game's default bindings
- **WHEN** the player presses M
- **THEN** the map action is pressed

### Requirement: The longest chord a press completes wins

An action SHALL be bound to chords of keys, mouse buttons and gamepad buttons, and where one press completes several chords only the longest of them SHALL press its action.

#### Scenario: A held bumper turns a face button into the gadget action

- **GIVEN** the gamepad's left bumper held
- **WHEN** the right face button is pressed
- **THEN** the gadget action is pressed
- **AND** the normal attack action is not pressed

### Requirement: An action is held while its chord is held and pressed once per press

An action SHALL be held while every code of one of its chords is held, and SHALL be pressed once per press however long the browser repeats the key.

#### Scenario: A key tapped between two frame reads still presses its action

- **GIVEN** a bound key pressed and released between two reads of input
- **WHEN** the frame reads input
- **THEN** the action is pressed once

#### Scenario: A key held down presses its action once

- **GIVEN** a bound key held down while the browser repeats it
- **WHEN** the frame reads input
- **THEN** the action is pressed once

### Requirement: Bound browser keys lose their default except the focus keys

The world SHALL prevent the browser's default for each bound key, except Enter, Space and Tab, which SHALL keep their defaults so a menu can be walked from the keyboard.

#### Scenario: F5 opens the events screen rather than reloading the page

- **GIVEN** the events screen bound to F5
- **WHEN** the player presses F5
- **THEN** the page does not reload
- **AND** the events screen opens

#### Scenario: Tab keeps the browser's focus movement

- **GIVEN** a menu open with its buttons focusable
- **WHEN** the player presses Tab
- **THEN** focus moves between the menu's buttons as the browser moves it

### Requirement: A key typed into an editable field reaches no binding

A key typed into an editable field SHALL reach no binding and SHALL keep its default.

#### Scenario: A letter typed into the chat field opens no screen

- **GIVEN** the chat field focused
- **WHEN** a letter bound to a screen is typed
- **THEN** no screen opens
- **AND** the letter is typed into the field

### Requirement: Escape releases the pointer lock to the browser and a click takes it again

The browser's Escape SHALL release a pointer lock taken for the camera, and a click on the world SHALL take the lock again.

#### Scenario: Escape during play opens the Paimon menu

- **GIVEN** the pointer locked to turn the camera
- **WHEN** the player presses Escape
- **THEN** the pointer lock is released
- **AND** the Paimon menu opens

#### Scenario: A click on the world takes the lock again

- **GIVEN** the pointer lock released
- **WHEN** the player clicks the world
- **THEN** the pointer is locked again

### Requirement: Spurious and oversized pointer moves turn nothing

The camera SHALL ignore the first pointer move after a lock is taken and any single move larger than half a turn at the look's sensitivity.

#### Scenario: The first move after a lock turns nothing

- **GIVEN** a pointer lock just taken
- **WHEN** the first pointer move arrives
- **THEN** the camera does not turn

#### Scenario: A single oversized move turns nothing

- **GIVEN** a pointer lock held
- **WHEN** a single pointer move larger than half a turn arrives
- **THEN** the camera does not turn

### Requirement: Control with W stays the browser's close-tab shortcut

The world SHALL bind no action to Control held with W.

#### Scenario: Control with W presses no world action

- **GIVEN** the player holding Control
- **WHEN** the player presses W
- **THEN** no world action is pressed

### Requirement: The button left of centre on a gamepad opens the chat

The button left of centre on a gamepad SHALL open the chat on every gamepad.

#### Scenario: A pad's View or Share button opens the chat

- **GIVEN** a gamepad connected
- **WHEN** its button left of centre is pressed
- **THEN** the chat opens

### Requirement: Bound actions stay bound before any feature reads them

Every action the game binds SHALL stay bound and read every frame, whether or not a feature reads it yet.

#### Scenario: The normal attack is pressed before any feature reads it

- **GIVEN** the normal attack bound and no feature reading it
- **WHEN** the normal attack key is pressed
- **THEN** the normal attack action is pressed

### Requirement: Keys of places and modes the world does not have stay unbound

The world SHALL leave unbound the keys of places and modes it does not have.

#### Scenario: F6 presses no world action

- **GIVEN** the Serenitea Pot, which the world does not have
- **WHEN** the player presses F6
- **THEN** no world action is pressed
