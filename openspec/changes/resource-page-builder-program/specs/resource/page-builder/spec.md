## ADDED Requirements

### Requirement: Every edit in the page builder can be undone

Every edit made in the page builder SHALL be undoable, and undoing it SHALL restore the document as it was before the edit.

#### Scenario: Undo reverts the last edit and redo restores it

- **GIVEN** a block moved to a new position in a webpage
- **WHEN** the owner presses Undo and then Redo
- **THEN** the block returns to its previous position
- **AND** Redo moves the block to its new position again

### Requirement: A published page is produced on the server

A published webpage or email SHALL be produced on the server at publish, and a reader SHALL receive that output without the editor.

#### Scenario: A published page is produced on the server

- **GIVEN** a webpage published from the editor
- **WHEN** a reader opens the published page
- **THEN** the page shows the output produced at publish
- **AND** the page loads no script from the editor

### Requirement: An editor loads no third-party origin of its own

An editor SHALL load no script, style or font from an origin outside the app.

#### Scenario: Opening an editor requests no third-party origin

- **GIVEN** an owner who opens a webpage editor
- **WHEN** the editor finishes loading
- **THEN** no request is made to an origin outside the app

### Requirement: Every pointer action has a keyboard path

Every drag and every pointer action in the page builder SHALL have a keyboard or single-pointer alternative.

#### Scenario: A block can be moved with the keyboard alone

- **GIVEN** a block selected in a webpage
- **WHEN** the owner moves it with the keyboard
- **THEN** the block moves to the new position without a drag

### Requirement: The cutover removes every existing webpage and email

The cutover SHALL remove every existing webpage and email, whatever its state, together with the old editor.

#### Scenario: Existing webpages and emails are gone after the cutover

- **GIVEN** webpages and emails in every state before the cutover
- **WHEN** the cutover is deployed and its purge has run
- **THEN** no webpage or email created before the cutover remains
