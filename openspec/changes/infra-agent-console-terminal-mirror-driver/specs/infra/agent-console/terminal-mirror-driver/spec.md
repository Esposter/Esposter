## ADDED Requirements

### Requirement: A terminal's session shows the same events the console's driver shows

The console SHALL show a session a terminal runs with the same events that its own driver produces from the same transcript content.

#### Scenario: A terminal session shows its new turns

- **GIVEN** a session was started in a terminal with the channel flag
- **WHEN** the terminal's session writes a new turn
- **THEN** the console shows the turn as its own driver would show it

#### Scenario: A session without the channel flag cannot be sent prompts

- **GIVEN** a session was started in a terminal without the channel flag
- **WHEN** the reader opens it in the console
- **THEN** the console cannot send it prompts

### Requirement: Prompts and permission verdicts reach a terminal session through its channel

The console SHALL send each prompt and each permission verdict for a mirrored session through that session's channel.

#### Scenario: A prompt reaches the terminal session

- **GIVEN** a session is mirrored from a terminal
- **WHEN** the reader sends a prompt
- **THEN** the terminal's session receives it as a turn

#### Scenario: A verdict answers the terminal's permission request

- **GIVEN** the terminal's session is waiting on a permission request
- **WHEN** the reader allows it in the console
- **THEN** the terminal's session carries on

### Requirement: Controls a channel cannot reach are greyed out with the reason

The console SHALL grey out interrupt, mode, model and harness slash commands for a mirrored session and SHALL show the reason.

#### Scenario: A mirrored session greys out the controls a channel cannot reach

- **GIVEN** a session is mirrored from a terminal
- **WHEN** the reader views its composer
- **THEN** interrupt, mode, model and harness slash commands are greyed out
- **AND** the reason is shown

### Requirement: A session is held by one driver, and resuming after the terminal closes returns every control

The console SHALL hold each session in exactly one driver and SHALL move a mirrored session to its own driver when the reader resumes it after the terminal has closed.

#### Scenario: A session is held by one driver only

- **GIVEN** a session is mirrored from a terminal
- **WHEN** the reader views the session
- **THEN** only the terminal mirror holds it

#### Scenario: Resuming after the terminal closes restores every control

- **GIVEN** a mirrored session's terminal has closed
- **WHEN** the reader resumes the session in the console
- **THEN** every control is available again
