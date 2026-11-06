# resource/whiteboard-layout Specification

## Purpose

The whiteboard's arrangement on the editor shell, so a reader finds every tool in one toolbar and places an element by choosing its tool and drawing it. It also covers the properties panel that follows the selection, the undo and redo beside zoom, the tool shortcuts and the compact toolbar at the bottom edge.

## Requirements

### Requirement: Every tool is in the top toolbar

The whiteboard SHALL hold select, hand, the shapes, arrow, freehand, text, sticky note and image in one toolbar, and SHALL have no palette.

#### Scenario: Every tool is in the top toolbar

- **GIVEN** a whiteboard on an expanded window
- **WHEN** it is drawn
- **THEN** the toolbar holds a button or slot for each of those tools
- **AND** no palette is drawn

### Requirement: The image tool opens a file picker

The image tool SHALL open a file picker and insert the chosen files as a pasted image is inserted.

#### Scenario: The image tool opens the file picker

- **GIVEN** a whiteboard on an expanded window
- **WHEN** the image tool is pressed
- **THEN** a file picker opens
- **AND** the chosen images are inserted as a paste inserts them

### Requirement: A shape tool places an element by a click or a drag

With a placing tool in hand, a click on the canvas SHALL place an element of the default size at the point, and a drag SHALL place it with the size of the drag.

#### Scenario: A click with a shape tool places a shape at the point

- **GIVEN** the rectangle tool in hand
- **WHEN** the reader clicks the canvas
- **THEN** a rectangle of the default size is placed at the point
- **AND** it is selected

#### Scenario: A drag with a shape tool sizes the shape

- **GIVEN** the rectangle tool in hand
- **WHEN** the reader drags across the canvas
- **THEN** a rectangle the size of the drag is placed

#### Scenario: A placement the document check refuses leaves the document unchanged

- **GIVEN** the rectangle tool in hand and a document check that refuses the insert
- **WHEN** the reader clicks the canvas
- **THEN** the document is unchanged
- **AND** the reader is shown the error

### Requirement: A placement returns the tool to select

After one placement the tool in hand SHALL return to select, unless the tool is locked.

#### Scenario: A placement returns the tool to select

- **GIVEN** the rectangle tool in hand and not locked
- **WHEN** the reader places a rectangle
- **THEN** the tool in hand is select

#### Scenario: A locked tool stays in hand

- **GIVEN** the rectangle tool in hand and locked
- **WHEN** the reader places a rectangle
- **THEN** the rectangle tool is still in hand

### Requirement: Every tool has a shortcut

Each tool SHALL have a shortcut registered as a command, and a shortcut typed into a text field SHALL be text and not a tool change.

#### Scenario: A tool shortcut switches the tool

- **GIVEN** the canvas focused
- **WHEN** the reader presses the arrow tool's key
- **THEN** the arrow tool is in hand

#### Scenario: A shortcut typed into a text field is text

- **GIVEN** a shape's label being edited
- **WHEN** the reader types the arrow tool's key
- **THEN** the character is added to the label
- **AND** the tool in hand is unchanged

### Requirement: The properties panel follows the selection

The properties panel SHALL open over the canvas for a selection, with the content of the selected kind, and SHALL be absent with nothing selected.

#### Scenario: The panel shows an arrow's route

- **GIVEN** an arrow selected
- **WHEN** the properties panel is drawn
- **THEN** it shows the arrow's route and its arrowheads

#### Scenario: The properties panel is absent with nothing selected

- **GIVEN** a whiteboard with nothing selected
- **WHEN** it is drawn
- **THEN** no properties panel is drawn

### Requirement: Undo and redo are buttons beside zoom

The whiteboard SHALL show undo and redo in its view region beside zoom, each disabled when its history is empty.

#### Scenario: Undo and redo are buttons beside zoom

- **GIVEN** a whiteboard with one edit made
- **WHEN** it is drawn
- **THEN** undo is enabled
- **AND** redo is disabled

### Requirement: A compact whiteboard moves its toolbar to the bottom

On a compact window the whiteboard SHALL draw its toolbar docked at the bottom edge.

#### Scenario: A compact window moves the toolbar to the bottom

- **GIVEN** a whiteboard on a compact window
- **WHEN** it is drawn
- **THEN** the toolbar is docked at the bottom edge
