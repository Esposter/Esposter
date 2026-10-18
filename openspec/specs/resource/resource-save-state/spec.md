## Purpose

One derived state says whether the open resource's edits are durable, because every type's edits — a third-party editor's autosave, a toolbar command, a dialog's Save — land through one store action.

## Requirements

### Requirement: The title row shows one save state

The title row of an open resource SHALL show one save state saying whether what is on screen has reached the server.

#### Scenario: Owner looks at a saved resource

- **GIVEN** every edit has reached the server
- **WHEN** the owner looks at the title row
- **THEN** the save state reads Saved

### Requirement: The most urgent true state is shown

The save state SHALL show the most urgent state that is true, in the order Out of date, Saving, Not saved, then Saved.

#### Scenario: Out of date while a save is pending

- **GIVEN** another session's save made this resource out of date
- **AND** an edit is waiting to be saved
- **WHEN** the owner looks at the title row
- **THEN** the save state reads Out of date

### Requirement: Unwritten edits count as saving

Edits still held by the autosave delay SHALL show the save state as Saving, never as Saved.

#### Scenario: Owner keeps typing

- **GIVEN** the owner is typing and the autosave delay is holding the edits
- **WHEN** the owner looks at the title row
- **THEN** the save state reads Saving

### Requirement: Saved shows when the resource was last saved

A Saved state SHALL show how long ago the resource was last saved, and the exact time on hover.

#### Scenario: Owner hovers over Saved

- **GIVEN** the save state reads Saved
- **WHEN** the owner hovers over the save state
- **THEN** the exact time of the last save is shown

### Requirement: Out of date stays until the resource is reloaded

A resource whose save was refused as out of date SHALL show Out of date until it is reloaded.

#### Scenario: Owner dismisses the notice

- **GIVEN** a save was refused as out of date
- **WHEN** the owner dismisses the notice
- **THEN** the save state still reads Out of date

### Requirement: A failed save shows Not saved until one succeeds

A save that fails for any reason other than being out of date SHALL leave the save state as Not saved until a later save succeeds.

#### Scenario: Save fails for another reason

- **GIVEN** a save failed
- **WHEN** the owner looks at the title row
- **THEN** the save state reads Not saved

### Requirement: An oversized document is refused before it is sent

A document too large to save SHALL be refused before any request is sent, and the save state SHALL read Not saved.

#### Scenario: Document over the size limit

- **GIVEN** the owner's document is larger than the size limit
- **WHEN** the document is saved
- **THEN** no save request is sent
- **AND** a notice names the document's size and the limit
- **AND** the save state reads Not saved

### Requirement: The save state reflects only the resource on screen

The save state SHALL reflect only saves of the resource currently on screen.

#### Scenario: Owner switches resources during a save

- **GIVEN** a save of one resource is still in flight
- **WHEN** the owner opens a different resource that has no unsaved edits
- **THEN** the save state reads Saved

### Requirement: The save state is a readout and offers no save command

The save state SHALL be a readout only and SHALL NOT offer a command that saves.

#### Scenario: Looking for a save button

- **GIVEN** the owner has a resource open
- **WHEN** the owner looks for a command to save its content
- **THEN** no save command is offered

### Requirement: Each save state is told apart without colour

Each save state SHALL be told apart by its glyph as well as by its colour, and each change of state SHALL be announced to assistive technology.

#### Scenario: Screen reader user

- **GIVEN** a screen reader is in use
- **WHEN** the save state changes
- **THEN** the change is announced
