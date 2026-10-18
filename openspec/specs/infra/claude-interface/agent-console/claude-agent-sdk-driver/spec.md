## Purpose

The agent console's Claude Code driver. It runs one streaming-input Agent SDK query per open session with the terminal's own settings, and writes sessions where the terminal does. SDK messages become the console's events in one mapper, tested against a real recorded session. Permission prompts are bridged to the page, and resume, fork and rewind replay the transcript first.

## Requirements

### Requirement: Sessions apply the terminal's own settings

A session SHALL apply the user, project and local settings the terminal applies, so that its instructions, skills, hooks, plugins and output styles behave as they do in the terminal.

#### Scenario: A session opened in a project with its own instructions

- **GIVEN** a project whose instructions, skills and hooks the terminal would apply
- **WHEN** a session is opened for that project in the console
- **THEN** the same instructions, skills and hooks apply to the session

### Requirement: Sessions are stored where the terminal stores them

A session started in the console SHALL be stored where the terminal stores its sessions, so that the terminal can resume it.

#### Scenario: Resuming a console session in the terminal

- **GIVEN** a session started in the console
- **WHEN** the same session is resumed in the terminal by its id
- **THEN** the terminal continues the same conversation

### Requirement: Replies stream as they are written

A reply SHALL stream into the conversation as it is written, and thinking SHALL be shown summarised rather than omitted.

#### Scenario: A reply being written while the turn runs

- **GIVEN** a turn in progress
- **WHEN** the model writes a reply
- **THEN** the reply appears in the conversation as it is written

#### Scenario: A turn that produces thinking

- **GIVEN** a turn in which the model thinks
- **WHEN** the turn is shown
- **THEN** the thinking is shown in summary rather than left out

### Requirement: Prompts sent while the agent is busy wait their turn

A prompt sent while the agent is busy SHALL wait and run after the current work, rather than being lost.

#### Scenario: A prompt sent during a running turn

- **GIVEN** a session with a turn running
- **WHEN** the person sends another prompt
- **THEN** the prompt waits and runs when the agent next takes input

### Requirement: Permission requests are settled exactly once

Each permission request SHALL be shown on the page and settled exactly once, as allow, always allow or deny.

#### Scenario: Allowing a request

- **GIVEN** a pending permission request
- **WHEN** the person allows it
- **THEN** the tool call proceeds

#### Scenario: Always allowing a request

- **GIVEN** a pending permission request that offers a standing rule
- **WHEN** the person chooses always allow
- **THEN** the offered rule applies to later requests of the same kind

#### Scenario: Denying a request with a message

- **GIVEN** a pending permission request
- **WHEN** the person denies it with a message
- **THEN** the tool call does not proceed and the agent receives the message

#### Scenario: Interrupting a turn with a request pending

- **GIVEN** a pending permission request
- **WHEN** the turn is interrupted
- **THEN** the request is settled as denied and no request outlives its turn

#### Scenario: A verdict for a request already settled

- **GIVEN** a permission request settled from another tab
- **WHEN** a verdict arrives for it here
- **THEN** nothing changes

### Requirement: Unknown SDK messages are shown rather than dropped

An SDK message or block the console does not recognise SHALL be shown as a raw row rather than dropped.

#### Scenario: A message type the console does not know

- **GIVEN** an SDK message of a type the console does not map
- **WHEN** it arrives
- **THEN** it is shown as a raw row carrying the whole message

### Requirement: Streaming pieces are not kept in the session log

Streaming pieces and the running token count SHALL NOT be kept in the session's log, so that a reconnect replays only what lasts.

#### Scenario: Reconnecting during a streamed reply

- **GIVEN** a reply partway through streaming
- **WHEN** the page reconnects
- **THEN** the replay carries the finished blocks and not the streamed pieces

### Requirement: Resume, fork and rewind show the conversation they continue

Resuming, forking or rewinding a session SHALL show the conversation it continues before the next turn.

#### Scenario: Resuming a session

- **GIVEN** a closed session with a transcript
- **WHEN** it is resumed
- **THEN** its earlier conversation is shown before any new turn

#### Scenario: Forking a session

- **GIVEN** a session
- **WHEN** it is forked, optionally at a message
- **THEN** the fork is a new session with its own id

#### Scenario: Rewinding the files to before a prompt

- **GIVEN** a session whose files were changed after a prompt
- **WHEN** the files are rewound to that prompt
- **THEN** each file is put back as it was when the prompt was sent

### Requirement: A failed side read does not stop the session

A failed read of the session's commands, models, context usage or title SHALL be logged and SHALL NOT stop the session.

#### Scenario: The session title cannot be read

- **GIVEN** an open session
- **WHEN** reading its title fails
- **THEN** the failure is logged and the session carries on

### Requirement: The event mapping is checked against a recorded real session

The console's mapping of SDK messages SHALL be checked against one recorded real session, so that a change in what the mapping produces is visible for review.

#### Scenario: A change to the mapped events of the recorded session

- **GIVEN** the recorded session and its stored mapped events
- **WHEN** a change alters what the mapping produces for it
- **THEN** the difference appears in the stored snapshot for review
