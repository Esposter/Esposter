## Purpose

Every delete asks first, through one shared dialog — UiConfirmDialog, the answer it owns, the lint rule that holds it, and an opt-in Azure-style type-the-name guard.

## Requirements

### Requirement: Every delete asks the reader to confirm first

Every delete SHALL ask the reader to confirm through the one shared confirmation dialog before anything is removed.

#### Scenario: A delete opens the confirmation before removing anything

- **GIVEN** the reader presses a delete control on a room
- **WHEN** the press registers
- **THEN** the confirmation dialog opens
- **AND** nothing is removed until the reader confirms

#### Scenario: An undoable delete still asks first

- **GIVEN** the reader presses delete on a resource the app can restore
- **WHEN** the press registers
- **THEN** the confirmation dialog opens before the resource moves

### Requirement: A delete the app can undo still offers the way back

A delete the app can undo SHALL offer its undo once it has happened.

#### Scenario: Moving a resource to the recycle bin offers a restore

- **GIVEN** the reader confirms moving a resource to the recycle bin
- **WHEN** the move completes
- **THEN** a notice offers to restore the resource

#### Scenario: A deleted sheet row is reversed by the toolbar's undo

- **GIVEN** the reader confirms deleting a sheet row
- **WHEN** the delete completes
- **THEN** the toolbar's undo reverses the deletion
- **AND** no notice is shown for it

### Requirement: The confirmation opens on Cancel

The confirmation dialog SHALL open with focus on Cancel, so a stray Enter destroys nothing.

#### Scenario: Enter on a freshly opened confirmation cancels it

- **GIVEN** the confirmation dialog has just opened
- **WHEN** the reader presses Enter
- **THEN** the dialog closes
- **AND** nothing is deleted

### Requirement: An awaited delete keeps the dialog open until it settles

An awaited confirmation SHALL keep the dialog locked until the delete settles, and SHALL keep the dialog open when the delete is refused or fails.

#### Scenario: The dialog stays locked while the delete is pending

- **GIVEN** the reader confirms a delete that waits on the server
- **WHEN** the delete is pending
- **THEN** the answer button shows pending
- **AND** the dialog cannot be dismissed

#### Scenario: A refused or failed delete leaves the dialog open to try again

- **GIVEN** the reader confirms a delete that waits on the server
- **WHEN** the delete is refused or fails
- **THEN** the dialog stays open with its answer ready to try again
- **AND** a failure raises an error alert

### Requirement: An optimistic delete closes at once and rolls back on rejection

An optimistic confirmation SHALL close at once, and a rejected write SHALL be answered by rolling back the list and showing an error.

#### Scenario: An optimistic delete closes as soon as it is confirmed

- **GIVEN** a delete is optimistic
- **WHEN** the reader confirms it
- **THEN** the dialog closes at once
- **AND** the list already shows the removal

#### Scenario: A rejected optimistic delete restores the list and shows an error

- **GIVEN** an optimistic delete was confirmed and the server rejects it
- **WHEN** the rejection arrives
- **THEN** the removed item returns to the list
- **AND** the reader sees an error notice

### Requirement: A high-stakes delete requires the exact entity name

A high-stakes delete SHALL require the reader to type the entity's exact name before its answer is enabled.

#### Scenario: The answer stays disabled until the name matches exactly

- **GIVEN** the name-guarded confirmation is open
- **WHEN** the reader types a name that differs from the entity's name
- **THEN** the answer stays disabled

#### Scenario: The exact name enables the answer

- **GIVEN** the name-guarded confirmation is open
- **WHEN** the reader types the entity's exact name
- **THEN** the answer is enabled

#### Scenario: A reopened confirmation starts locked

- **GIVEN** the reader typed a name into a name-guarded confirmation and closed it
- **WHEN** the reader opens the confirmation again
- **THEN** the typed text is cleared
- **AND** the answer is disabled

### Requirement: Only irreversible container-level deletes require the typed name

Only irreversible container-level deletes SHALL require the typed name, and every other delete SHALL use the plain confirmation.

#### Scenario: A resource delete uses the plain confirmation

- **GIVEN** the reader deletes a resource
- **WHEN** the confirmation opens
- **THEN** no typed name is required

#### Scenario: A room delete requires the room's name

- **GIVEN** the reader deletes a room
- **WHEN** the confirmation opens
- **THEN** the reader must type the room's name before the answer is enabled

### Requirement: No destructive control deletes on click

No destructive control SHALL delete on click, and every destructive control SHALL open the confirmation instead.

#### Scenario: Clicking a delete control opens the confirmation and deletes nothing

- **GIVEN** a dashboard visual's delete control is shown
- **WHEN** the reader clicks it
- **THEN** the confirmation opens
- **AND** nothing is deleted

#### Scenario: A delete written directly into a template handler fails lint

- **GIVEN** a template event handler calls a removal directly
- **WHEN** the lint check runs
- **THEN** the check fails

### Requirement: A confirmation about one message or post quotes it

A confirmation about one message, post or comment SHALL show that item as a preview, so the reader sees what will go.

#### Scenario: Deleting a message shows the message in the confirmation

- **GIVEN** the reader asks to delete a message
- **WHEN** the confirmation opens
- **THEN** the message is shown as a preview inside it
