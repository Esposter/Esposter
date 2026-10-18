## Purpose

The bounded history in @esposter/shared — an undo and redo stack of entries of any type, bounded by the limit its consumer passes, which the editor core's documents and the sheet's commands both undo through.

## Requirements

### Requirement: The history undoes and redoes edits in order within its bound

The bounded history SHALL undo edits newest first and redo them last undone first, so a redo reverses the undo order, SHALL drop the redo entries when a new edit is made, and SHALL drop its oldest entry when a new entry would take it past the consumer's limit.

#### Scenario: A new edit after undo

- **GIVEN** a history with one undone edit
- **WHEN** a new edit is pushed
- **THEN** there is nothing to redo

#### Scenario: The bound is reached

- **GIVEN** a history holding as many entries as its limit
- **WHEN** one more edit is pushed
- **THEN** the oldest entry can no longer be undone
