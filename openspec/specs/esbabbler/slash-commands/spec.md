## Purpose

The /command registry, TipTap picker, parameter mode, and execution model. Covers how a member finds and runs a slash command, what each command posts or does, which commands open a dialog, and how typed parameters turn back into text.

## Requirements

### Requirement: Typing a slash opens a picker of the available commands

Typing a slash in the message composer SHALL open a picker of the available commands from which the member can choose.

#### Scenario: a member types a slash

- **GIVEN** a member in the message composer
- **WHEN** the member types a slash
- **THEN** a picker of the available commands opens

### Requirement: Client-side commands post their result as the member's own message

A client-side command SHALL post its result as an ordinary message from the member.

#### Scenario: a member flips a coin

- **GIVEN** a member in the composer
- **WHEN** the member runs the flip command
- **THEN** the room sees the member's message showing either heads or tails

#### Scenario: a member rolls a die

- **GIVEN** a member in the composer
- **WHEN** the member runs the roll command
- **THEN** the room sees the member's message reporting a roll from 1 to 100

#### Scenario: a member posts an action

- **GIVEN** a member in the composer
- **WHEN** the member runs the me command with a message
- **THEN** the room sees the message in italics as an action by the member

### Requirement: A command that needs text cannot be sent without it

A command whose parameter is required SHALL NOT be sent while that parameter is empty.

#### Scenario: a member runs the me command with no text

- **GIVEN** a member who types the me command without a message
- **WHEN** the member tries to send it
- **THEN** the command is not sent

#### Scenario: a member runs the spoiler command with text

- **GIVEN** a member who types the spoiler command with text
- **WHEN** the member sends it
- **THEN** the room sees the text hidden behind a spoiler bar

### Requirement: The topic command sets or clears the room topic without posting a message

The topic command SHALL set the room's topic to the text given, or clear it when no text is given, and SHALL post no message of its own.

#### Scenario: a member clears the topic

- **GIVEN** a room with a topic
- **WHEN** a member runs the topic command with no text
- **THEN** the topic is cleared
- **AND** no message is posted

### Requirement: The poll, remind and schedule commands open a dialog instead of posting

The poll, remind and schedule commands SHALL open a dialog to complete the action, and the composer's plus menu SHALL offer the same three actions.

#### Scenario: a member creates a poll from the plus menu

- **GIVEN** a member opening the composer's plus menu
- **WHEN** the member chooses to create a poll
- **THEN** the poll dialog opens
- **AND** the poll is posted once the member submits it

#### Scenario: a member schedules a reminder from the command

- **GIVEN** a member typing the remind command
- **WHEN** the member runs it
- **THEN** the scheduling dialog opens

### Requirement: Typed parameters turn back into plain text on Escape

Pressing Escape while parameters are being filled in SHALL turn them back into the command's text in the composer.

#### Scenario: a member presses Escape while filling a parameter

- **GIVEN** a command with parameters filled in as chips
- **WHEN** the member presses Escape
- **THEN** the composer shows the command as text with its values
