## ADDED Requirements

### Requirement: Saved API key is write-only

The console SHALL accept an Anthropic API key once and SHALL show only its last four characters afterwards.

#### Scenario: Saved key shows only its last four characters

- **GIVEN** the reader is on the sessions tab with no key saved
- **WHEN** the reader pastes an API key and saves it
- **THEN** the page shows the last four characters of the key
- **AND** the full key is not shown anywhere on the page

#### Scenario: Replacing a saved key shows the new key's last four characters

- **GIVEN** a key is saved
- **WHEN** the reader chooses Replace and saves a different key
- **THEN** the page shows the last four characters of the new key

#### Scenario: Removing a saved key stops hosted sessions

- **GIVEN** a key is saved
- **WHEN** the reader chooses Remove
- **THEN** the page shows no saved key
- **AND** the reader cannot start a hosted session

#### Scenario: Starting a hosted session with no key saved is refused

- **GIVEN** no key is saved
- **WHEN** the reader starts a hosted session
- **THEN** the console does not start the session
- **AND** the page asks for an API key

### Requirement: Saved key stays encrypted and out of every log and session

The console SHALL keep the saved key encrypted at rest so that a copy of the stored record alone reveals no key.

#### Scenario: A copy of the stored record reveals no key

- **GIVEN** a key is saved
- **WHEN** the stored record is read without the app's own encryption key
- **THEN** the key cannot be recovered from it

#### Scenario: The key appears in no log, page message or session output

- **GIVEN** a key is saved and a hosted session is running
- **WHEN** the session works, streams events and finishes
- **THEN** the key appears in no log line, page message or session output

### Requirement: Hosted session runs in its own container on a named public repository

The console SHALL run each hosted session in a container of its own and SHALL clone the public repository the reader names as the session's first step.

#### Scenario: Session starts on a named public repository

- **GIVEN** a key is saved
- **WHEN** the reader starts a hosted session naming a public repository
- **THEN** the session's first step clones that repository
- **AND** the session appears in the sessions list like a local session

#### Scenario: A private repository is not started

- **GIVEN** a key is saved
- **WHEN** the reader names a private repository for a hosted session
- **THEN** the console does not start a session for it

### Requirement: Hosted option is offered only from the sessions tab

The console SHALL offer the Anthropic-hosted connection from the sessions tab and from no other screen.

#### Scenario: Hosted option appears in the sessions tab

- **GIVEN** the reader opens the console's sessions tab
- **WHEN** the reader looks for a way to add a connection
- **THEN** the Anthropic-hosted option is listed beside the other connections

#### Scenario: First screen offers no hosted option

- **GIVEN** the reader opens the console for the first time
- **WHEN** the first screen is shown
- **THEN** no Anthropic-hosted option is shown

### Requirement: Hosted connection asks for an API key and never a subscription sign-in

The console SHALL ask a reader who chooses the Anthropic-hosted connection for an API key and SHALL NOT offer a claude.ai subscription sign-in for it.

#### Scenario: Choosing the hosted connection asks for a key

- **GIVEN** the reader has no key saved
- **WHEN** the reader chooses the Anthropic-hosted connection
- **THEN** the page asks for an API key
- **AND** the page offers no claude.ai sign-in
