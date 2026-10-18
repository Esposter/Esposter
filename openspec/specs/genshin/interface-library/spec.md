## Purpose

genshin-interface, the game's 2D interface as presentational Vue components. Every screen is drawn inside its GameScreen root, which carries the game's unit, its canvas's unit and inset, face and pointer. Every button is a GameButton, drawn in its game template's look for each state. Each piece is a folder holding its component, its fixture and the images a browser suite holds it to. Each is measured from the English client's recordings, with an overlay compared over the recording's own frame.

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
- **THEN** the interface is drawn at the larger touch scale

### Requirement: Every button takes its game template's look for each state

Every button SHALL take the look its game template gives for each state, which is the disabled, pressed, hover or rest look, decided by the pointer and by the screen's forced state.

#### Scenario: A hovered button fades in at the hover speed

- **GIVEN** a button is at rest
- **WHEN** the pointer moves over it
- **THEN** it fades into its hover look over the hover duration

#### Scenario: A pressed button shows its pressed look at once

- **GIVEN** a button is under the pointer
- **WHEN** the player presses it
- **THEN** it shows its pressed look immediately

#### Scenario: A released button fades back to rest

- **GIVEN** a button is in its hover look
- **WHEN** the pointer leaves it
- **THEN** it fades back to its rest look over the rest duration

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
- **THEN** a white ring surrounds it

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

A dialogue reply SHALL be a translucent black pill at rest, and SHALL turn a white pill with slate words when hovered, focused or lit.

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
