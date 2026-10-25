## Purpose

The wrappers that start node's child processes with their window hidden on Windows, and the lint rule that keeps value imports of node's child process module to those wrappers.

## Requirements

### Requirement: A child process a wrapper starts never opens a console window on Windows

The child process wrappers SHALL start every child with its window hidden, including when the caller passes no options and including when the caller asks for a visible window.

#### Scenario: hides the window when the caller passes no options

- **GIVEN** a call to start a child process with no options
- **WHEN** the call is made
- **THEN** the child is started with its window hidden

#### Scenario: a caller cannot re-show the window by passing windowsHide false

- **GIVEN** a call that passes windowsHide as false
- **WHEN** the call is made
- **THEN** the child is started with its window hidden

### Requirement: A caller's options reach node unchanged except for the window flag

The child process wrappers SHALL pass a caller's options to node as given, changing only the window flag.

#### Scenario: keeps the caller's options and hides the window last

- **GIVEN** a call that passes options of its own
- **WHEN** the call is made
- **THEN** node receives those options with the window hidden

#### Scenario: keeps the caller's options when the args slot is passed as undefined

- **GIVEN** a call whose arguments slot is undefined and whose options follow it
- **WHEN** the call is made
- **THEN** node receives the caller's options with the window hidden

### Requirement: Node's own argument shapes keep their meaning

The child process wrappers SHALL read each call by node's own argument shapes, so an undefined options argument is the options slot and not an arguments slot.

#### Scenario: an undefined options argument is the options slot, not an args slot

- **GIVEN** a call whose options argument is undefined
- **WHEN** the call is made
- **THEN** the undefined argument is read as the options slot

#### Scenario: hides the window ahead of a trailing callback when the caller passes no options

- **GIVEN** a call with no options, followed by a callback
- **WHEN** the call is made
- **THEN** the window is hidden in the options slot ahead of the callback

### Requirement: Code imports node's child process only through the wrappers

The repo's lint rules SHALL reject a value import of node's child process module from any file of the workspace, except the wrappers, the genshin-persona source and the follow-ups scripts. A type-only import SHALL stay allowed.

#### Scenario: a direct import of node's child process fails lint

- **GIVEN** a source file that imports node's child process module as a value
- **WHEN** the repo's lint runs
- **THEN** the import is reported, with advice to use the wrappers
