## Purpose

One dialog shell — StyledDialog owns the library dialog's body, the actions row and the confirm button every dialog confirms through.

## Requirements

### Requirement: Every dialog with an actions row shares one shell

Every dialog that has an actions row SHALL present its title, a close control and a scrolling body through one shared shell.

#### Scenario: A dialog shows its title with a close control

- **GIVEN** a dialog with a title is opened
- **WHEN** the dialog is shown
- **THEN** the title bar shows the title and a close control

#### Scenario: A long body scrolls inside the dialog

- **GIVEN** a dialog's body is taller than the screen
- **WHEN** the reader scrolls the dialog
- **THEN** the body scrolls within the dialog

### Requirement: A dialog's body exists only while the dialog is open

A dialog's body SHALL exist only while the dialog is open, and SHALL stay visible until its closing motion has played.

#### Scenario: The body stays visible while the dialog leaves

- **GIVEN** the reader closes a dialog
- **WHEN** the closing motion plays
- **THEN** the body is still shown
- **AND** it is removed once the motion has finished

#### Scenario: A reopened dialog starts from its current state

- **GIVEN** the reader closed a dialog with a form partly filled
- **WHEN** the reader opens the dialog again
- **THEN** the dialog starts from the state its model describes

### Requirement: The actions row holds Cancel, extra decisions and annotations in fixed places

The actions row SHALL hold Cancel, any third decision between Cancel and confirm, and an annotation at its leading edge that is never a decision.

#### Scenario: A third decision sits between Cancel and confirm

- **GIVEN** a dialog offers a third choice such as discard
- **WHEN** the actions row is shown
- **THEN** the third choice sits between Cancel and the confirm button

#### Scenario: An annotation at the leading edge is not a button

- **GIVEN** the actions row carries a counter such as three of ten options
- **WHEN** the reader looks at the row
- **THEN** the counter is shown as text and is not a button

### Requirement: A dialog with nothing to confirm has no actions row

A dialog with nothing to confirm SHALL show no actions row, and its close control SHALL be its only dismissal.

#### Scenario: A read-only dialog offers only its close control

- **GIVEN** a dialog shows information without a confirm action
- **WHEN** the dialog is shown
- **THEN** no Cancel or confirm button is shown
- **AND** the close control dismisses the dialog

### Requirement: The confirm control is the dialog's one accent action and names its act

The confirm control SHALL be the dialog's one accent action, labelled with what it does.

#### Scenario: The confirm label names the act

- **GIVEN** a dialog has a confirm action
- **WHEN** the dialog is shown
- **THEN** the confirm button is in the accent colour
- **AND** its label names what it does

### Requirement: Confirming closes the dialog itself after its answer

Confirming SHALL close the dialog itself, awaiting the answer unless the write is optimistic, and a refused answer SHALL keep the dialog open with its draft intact.

#### Scenario: An awaited confirm holds the dialog until the answer arrives

- **GIVEN** the reader confirms a dialog whose write is not optimistic
- **WHEN** the answer is pending
- **THEN** the confirm button shows pending
- **AND** the dialog stays open until the answer settles

#### Scenario: A refused answer keeps the draft

- **GIVEN** the reader confirms a dialog and the write is refused
- **WHEN** the refusal arrives
- **THEN** the dialog stays open
- **AND** the draft the reader entered is still there

#### Scenario: An optimistic confirm closes at once

- **GIVEN** the write behind a dialog is optimistic
- **WHEN** the reader confirms
- **THEN** the dialog closes at once

### Requirement: A form dialog submits only valid input

A form dialog SHALL disable its confirm control while any field fails, and SHALL submit only once its fields are valid.

#### Scenario: An invalid field disables the confirm control

- **GIVEN** a form dialog has a field with an invalid value
- **WHEN** the reader looks at the confirm control
- **THEN** the confirm control is disabled

#### Scenario: A valid form submits when confirmed

- **GIVEN** every field of a form dialog is valid
- **WHEN** the reader confirms
- **THEN** the form submits

### Requirement: An editor dialog shows the item's kind and name in its header

An editor dialog SHALL show the item's kind and name in its header, with its save as the one accent button and its delete and close as quiet icon buttons.

#### Scenario: The header follows the name as the reader types

- **GIVEN** the reader is editing an item's name
- **WHEN** the reader types in the name field
- **THEN** the header's name follows the typed text

#### Scenario: Save is the one accent button in the editor header

- **GIVEN** the reader is editing an item
- **WHEN** the editor is shown
- **THEN** the save button is the one accent button in its header
- **AND** delete and close are quiet icon buttons

### Requirement: Closing an editor with unsaved changes asks save, discard or cancel

Closing an editor with unsaved changes SHALL ask the reader to save, discard or cancel.

#### Scenario: A dirty close offers three choices

- **GIVEN** the reader has unsaved changes in an editor
- **WHEN** the reader closes the editor
- **THEN** the reader is offered save, discard and cancel

#### Scenario: Discard drops the unsaved changes

- **GIVEN** the reader has unsaved changes in an editor
- **WHEN** the reader chooses discard
- **THEN** the unsaved changes are dropped
- **AND** the editor closes

### Requirement: A new dialog with an actions row uses the shared shell

A new dialog with an actions row SHALL use the shared shell rather than build its own confirm pair, and a region only one dialog needs SHALL NOT be added to the shell.

#### Scenario: A feature's new confirm dialog uses the shared shell

- **GIVEN** a feature needs a dialog with a confirm action
- **WHEN** the dialog is built
- **THEN** it uses the shared shell

#### Scenario: A region needed by a second dialog becomes a slot

- **GIVEN** a dialog needs a pinned region that no other dialog uses
- **WHEN** a second dialog needs the same region
- **THEN** the region becomes a slot on the shared shell
