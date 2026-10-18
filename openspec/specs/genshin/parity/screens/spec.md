## Purpose

A screen is a component folder with its fixture, placed in its section, so the parity page and the visual suite find it without a list to keep.

## Requirements

### Requirement: Each screen is a component folder beside its fixture in its game section

Each screen SHALL be a component folder in its game section, kept beside its fixture, its browser tests and its approved images.

#### Scenario: Screen located by its name

- **GIVEN** a screen named by its path
- **WHEN** the screen is located
- **THEN** it sits in its section's folder
- **AND** its fixture, its browser tests and its approved images sit beside it

### Requirement: A screen with a fixture appears on the parity page and in the visual suite without a list

A screen with a fixture SHALL appear on the parity page and in the visual suite, with no separate list to maintain.

#### Scenario: New fixture added

- **GIVEN** a new screen is given a fixture
- **WHEN** the parity page and the visual suite are next run
- **THEN** the screen appears on both
- **AND** no list has been edited to make it appear

### Requirement: A fixture's variants are approved as states of their screen

A fixture's variants SHALL be approved as further states of their screen.

#### Scenario: Variant approved

- **GIVEN** a screen whose fixture names variants
- **WHEN** the visual suite runs
- **THEN** each variant is held as a state of that screen

### Requirement: A motion-only screen is shot but kept out of the suite

A screen whose fixture marks it motion-only SHALL be shot on the parity page and SHALL be kept out of the visual suite.

#### Scenario: Motion-only screen

- **GIVEN** a 3D scene whose fixture marks it motion-only
- **WHEN** the parity page and the visual suite run
- **THEN** the scene is shot on the parity page
- **AND** the scene is not held in the visual suite

### Requirement: A screen scales to the window's smaller side

A screen SHALL draw inside a frame scaled by the window's smaller side, as the game scales its interface.

#### Scenario: Window narrower than 16 by 9

- **GIVEN** a window narrower than 16 by 9
- **WHEN** a screen is drawn in it
- **THEN** its text fits within the boxes laid out for it

### Requirement: A screen draws no heading element

A screen SHALL draw no heading element, so that a host page's heading styles do not reach into it.

#### Scenario: Screen hosted in a page with heading styles

- **GIVEN** a screen hosted in a page whose heading styles would otherwise apply
- **WHEN** the screen is drawn
- **THEN** its headings are drawn as paragraphs marked as headings
- **AND** the host page's heading styles do not change them

### Requirement: The opening shows the game's first screens in turn and owns every handoff

The game's opening SHALL show its first screens in turn, and SHALL own every handoff between them.

#### Scenario: Opening played

- **GIVEN** the opening is started
- **WHEN** it plays through
- **THEN** the splashes, the login screen and the startup screen are shown in turn
- **AND** each handoff between them follows its own timing
