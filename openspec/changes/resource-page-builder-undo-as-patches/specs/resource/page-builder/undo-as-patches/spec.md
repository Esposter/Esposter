## ADDED Requirements

### Requirement: Each edit is recorded so that undo restores the prior document

Each page builder edit SHALL be recorded with the reverse of its operations, so that undo restores the document as it was before the edit.

#### Scenario: Undo restores the document before the last edit

- **GIVEN** a block moved to a new position in the page
- **WHEN** the owner presses Undo
- **THEN** the block is back at its previous position

### Requirement: Redo reapplies the last undone edit

Redo SHALL reapply the most recent undone edit, and a new edit SHALL discard the edits that were undone.

#### Scenario: Redo reapplies an undone edit

- **GIVEN** an edit that has been undone
- **WHEN** the owner presses Redo
- **THEN** the edit is applied again

#### Scenario: A new edit after undo discards the redo entry

- **GIVEN** an edit that has been undone
- **WHEN** the owner makes a new edit
- **THEN** Redo has nothing to reapply

### Requirement: Repeated changes to one value within one interaction form one undo entry

Repeated changes to one value within one interaction SHALL form a single undo entry.

#### Scenario: A drag of a value is one undo entry

- **GIVEN** a value changed in ten steps during one slider drag
- **WHEN** the owner presses Undo once
- **THEN** the value returns to what it was before the drag

### Requirement: The undo history is bounded and drops its oldest entries first

The undo history for an open resource SHALL hold a bounded number of entries, and the oldest entries SHALL drop first when it is full.

#### Scenario: Undo stops at the oldest kept entry

- **GIVEN** more edits than the history holds
- **WHEN** the owner presses Undo until nothing more is undone
- **THEN** the edits that dropped out of the history are not undone

### Requirement: Restoring a version clears the undo history

Restoring a version SHALL clear the undo history of the open resource.

#### Scenario: Restoring a version leaves nothing to undo

- **GIVEN** a resource with edits in its undo history
- **WHEN** the owner restores a version and then presses Undo
- **THEN** nothing is undone

### Requirement: The command bar names the edit that Undo or Redo would act on

The command bar SHALL name the edit that Undo would reverse and the edit that Redo would reapply.

#### Scenario: The command bar names the edit it would undo

- **GIVEN** an edit in the undo history
- **WHEN** the owner views the command bar
- **THEN** the Undo command names that edit

### Requirement: Edits are saved as the whole document

Edits SHALL NOT be saved one at a time, and a save SHALL store the whole document as it is on screen.

#### Scenario: A save stores the whole document after edits

- **GIVEN** several edits made since the last save
- **WHEN** the document is saved
- **THEN** reopening the resource shows the document as it was on screen
