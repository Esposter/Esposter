## Purpose

Configurable automatic action — reject, warn, or timeout — when a message matches the room word filter.

## Requirements

### Requirement: Matching messages are blocked under every action

The room word filter SHALL block every message it matches from a member who cannot manage messages, whatever action the filter is set to.

#### Scenario: Reject action blocks the message only

- **GIVEN** a room word filter whose action is Reject
- **WHEN** a member posts a message that matches the filter
- **THEN** the message is not delivered
- **AND** no moderation consequence is applied to the member

#### Scenario: Warn action blocks the message and warns the member

- **GIVEN** a room word filter whose action is Warn
- **WHEN** a member posts a message that matches the filter
- **THEN** the message is not delivered
- **AND** a warning against the member is recorded in the room's moderation log
- **AND** the member sees a moderation notice about the warning

#### Scenario: Timeout action blocks the message and times the member out

- **GIVEN** a room word filter whose action is Timeout with a duration
- **WHEN** a member posts a message that matches the filter
- **THEN** the message is not delivered
- **AND** the member is timed out for that duration
- **AND** the timeout is recorded in the room's moderation log

#### Scenario: A moderator's matching message is allowed

- **GIVEN** a room word filter whose action is Timeout
- **WHEN** a member who can manage messages posts a message that matches the filter
- **THEN** the message is delivered
- **AND** no action is applied to the member

### Requirement: Automatic timeouts never shorten an existing timeout

An automatic timeout SHALL extend a member's timeout to whichever end is later and SHALL never shorten it.

#### Scenario: A longer timeout set by a moderator is kept

- **GIVEN** a member timed out by a moderator until later than the automatic timeout would reach
- **WHEN** the member posts a message that triggers the Timeout action
- **THEN** the member's timeout still ends at the moderator's later time

#### Scenario: An expired timeout is replaced

- **GIVEN** a member whose previous timeout has already ended
- **WHEN** the member posts a message that triggers the Timeout action
- **THEN** the member is timed out for the full automatic duration from now

### Requirement: A failed moderation log entry never becomes a server error

A failure to record an automatic action in the moderation log SHALL NOT change the rejection the sender receives.

#### Scenario: Log write fails during a Warn action

- **GIVEN** a room word filter whose action is Warn
- **WHEN** a member posts a matching message and recording the warning fails
- **THEN** the sender receives the same rejection as under Reject
- **AND** no server error is shown to the sender

### Requirement: Automatic actions are attributed to AutoMod in the audit log

The moderation audit log SHALL name AutoMod as the actor of every action the word filter takes.

#### Scenario: Audit log shows the automatic action

- **GIVEN** a Warn or Timeout action has been taken by the word filter
- **WHEN** a moderator opens the room's audit log
- **THEN** the entry's actor reads AutoMod rather than a member's name

### Requirement: A word filter defaults to rejecting its matches

A newly created word filter SHALL have the Reject action until a manager chooses another.

#### Scenario: New filter without a chosen action

- **GIVEN** a manager creates a word filter without choosing an action
- **WHEN** the filter is saved
- **THEN** its action reads Reject

### Requirement: Timeout actions must carry a positive duration

A word filter SHALL accept the Timeout action only with a positive duration and SHALL discard any duration once its action is not Timeout.

#### Scenario: Timeout without a duration is refused

- **GIVEN** a member with permission to manage the room
- **WHEN** they save a word filter with the Timeout action and no positive duration
- **THEN** the save is refused

#### Scenario: Changing away from Timeout clears its duration

- **GIVEN** a word filter whose action is Timeout with a duration
- **WHEN** a manager changes its action to Reject or Warn
- **THEN** the stored duration is cleared

### Requirement: Only members who can manage the room change word filter actions

Changing a word filter's action or duration SHALL require permission to manage the room.

#### Scenario: Member without permission cannot change the action

- **GIVEN** a member who cannot manage the room
- **WHEN** they try to save a word filter's action or duration
- **THEN** the change is refused
