## Purpose

Where the app's look and behaviour are looked up rather than improvised — the reference products each area follows, the design systems the tokens and surfaces draw on, the usability and accessibility references every control is held to, and the platform documents the implementation follows — with the order they are consulted in.

## Requirements

### Requirement: Every surface is designed by consulting its sources in order

Every surface SHALL be designed by consulting its sources in order, from its reference product through to the platform's own documents.

#### Scenario: A surface with a reference product matches its hierarchy and wording

- **GIVEN** a surface has a reference product that does the same screen
- **WHEN** the surface is designed
- **THEN** its hierarchy, wording and interaction match that product

#### Scenario: A screen with no reference product draws on shipped screens

- **GIVEN** no reference product covers a screen
- **WHEN** the screen is designed
- **THEN** a gallery of shipped screens from several products is consulted instead

#### Scenario: A departure from the reference is argued in its change

- **GIVEN** a surface departs from its reference product
- **WHEN** the change is committed
- **THEN** the commit body says how the departure is better
- **AND** cites the source it came from

### Requirement: Each product area follows one reference product

Each product area SHALL follow one reference product that already solved its domain.

#### Scenario: A screenshot handed over is the specification for its surface

- **GIVEN** the reader hands over a screenshot of a reference product for a surface
- **WHEN** the surface is designed
- **THEN** the screenshot is the specification the surface follows

#### Scenario: The calendar follows the reference calendar's views

- **GIVEN** the reader opens the calendar
- **WHEN** the reader looks at its views
- **THEN** the views appear in the reference calendar's order

### Requirement: Every design token value is chosen against a named design system

Every value in the design tokens SHALL be chosen against a named design system, never by eye alone.

#### Scenario: A changed token value names the design system it follows

- **GIVEN** a design token value is changed
- **WHEN** the change is reviewed
- **THEN** the change names the design system the new value follows

### Requirement: Every library control responds to the keyboard as its published pattern describes

Every library control SHALL respond to the keyboard as its published accessibility pattern describes.

#### Scenario: Arrow keys move through a list as the listbox pattern describes

- **GIVEN** a reader is operating a list with the keyboard
- **WHEN** the reader presses the arrow keys and Enter
- **THEN** the highlighted item moves with each arrow key
- **AND** Enter chooses the highlighted item

### Requirement: A modal dialog interrupts only for what must interrupt

A modal dialog SHALL be used only for a choice that must interrupt the reader, and anything else SHALL open as a popover or panel beside the content.

#### Scenario: An optional choice opens beside the content

- **GIVEN** a choice is optional for the reader
- **WHEN** the choice is shown
- **THEN** it appears as a popover or panel beside the content

#### Scenario: A required confirmation blocks the page

- **GIVEN** a choice must be answered before the reader continues
- **WHEN** the choice is shown
- **THEN** a modal dialog blocks the rest of the page

### Requirement: Every action shows feedback within 400 milliseconds

Every action SHALL show feedback within 400 milliseconds of the reader acting.

#### Scenario: A pressed control responds within the threshold

- **GIVEN** the reader presses a control
- **WHEN** the app begins to respond
- **THEN** feedback appears within 400 milliseconds

### Requirement: A confirmation's answer names the act it performs

A confirmation's answer SHALL name the act it performs rather than use a generic word.

#### Scenario: A delete confirmation answers with Delete

- **GIVEN** a delete confirmation is shown
- **WHEN** the reader sees its answer
- **THEN** the answer reads Delete rather than OK

### Requirement: Motion shows origin and never decorates a frequent action

Motion SHALL show where something came from or went, and SHALL NOT decorate a frequently repeated action.

#### Scenario: A dialog rises from where it came from

- **GIVEN** the reader opens a dialog
- **WHEN** the dialog appears
- **THEN** it moves from the place it was opened from

#### Scenario: A frequently repeated action runs without motion

- **GIVEN** the reader repeats a frequent action
- **WHEN** the action completes
- **THEN** it shows no decorative motion

### Requirement: Recent places rank by how often and how recently they were visited

The dock's recent pages and the palette's places SHALL rank by how often and how recently the reader visited them.

#### Scenario: A frequently and recently visited place ranks first

- **GIVEN** the reader has visited one page often and recently and another once
- **WHEN** the reader opens the palette
- **THEN** the frequently and recently visited page ranks first

### Requirement: Menus, selects, tooltips and dialogs open in the browser's top layer

Every menu, select, tooltip and dialog SHALL open above all page content in the browser's top layer.

#### Scenario: A tooltip inside a scrolling panel is not clipped

- **GIVEN** a tooltip is opened inside a scrolling panel
- **WHEN** the tooltip is shown
- **THEN** the panel's scrolling does not clip it
