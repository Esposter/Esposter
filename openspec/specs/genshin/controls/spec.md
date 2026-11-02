## Purpose

The game's default bindings on a PC and a gamepad, stated once in the engine's input and read once a frame into the actions held and pressed.

## Requirements

### Requirement: Every bound action keeps the game's default controls

The world SHALL bind each action to the game's own default keys and buttons on a PC and a gamepad, and SHALL remap none of them.

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

### Requirement: A pad walks a menu's controls

A menu over the world SHALL take the pad's directional pad and left stick as focus moves, its east face button (Confirm) as a press of the focused control, its bumpers as a list screen's tab steps, and its south face button (Cancel) as the close Escape makes.

#### Scenario: The directional pad moves the focus to the nearest control that way

- **GIVEN** a menu open with one of its controls focused
- **WHEN** the directional pad is pressed to the right
- **THEN** the focus moves to the nearest control lying to the right of it

#### Scenario: A held stick repeats the move at a steady pace

- **GIVEN** a menu open with one of its controls focused
- **WHEN** the left stick is held past its dead zone downward
- **THEN** the focus moves once at once, and again each repeat interval once the repeat delay has passed, for as long as the stick is held

#### Scenario: The east face button presses the focused control

- **GIVEN** a menu open with one of its controls focused
- **WHEN** the east face button is pressed
- **THEN** the focused control shows its pressed look, then is clicked

#### Scenario: The south face button closes the menu to the world

- **GIVEN** a menu open
- **WHEN** the south face button is pressed
- **THEN** the menu closes to the world, as Escape closes it

#### Scenario: A bumper steps a list screen's tab

- **GIVEN** a list screen open on its first tab
- **WHEN** the right bumper is pressed
- **THEN** the second tab is selected
- **AND** the left bumper steps back, held at the first tab

#### Scenario: A menu opens on its first control

- **GIVEN** no control of a menu has the focus as it opens
- **WHEN** the menu opens
- **THEN** its first control takes the focus, drawing a focus ring only when the last input was a key or the pad

#### Scenario: The world takes no press while a menu is open

- **GIVEN** a menu open over the world
- **WHEN** the pad's or the keyboard's world button is pressed
- **THEN** the character takes no press

### Requirement: Bound actions stay bound before any feature reads them

Every action the game binds SHALL stay bound and read every frame, whether or not a feature reads it yet.

#### Scenario: The normal attack is pressed before any feature reads it

- **GIVEN** the normal attack bound and no feature reading it
- **WHEN** the normal attack key is pressed
- **THEN** the normal attack action is pressed

### Requirement: Keys of places and modes the world does not have stay unbound

The world SHALL leave unbound the keys of places and modes it does not have (which binds no `F6`, `F7` or `F8`). `F6` is for the settings menu within the Serenitea Pot and "The Cat's Tail", `F7` for the Furnishing screen inside the Serenitea Pot, and `F8` for "Stellar Reunion".

#### Scenario: F6 presses no world action

- **GIVEN** the Serenitea Pot, which the world does not have
- **WHEN** the player presses F6
- **THEN** no world action is pressed

## Open

- [ ] **A pad's bumper turns the face buttons into the shortcut wheel's while held** — contradicted by `{data-root}/cache/genshin-wiki/Page_Controls.json` lines 96 and 147 to 149: the bumper alone opens the shortcut wheel, and held with a face button it gives Quick-Use Gadget and other chords of the game, not the wheel's actions.
- [ ] **The browser keeps Escape for a pointer lock and takes no lock from it** — no source yet: the Pointer Lock and user-activation specs, which are not on disk and not in the wiki cache.
- [ ] **Chromium reports one spurious, very large pointer move after a lock** — no source yet: a recording of the first move after a lock, not taken here, or a logged "movementX" and "movementY" sequence from the events after `requestPointerLock`.
