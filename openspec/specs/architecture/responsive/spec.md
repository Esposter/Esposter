## Purpose

One breakpoint scale feeding both the library's breakpoints and UnoCSS, one component serving every device, the ladder a surface climbs before it earns a device-specific one, and when to branch in script versus in the template.

## Requirements

### Requirement: One breakpoint scale for script and template

The app SHALL decide every layout breakpoint from one shared width scale that both script decisions and template breakpoint prefixes read.

#### Scenario: Script and template change at the same width

- **GIVEN** a surface that branches on width in script and also uses a width prefix in its template
- **WHEN** the viewport crosses the narrowest breakpoint
- **THEN** the script decision and the template prefix change at that same width

### Requirement: Server render starts narrow

A page SHALL render the narrow layout on the server and switch to the measured layout once it has mounted in the reader's browser.

#### Scenario: Width-dependent page loads without a mismatch

- **GIVEN** a page whose layout depends on viewport width
- **WHEN** the page is first rendered by the server
- **THEN** the narrow layout is shown without any width assumed
- **AND** the layout switches to the measured width after mount, with no mismatch on load

### Requirement: Script branches only for a different layout

A surface SHALL branch on width in script only when a narrow viewport needs a different layout, and otherwise changes values through width prefixes in its template.

#### Scenario: A docked column becomes a sheet

- **GIVEN** a docked column that must become a sheet over the page on a narrow viewport
- **WHEN** the viewport is narrow
- **THEN** the surface reads the width in script and renders the sheet

#### Scenario: A grid changes its column count

- **GIVEN** a grid whose column count changes with width and whose structure is otherwise the same
- **WHEN** the viewport width changes
- **THEN** the template's width prefix changes the column count with no script branch

### Requirement: Surfaces climb the ladder from the simplest rung

A surface SHALL adapt through the lowest rung of the ladder that meets its need, and SHALL move to a device-specific component only when every rung below it fails.

#### Scenario: A surface that fits a phone needs no branch

- **GIVEN** a surface whose markup fits and works on a phone with no change
- **WHEN** the reader opens it on a phone
- **THEN** the same markup reflows with no width branch

#### Scenario: Occasional commands wait in the overflow menu

- **GIVEN** a toolbar that does not fit a narrow screen
- **WHEN** the reader views the toolbar on a phone
- **THEN** its occasional commands wait in the overflow menu at every width
- **AND** no second, phone-only bar of buttons is shown

### Requirement: Input device decides input controls

Input controls SHALL be chosen by the device the reader is holding, never by the width of the window.

#### Scenario: A narrow desktop window keeps keyboard controls

- **GIVEN** a narrow desktop window with a keyboard attached
- **WHEN** the reader plays or acts in a surface with input controls
- **THEN** the keyboard controls are shown

#### Scenario: A wide touch tablet shows touch controls

- **GIVEN** a wide touch tablet with no keyboard
- **WHEN** the reader acts in the same surface
- **THEN** the touch controls are shown

### Requirement: The dock steps aside for the on-screen keyboard only on touch screens

The dock SHALL step aside while a composer has focus only on a touch screen, where an on-screen keyboard covers the page.

#### Scenario: A composer focused on a narrow desktop window

- **GIVEN** a narrow desktop window with a composer on screen
- **WHEN** the reader focuses the composer's text
- **THEN** the dock stays in place

#### Scenario: A composer focused on a touch screen

- **GIVEN** a touch screen with a composer on screen
- **WHEN** the reader focuses the composer's text
- **THEN** the dock steps aside to make room for the on-screen keyboard

### Requirement: Device-specific components are named for their input

A component written for one input device SHALL be named for that input and placed beside the component it replaces, never inside a folder kept per device.

#### Scenario: A joystick control beside the keyboard control

- **GIVEN** a surface that needs a control for joystick input beside its keyboard control
- **WHEN** the joystick control is added
- **THEN** it is named for joystick input and sits beside the keyboard control

#### Scenario: A phone copy of a surface is refused

- **GIVEN** a change that proposes a separate folder holding a phone copy of a surface
- **WHEN** the change is reviewed
- **THEN** it is rejected in favour of one component that adapts
