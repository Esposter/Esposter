## ADDED Requirements

### Requirement: An open resource hears another device's save

An open resource SHALL receive a save made from another device, whatever its type, and SHALL NOT receive a notice for a save made from its own device.

#### Scenario: An open resource of any type hears another device's save

- **GIVEN** a resource of any type is open on one device
- **WHEN** another device saves that resource
- **THEN** the open resource learns of the new version

#### Scenario: A device does not hear its own save

- **GIVEN** a resource is open on a device
- **WHEN** that same device saves the resource
- **THEN** no notice of another device's save is shown

### Requirement: An editor with nothing unsaved adopts another device's save in place

An open editor with no unsaved edit SHALL show another device's saved content in place, without a reload.

#### Scenario: An editor with nothing unsaved adopts a save in place

- **GIVEN** an editor is open with no unsaved edit
- **WHEN** another device saves the resource
- **THEN** the editor shows the saved content without a reload

#### Scenario: Adopting a save clears undo history and the delta baseline

- **GIVEN** an editor with undo history has adopted another device's save
- **WHEN** the person saves a large document next
- **THEN** the undo history is empty
- **AND** that save is written whole rather than as a delta

### Requirement: An unsaved edit is kept and the other save is offered as a choice

An editor holding an unsaved edit SHALL NOT overwrite it when another device saves, and SHALL name the device and offer the person a choice.

#### Scenario: An unsaved edit stays on screen when another device saves

- **GIVEN** an editor holds an unsaved edit
- **WHEN** another device saves the resource
- **THEN** a notice names the device that saved
- **AND** the unsaved edit stays on screen
- **AND** autosave is held until the person answers

### Requirement: Taking theirs replaces the unsaved edit with the saved version

Taking the other device's version SHALL show that saved version and drop the unsaved local edit.

#### Scenario: Taking theirs replaces the unsaved edit

- **GIVEN** a notice offers the other device's save over an unsaved edit
- **WHEN** the person chooses to take theirs
- **THEN** the editor shows the saved version
- **AND** the unsaved local edit is dropped

### Requirement: Keeping mine saves the local edit over the other version

Keeping the local edit SHALL save it as the newest version, and SHALL keep the other device's save in version history.

#### Scenario: Keeping mine saves over the other version and keeps it in history

- **GIVEN** a notice offers the other device's save over an unsaved edit
- **WHEN** the person chooses to keep mine
- **THEN** the local edit is saved as the newest version
- **AND** the other device's save is still in version history

### Requirement: A notice names an agent by its key

A notice of a save made by an agent SHALL name the agent by the name of the key it saved with.

#### Scenario: A save made with a key is named by that key

- **GIVEN** an agent saved the resource with a key named for it
- **WHEN** the person's open editor shows the notice
- **THEN** the notice names the key's name

### Requirement: The todo list re-reads another device's save

An open todo list SHALL re-read the saved list when another device saves it, in place of taking the streamed list.

#### Scenario: An open todo list re-reads another device's save

- **GIVEN** a todo list is open on one device
- **WHEN** another device saves the list
- **THEN** the todo list shows the list as saved, read again from storage
