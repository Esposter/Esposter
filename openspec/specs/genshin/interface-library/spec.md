## Purpose

The game's 2D interface as presentational Vue components, each screen drawn in one sized root and each button in its game template's look for each state.

## Requirements

### Requirement: Every screen is drawn inside a root sized to the game's proportions

Every screen SHALL be drawn inside one root that sizes its interface to the window's smaller axis at the game's proportions, and that inset its canvas from wider screens.

#### Scenario: A wide screen insets the canvas

- **GIVEN** the window is wider than sixteen to nine
- **WHEN** the screen is drawn
- **THEN** the canvas is inset from each side by the spare width

#### Scenario: A touch screen draws the interface larger

- **GIVEN** the device's main pointer is a finger
- **WHEN** the screen is drawn
- **THEN** the interface is drawn at the larger touch scale (`MOBILE_INTERFACE_SCALE`)

### Requirement: Every button takes its game template's look for each state

Every button SHALL take the look its game template gives for each state, which is the disabled, pressed, hover or rest look, decided by the pointer, by a press given to it and by the screen's forced state.

#### Scenario: A hovered button fades in at the hover speed

- **GIVEN** a button is at rest
- **WHEN** the pointer moves over it
- **THEN** it fades into its hover look over the hover duration (`INTERACTION_HOVER_MS`)

#### Scenario: A pressed button shows its pressed look at once

- **GIVEN** a button is under the pointer
- **WHEN** the player presses it
- **THEN** it shows its pressed look immediately

#### Scenario: A released button fades back to rest

- **GIVEN** a button is in its hover look
- **WHEN** the pointer leaves it
- **THEN** it fades back to its rest look over the rest duration (`INTERACTION_REST_MS`)

#### Scenario: A tapped button is not left lit

- **GIVEN** the device's main pointer is a finger
- **WHEN** a button is tapped and the finger lifts
- **THEN** the press shows while the finger is down, and no hover look is left lit once the finger lifts

#### Scenario: A button given a press shows its pressed look

- **GIVEN** a button carries `data-pressed`
- **WHEN** it is drawn
- **THEN** it shows its pressed look as `:active` draws it

#### Scenario: A disabled button answers nothing

- **GIVEN** a button belongs to a screen not yet built
- **WHEN** the player presses it
- **THEN** it shows its disabled look and does nothing

### Requirement: Keyboard focus shows the hover look

A button focused from the keyboard SHALL show its hover look, and a plain button SHALL show a white ring instead so focus stays visible.

#### Scenario: A focused button shows its hover look

- **GIVEN** a button is focused from the keyboard
- **WHEN** it is drawn
- **THEN** it shows its hover look

#### Scenario: A plain button rings when focused

- **GIVEN** a plain button is focused from the keyboard
- **WHEN** it is drawn
- **THEN** a white ring surrounds it (`[data-kind="Plain"]:focus-visible`)

### Requirement: Every clickable element is a button that lights on hover and press

A clickable element SHALL be a real button, so the keyboard reaches it, and SHALL draw a hover look when it is hovered or focused from the keyboard and a pressed look when it is pressed, unless it is disabled, whatever box its screen gives it.

#### Scenario: A clickable row lights over its own box

- **GIVEN** a row, tab or translucent box on a screen is clickable
- **WHEN** the pointer hovers it or the player presses it
- **THEN** a tint lights over its own box behind its words, and a press tints it stronger at once

#### Scenario: A round clickable element rings when hovered

- **GIVEN** a round clickable element on a screen, a coin or a portrait
- **WHEN** the pointer hovers it or it is focused from the keyboard
- **THEN** a white ring lights 1 unit outside its edge, and a press dims it at once without changing its size

#### Scenario: A pressed close tints its disc slate

- **GIVEN** a close button is under the pointer
- **WHEN** the player presses it
- **THEN** its disc tints slate at once, and its size does not change

### Requirement: A side bar disc lights and enlarges its icon on hover

A side bar disc SHALL light a translucent disc behind its icon on hover, turn the icon cream and enlarge it, and show its name beside it.

