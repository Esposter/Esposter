# resource/page-builder/keyboard Specification

## Purpose

The page builder's keys: which handler takes each key, from one table that the canvas and the editor both read, and the keys a text field keeps for itself.

## Requirements

### Requirement: One table names the key each handler takes

Each key the page builder takes SHALL be a row of one table, and a key SHALL take the action of the first row that matches its scope, key and modifiers.

#### Scenario: Arrow down in the frame selects the next node

- **GIVEN** a page whose first node is selected
- **WHEN** the owner presses Arrow down in the canvas
- **THEN** the next node in document order is selected

#### Scenario: Alt with an arrow moves the selected node

- **GIVEN** a node selected in the page
- **WHEN** the owner presses Alt with Arrow down
- **THEN** the node moves among its siblings, and the plain arrow keeps selecting

### Requirement: Keys typed in a text field are taken by neither handler

A key pressed in an input, a textarea, a select or a content-editable element SHALL NOT be taken by the canvas or the editor.

#### Scenario: Delete in a text field does not delete the node

- **GIVEN** a text field inside the page builder with a node selected
- **WHEN** the owner presses Delete in the text field
- **THEN** the node is not deleted

### Requirement: Enter edits a selected text node unless a control holds focus

Enter SHALL start a text edit on the selected text node, and SHALL NOT do so while a button or a link holds focus, since the focused control takes Enter as its own activation.

#### Scenario: Enter on a focused button activates it

- **GIVEN** a selected text node and a focused button
- **WHEN** the owner presses Enter
- **THEN** no text edit starts

### Requirement: The canvas forwards the keys it takes no command for

A key pressed in the canvas's frame that the canvas does not take SHALL reach the editor's handler, so that the editor's commands work from the frame.

#### Scenario: Ctrl C in the frame copies the selected node

- **GIVEN** a node selected and the canvas focused
- **WHEN** the owner presses Ctrl C
- **THEN** the selected node is copied to the clipboard
