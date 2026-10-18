## ADDED Requirements

### Requirement: Every resource type's lifecycle is served by one tool per operation

The agent surface SHALL serve the lifecycle of every resource type through one generic tool per operation, so that adding a resource type adds no tool.

#### Scenario: A resource of any type is created through the generic create tool

- **GIVEN** a key holds the Resources scope
- **WHEN** the key creates a resource with a type and a name
- **THEN** a resource of that type with that name exists

#### Scenario: A type that does not publish is refused in words

- **GIVEN** a resource's type does not publish
- **WHEN** a key asks to publish the resource
- **THEN** the request is refused with a message saying the type does not publish
- **AND** nothing is published

### Requirement: An agent reaches what a person can do in an editor

An agent SHALL perform an act a person takes in an editor through a typed operation, so that the result matches the editor's own result.

#### Scenario: A Sheet column rename re-keys every row

- **GIVEN** a Sheet has a column with a value in every row
- **WHEN** an agent renames the column
- **THEN** every row's value sits under the new name

#### Scenario: A Sheet column type change converts every cell

- **GIVEN** a Sheet column holds values of one type
- **WHEN** an agent changes the column's type
- **THEN** every cell holds the value the editor gives it for the new type

#### Scenario: A date format change rewrites every date

- **GIVEN** a Sheet column holds dates
- **WHEN** an agent changes the column's date format
- **THEN** every date in the column is shown in the new format

### Requirement: An agent's row command lands on the named row

A command an agent sends naming a row by its id SHALL change that row after the owner has inserted rows above it.

#### Scenario: A command lands on its row after a row is inserted above it

- **GIVEN** an owner inserts a row above a row an agent names by id
- **WHEN** the agent's command sets a cell on the named row
- **THEN** the cell on the named row changes
- **AND** the row inserted above is unchanged

### Requirement: An open editor adopts an agent's save

An open editor with no unsaved edit SHALL show an agent's saved edit in place, and an editor holding an unsaved edit SHALL NOT overwrite it.

#### Scenario: An editor with nothing unsaved shows the agent's save

- **GIVEN** an editor of any resource type is open with no unsaved edit
- **WHEN** an agent saves an edit to that resource
- **THEN** the editor shows the saved content without a reload

#### Scenario: An unsaved edit is kept and the agent's save is offered as a choice

- **GIVEN** an editor holds an unsaved edit
- **WHEN** an agent saves an edit to that resource
- **THEN** the person is offered a choice of taking the agent's version or keeping their own
- **AND** the unsaved edit stays on screen until the person chooses

### Requirement: An operation nothing can undo is refused to every key

An operation that no revision, recycle bin or unpublish can undo SHALL be refused to every key, whatever scopes the key holds.

#### Scenario: A key asks to purge a resource

- **GIVEN** a key holds every scope
- **WHEN** the key asks to purge a resource
- **THEN** the request is refused
- **AND** the resource is unchanged

#### Scenario: A key restores an earlier version

- **GIVEN** a key holds the Resources scope
- **WHEN** the key restores an earlier version of a resource
- **THEN** the version held before the restore is kept as a revision
- **AND** restoring that revision undoes the restore

### Requirement: An agent's write is refused where the type's schema does not describe it

An agent's write SHALL be refused rather than guessed where the resource type's content schema does not describe the path written.

#### Scenario: A write into an undescribed part of a webpage is refused

- **GIVEN** a webpage's project data is not described by its schema
- **WHEN** an agent writes under that part of the webpage
- **THEN** the write is refused
- **AND** the webpage is unchanged

#### Scenario: Captured markup is read-only to agents

- **GIVEN** a webpage holds markup captured by the editor
- **WHEN** an agent writes that captured markup
- **THEN** the write is refused
- **AND** the captured markup is unchanged

### Requirement: CI refuses a resource type whose described surface is not recorded

CI SHALL refuse any resource type whose content schema cannot be described to agents as a root object, or whose undescribed and read-only paths differ from the recorded ones.

#### Scenario: A type whose content schema is not an object fails CI

- **GIVEN** a resource type's content schema does not describe as a root object
- **WHEN** CI runs
- **THEN** CI fails

#### Scenario: A change to a type's described surface fails CI until it is recorded

- **GIVEN** a resource type's undescribed or read-only paths differ from the recorded ones
- **WHEN** CI runs
- **THEN** CI fails until the recorded paths are updated