#### Scenario: A hovered disc shows its name

- **GIVEN** a side bar disc is at rest
- **WHEN** the pointer hovers it
- **THEN** a disc lights behind the icon
- **AND** the icon turns cream and grows
- **AND** the disc's name is shown beside it

#### Scenario: A pressed disc turns cream

- **GIVEN** a side bar disc is under the pointer
- **WHEN** the player presses it
- **THEN** the disc turns cream and the icon turns ink

### Requirement: A pill lights a ring on hover and holds its size

A pill SHALL show its words in ink at rest, SHALL light a white ring over its edge on hover without changing size, and SHALL turn a half-transparent slate under a gold light when pressed.

#### Scenario: A hovered pill lights a ring without resizing

- **GIVEN** a pill is at rest
- **WHEN** the pointer hovers it
- **THEN** a white ring lights over its edge
- **AND** its size does not change

#### Scenario: A pressed pill turns slate

- **GIVEN** a pill is under the pointer
- **WHEN** the player presses it
- **THEN** the pill turns half-transparent slate under a gold light

### Requirement: A dialogue reply lights white on hover

A dialogue reply SHALL be a translucent slate pill at rest (`DIALOGUE_REPLY_REST`), and SHALL turn a white pill with slate words when hovered, focused or lit (`GAME_REPLY_HOVER` and `GAME_REPLY_HOVER_INK`). The Wish and Talents reply kind keeps the translucent black at rest, `GAME_REPLY_REST`.

#### Scenario: A hovered reply turns white

- **GIVEN** a dialogue reply is at rest
- **WHEN** the pointer hovers it
- **THEN** it turns a white pill with slate words

### Requirement: Every piece ships with its fixture and approved images

Every component of the library but the layout roots that draw nothing of their own (GameScreen, GameRect and TwoColumnScreen) SHALL be a folder holding its fixture and its approved images, and a component without its fixture SHALL fail the visual check.

#### Scenario: A component without a fixture fails the visual check

- **GIVEN** a component in the library has no fixture
- **WHEN** the visual check runs
- **THEN** the check fails for that component

#### Scenario: A component with its fixture is held to its images

- **GIVEN** a component has a fixture and approved images
- **WHEN** the visual check runs
- **THEN** the component is compared with its approved images

### Requirement: The pointer is the game's own pointer

The pointer SHALL be drawn as the game's four-pointed star with its gold centre, at the size the game draws it on a screen of the same height.

#### Scenario: The pointer is the game's star

- **GIVEN** the pointer is drawn over a screen
- **WHEN** it is shown
- **THEN** it appears as the game's four-pointed star with a gold centre

## Open

- [ ] **The pointer is the game's four-pointed star at the size the game draws it on a screen of the same height** — no source yet: the wiki's Tutorial System Show Cursor image is not in the genshin-wiki cache, and the 25 px size is in no file read; the cached Controls page (`{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext line 236) gives the Show Cursor key, "Left Alt", and no shape or size, so a 1080 high frame with Left Alt held would settle the size.
- [ ] **The game fits its interface to a 1920 by 1080 screen, with a 1600 by 900 canvas inset up to 71 units, and its touch scale is the mobile client's** — no source yet: the 2560 and 3440 wide recordings are not among the captures, and the canvas size and touch scale are in no file read.
- [ ] **The hover and rest fades' durations are the game's button clips' durations** — no source yet: the hover clip in `{data-root}/genshin-parity/extracted/interface-states/states-07356235.json` runs longer than `INTERACTION_HOVER_MS` holds, and no rest clip is read, so the fade back to rest over `INTERACTION_REST_MS` is unread.
- [ ] **A dialogue reply turns a white pill with slate words when hovered** — no source yet: a 60 fps PC recording of the dialogue choices hovered, as the roadmap asks; no recording shows a reply under the pointer, so the white pill is the look a lit reply took before the kind, and its rest is fitted to the frame's pills (`dialogue-choices-replies`).
