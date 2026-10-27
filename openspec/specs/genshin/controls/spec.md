## Purpose

The game's default bindings on a PC and a gamepad, stated once in the engine's input and read once a frame into the actions held and pressed.

## Requirements

### Requirement: Every bound action keeps the game's default controls

The world SHALL bind each action to the game's own default keys and buttons on a PC and a gamepad, and SHALL remap none of them (see the open list).

#### Scenario: The map key opens the map

- **GIVEN** the game's default bindings
- **WHEN** the player presses M
- **THEN** the map action is pressed (`OpenMap` on `KeyM`)

### Requirement: The longest chord a press completes wins

An action SHALL be bound to chords of keys, mouse buttons and gamepad buttons, and where one press completes several chords only the longest of them SHALL press its action.

#### Scenario: A held bumper turns a face button into the gadget action

- **GIVEN** the gamepad's left bumper held
- **WHEN** the right face button is pressed
- **THEN** the gadget action is pressed (`QuickUseGadget` on the bumper and the right face button)
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

The world SHALL prevent the browser's default for each bound key, except Enter, Space and Tab, which SHALL keep their defaults so a menu can be walked from the keyboard (`FOCUS_KEY_CODES`).

#### Scenario: F5 opens the events screen rather than reloading the page

- **GIVEN** the events screen bound to F5
- **WHEN** the player presses F5
- **THEN** the page does not reload
- **AND** the events screen opens (`OpenEvents` on `F5`)

#### Scenario: Tab keeps the browser's focus movement

- **GIVEN** a menu open with its buttons focusable
- **WHEN** the player presses Tab
- **THEN** focus moves between the menu's buttons as the browser moves it

### Requirement: A key typed into an editable field reaches no binding

A key typed into an editable field SHALL reach no binding and SHALL keep its default (`FIELD_SELECTOR`).

#### Scenario: A letter typed into the chat field opens no screen

- **GIVEN** the chat field focused
- **WHEN** a letter bound to a screen is typed
- **THEN** no screen opens
- **AND** the letter is typed into the field

### Requirement: Escape releases the pointer lock to the browser and a click takes it again

The browser's Escape SHALL release a pointer lock taken for the camera, and a click on the world SHALL take the lock again (see the open list).

#### Scenario: Escape during play opens the Paimon menu

- **GIVEN** the pointer locked to turn the camera
- **WHEN** the player presses Escape
- **THEN** the pointer lock is released
- **AND** the Paimon menu opens (the `pointerlockchange` listener)

#### Scenario: A click on the world takes the lock again

- **GIVEN** the pointer lock released
- **WHEN** the player clicks the world
- **THEN** the pointer is locked again

### Requirement: Spurious and oversized pointer moves turn nothing

The camera SHALL ignore the first pointer move after a lock is taken and any single move larger than half a turn at the look's sensitivity (`MOUSE_LOOK_MAX_PIXELS_PER_EVENT`).

#### Scenario: The first move after a lock turns nothing

- **GIVEN** a pointer lock just taken
- **WHEN** the first pointer move arrives
- **THEN** the camera does not turn

#### Scenario: A single oversized move turns nothing

- **GIVEN** a pointer lock held
- **WHEN** a single pointer move larger than half a turn arrives
- **THEN** the camera does not turn

### Requirement: Control with W stays the browser's close-tab shortcut

The world SHALL bind no action to Control held with W (no chord holds `ControlLeft` with `KeyW`).

#### Scenario: Control with W presses no world action

- **GIVEN** the player holding Control
- **WHEN** the player presses W
- **THEN** no world action is pressed

### Requirement: The button left of centre on a gamepad opens the chat

The button left of centre on a gamepad SHALL open the chat on every gamepad (`OpenChat` on `GamepadButton.Back`).

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

The world SHALL leave unbound the keys of places and modes it does not have (which binds no `F6`, `F7` or `F8`).

#### Scenario: F6 presses no world action

- **GIVEN** the Serenitea Pot, which the world does not have
- **WHEN** the player presses F6
- **THEN** no world action is pressed

## Open

- [ ] **The game's default key for each action on a PC and a gamepad, M, F3 and F5 among them** — no source yet: the wiki's Controls page is not in `{data-root}/cache/genshin-wiki/`, and no capture shows the game's controls list.
- [ ] **A pad's bumper turns the face buttons into the shortcut wheel's while held** — no source yet: a capture of the pad's bumper held in the game, not on this machine.
- [ ] **The browser keeps Escape for a pointer lock and takes no lock from it** — no source yet: the Pointer Lock and user-activation specs, which this pass did not open.
- [ ] **Chromium reports one spurious, very large pointer move after a lock** — no source yet: a recording of the first move after a lock, not taken here.
- [ ] **F6, F7 and F8 are the Serenitea Pot, the Cat's Tail and Stellar Reunion** — no source yet: the game's controls list for those screens, which the wiki cache does not hold.
