## Purpose

How a Claude Code mod (a plugin of function hooks) is written in this repository — the rules the engine enforces when it loads one, the file shape each rule forces, where the repository's own lint meets the engine's slots, and the authoring loop that finds a refusal before a session does.

## Requirements

### Requirement: A mod imports only its own files and the engine's types

A mod SHALL import only its own files by relative path and the engine's own types and state library, and the repository's checks SHALL refuse any other import from a mod.

#### Scenario: A subpath import of the mod's own file is refused

- **WHEN** a mod imports one of its own files by a subpath instead of a relative path
- **THEN** the repository's checks fail

#### Scenario: A host built-in module is refused by the engine

- **WHEN** a mod imports a host built-in module
- **THEN** the engine refuses to load the mod

### Requirement: An unmatched event is hooked once per plugin

A mod SHALL register at most one unmatched hook for each event, so that the engine accepts the plugin.

#### Scenario: A second unmatched hook for an event is refused

- **WHEN** two unmatched hooks are registered for the session start event
- **THEN** the engine refuses the plugin and names the event

#### Scenario: Lifecycle events are handled in one file

- **WHEN** the mods handle session start, session end, prompt submission and turn boundaries
- **THEN** all of those unmatched hooks are registered in one lifecycle file

### Requirement: Registration functions return nothing

Every function that registers a mod's hooks SHALL return nothing, so that the engine accepts the module.

#### Scenario: A registration that returns a value is refused

- **WHEN** a registration function returns a value to its caller
- **THEN** the engine refuses the module

### Requirement: The engine context is passed only within one file

A function that takes the engine context SHALL be declared in the same file as the hook that calls it, and logic that does not take the context SHALL be a module of its own.

#### Scenario: Passing the context across an import is refused

- **WHEN** a mod passes the engine context to a function imported from another file
- **THEN** the engine refuses the module and names the function

### Requirement: Every state value is declared in the state contract

Every state value a mod reads SHALL be declared in its state contract and created in the file that uses it, so that a key the engine cannot read is never used.

#### Scenario: An undeclared state key is refused

- **WHEN** a mod reads a state key its state contract does not declare
- **THEN** the engine refuses the module and names the key

### Requirement: A mod does its Node and browser work through its plugin's scripts

A mod SHALL NOT use host built-in or browser APIs itself, and SHALL run any work that needs them through its plugin's own scripts.

#### Scenario: A mod that needs game data runs a script for it

- **WHEN** a mod needs data that a host built-in module would read
- **THEN** the mod runs the plugin's script that reads it and uses the script's result

### Requirement: A cleared or resumed conversation resets only its own state

A mod SHALL reset the state that belonged to a conversation when the conversation is cleared or resumed, and the session start SHALL fire once per process.

#### Scenario: Clearing a conversation removes its rows

- **GIVEN** a mod's rows and state belong to the conversation on screen
- **WHEN** the reader clears the conversation
- **THEN** those rows and that state are reset

#### Scenario: Resuming a conversation does not start a new session

- **WHEN** the reader resumes a conversation
- **THEN** no session start is recorded for the resume

### Requirement: The band shows notices only and never the status line

A mod SHALL pin to the band only notices and SHALL NOT use the band as a status line, and any lasting word SHALL be shown among the footer's mode labels.

#### Scenario: A pinned notice is drawn with a warning mark

- **WHEN** a mod pins a notice to the band
- **THEN** the notice is drawn with the warning mark above the prompt

#### Scenario: A lasting word appears among the mode labels

- **WHEN** a mod needs a word that lasts for the session
- **THEN** the word is shown among the footer's mode labels rather than the status line

### Requirement: Each mod passes the engine's validation after every change

Each mod SHALL pass the engine's validation after every change, and a rule the engine adds SHALL be recorded in the rules table in the same change.

#### Scenario: A refused mod is restructured before it is wired further

- **WHEN** the engine's validation refuses a mod
- **THEN** the mod is restructured to satisfy the rule before further wiring

### Requirement: A lint seam with the engine carries one disable and its reason

Where the repository's lint rules collide with an engine slot, each seam SHALL carry one disable directive that names the slot and gives its reason.

#### Scenario: A timer's async action carries its disable

- **GIVEN** a timer slot that the engine types as returning nothing
- **WHEN** an async action is wrapped for it
- **THEN** the wrapper carries one disable naming the slot, and the action resolves each outcome rather than rejecting
