# resource/page-builder/keyboard Specification

## Purpose

The page builder's keys: each one a command the shortcuts dialog lists, the frame's own arrows and Escape, and the keys a text field keeps for itself.

## Requirements

### Requirement: Each key the page builder takes is a listed command

Each key the editor and the canvas take SHALL be a command the shortcuts dialog lists, and a key that acts SHALL act while the editor is open.

#### Scenario: Alt with an arrow moves the selected node

- **GIVEN** a node selected in the page
- **WHEN** the owner presses Alt with Arrow down
- **THEN** the node moves among its siblings, and the selection stays on it

#### Scenario: Delete removes the selected node

- **GIVEN** a node selected in the page
- **WHEN** the owner presses Delete
- **THEN** the node is removed without a confirmation

#### Scenario: Ctrl C copies the selected node

- **GIVEN** a node selected in the page
- **WHEN** the owner presses Ctrl C
- **THEN** the selected node is copied to the clipboard

### Requirement: Keys typed in a text field are taken by no command

A key pressed in an input, a textarea, a select or a content-editable element SHALL NOT be taken by the editor or the canvas.

#### Scenario: Delete in a text field does not delete the node

- **GIVEN** a text field inside the page builder with a node selected
- **WHEN** the owner presses Delete in the text field
- **THEN** the node is not deleted

### Requirement: Enter edits a selected text node unless a control holds focus

Enter SHALL start a text edit on the selected text node, and SHALL NOT do so while a button or a link holds focus, since the focused control takes Enter as its own activation.

#### Scenario: Enter edits the selected text node in place

- **GIVEN** a selected text node
- **WHEN** the owner presses Enter
- **THEN** the node opens for editing

#### Scenario: Enter on a focused button activates it

- **GIVEN** a selected text node and a focused button
- **WHEN** the owner presses Enter
- **THEN** no text edit starts

### Requirement: The canvas takes its arrows and Escape and hands the other keys to the editor

The canvas SHALL take an unmodified Arrow down, Arrow up and Escape as the next block, the previous block and the parent, and SHALL hand every other key pressed in its frame to the editor, so that the editor's commands work from the frame.

#### Scenario: Arrow down in the frame selects the next node

- **GIVEN** a page whose first node is selected
- **WHEN** the owner presses Arrow down in the canvas
- **THEN** the next node in document order is selected

#### Scenario: Alt with an arrow in the frame is handed to the editor

- **GIVEN** a node selected in the page and the canvas focused
- **WHEN** the owner presses Alt with Arrow down in the canvas
- **THEN** the key reaches the editor and the selection stays where it was

#### Scenario: Delete in the frame deletes the selected node

- **GIVEN** a node selected in the page
- **WHEN** a Delete forwarded from the canvas reaches the editor
- **THEN** the selected node is deleted

### Requirement: A pending delete holds the editor's keys until it answers

While a node's delete confirmation is open, the editor's keys SHALL NOT act, and they SHALL act again once it closes.

#### Scenario: Delete waits for the confirmation's answer

- **GIVEN** a node's delete confirmation is open
- **WHEN** the owner presses Delete
- **THEN** the node is not deleted, and once the confirmation closes Delete deletes it

### Requirement: Escape cancels a drag in progress

Escape SHALL cancel a drag from the palette or a merge field while the pointer is still down, and the drag SHALL insert nothing.

#### Scenario: Escape cancels a drag

- **GIVEN** a block dragged from the palette past the drag threshold
- **WHEN** the owner presses Escape before releasing the pointer
- **THEN** the block is not inserted
