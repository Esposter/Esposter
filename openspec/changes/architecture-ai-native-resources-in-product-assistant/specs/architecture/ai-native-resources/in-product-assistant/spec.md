## ADDED Requirements

### Requirement: Ask Claude is offered in every resource type's editor

The editor of every resource type SHALL offer an Ask Claude command in its toolbar and in the command palette.

#### Scenario: Ask Claude is available in any type's editor

- **GIVEN** a person has a resource of any type open
- **WHEN** the person opens the command palette or looks at the toolbar
- **THEN** Ask Claude is offered
- **AND** choosing it opens a line for the person to type

### Requirement: A line goes to the session the person picks

Ask Claude SHALL send the person's line as a prompt to the Claude Code session the person picks on their paired host, starting a new session in a folder the person chooses when none is open.

#### Scenario: The line reaches an open session

- **GIVEN** a paired host has a session open
- **WHEN** the person submits a line and picks that session
- **THEN** the session receives the line
- **AND** the prompt names the resource by its id and type

#### Scenario: A new session starts when none is open

- **GIVEN** no session is open on the paired host
- **WHEN** the person submits a line and chooses a folder
- **THEN** a new session starts in that folder
- **AND** the session receives the line

#### Scenario: Pairing is explained when no host is paired

- **GIVEN** no host is paired
- **WHEN** the person opens Ask Claude
- **THEN** the command shows how to pair a host
- **AND** no line is sent

### Requirement: The session edits with the person's own key

The session SHALL reach the resource with the person's own key, so its edits are limited by that key's scopes and rate limits and are recorded in the activity under that key.

#### Scenario: An assistant edit is recorded under the person's key

- **GIVEN** the session has saved an edit to a resource
- **WHEN** the person reads the resource's activity
- **THEN** the edit is listed under the name of the key that made it

#### Scenario: A key without the Resources scope cannot edit

- **GIVEN** the person's key does not hold the Resources scope
- **WHEN** the session asks to edit the resource
- **THEN** the edit is refused
- **AND** the resource is unchanged

#### Scenario: The steps to connect a key are shown when none holds the scope

- **GIVEN** the person has no key holding the Resources scope
- **WHEN** the person opens Ask Claude
- **THEN** the command shows the steps to connect a key

### Requirement: An assistant edit reaches the open editor without a reload

The open editor SHALL show an edit the session saves as it arrives, and SHALL offer the person a choice rather than overwrite an edit they have not saved.

#### Scenario: An edit arrives in an editor with nothing unsaved

- **GIVEN** the editor has no unsaved edit
- **WHEN** the session saves an edit to the resource
- **THEN** the editor shows the saved edit without a reload

#### Scenario: An edit arriving over an unsaved edit is offered as a choice

- **GIVEN** the person has an unsaved edit in the editor
- **WHEN** the session saves an edit to the resource
- **THEN** the person is offered a choice between the saved edit and their own
- **AND** the person's unsaved edit stays on screen until they choose

### Requirement: Ask Claude costs the person nothing beyond their subscription

Ask Claude SHALL run its turn in the person's own session on their own host, and Esposter SHALL NOT call a model for it or meter any charge for it.

#### Scenario: A turn runs in the person's session

- **GIVEN** the person submits a line through Ask Claude
- **WHEN** the session answers and makes its edits
- **THEN** the turn runs on the person's own host
- **AND** Esposter records no model usage and charges nothing for the turn
