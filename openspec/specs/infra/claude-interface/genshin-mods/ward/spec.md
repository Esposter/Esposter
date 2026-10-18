## Purpose

A collision guard — before a session edits a file another session changed in the last thirty minutes, it asks the person whether to proceed, move the work into a worktree or cancel, rather than overwriting in silence.

## Requirements

### Requirement: An edit to a file another session changed recently asks first

Before a session edits a file another session changed in the last thirty minutes, the person SHALL be asked whether to proceed.

#### Scenario: An edit to a file another session changed recently

- **GIVEN** another session edited a file within the last thirty minutes
- **WHEN** this session tries to edit that file
- **THEN** the person is asked about the file and how long ago it changed

#### Scenario: An edit to a file no other session changed recently

- **GIVEN** no other session edited the file within the last thirty minutes
- **WHEN** a session edits it
- **THEN** the edit runs without a question

### Requirement: The answer decides whether the edit runs

The answer to the question SHALL decide the edit: proceed runs it, and any other answer refuses it with a message to the model.

#### Scenario: Answering proceed

- **GIVEN** the question about a recently changed file
- **WHEN** the person answers proceed
- **THEN** the edit runs

#### Scenario: Answering move to a worktree

- **GIVEN** the question about a recently changed file
- **WHEN** the person answers move to a worktree
- **THEN** the edit is refused and the model is told to move the work into a git worktree

#### Scenario: Answering cancel

- **GIVEN** the question about a recently changed file
- **WHEN** the person answers cancel
- **THEN** the edit is refused and the model is told the person stopped it

#### Scenario: Answering with typed words

- **GIVEN** the question about a recently changed file
- **WHEN** the person types an answer under other
- **THEN** the edit is refused and the model receives the person's words as its instruction

### Requirement: A session's own edits and unattended runs do not ask

A session's own edits SHALL NOT ask, and a run with nobody watching SHALL proceed.

#### Scenario: A session editing a file it changed itself

- **GIVEN** a file this session edited earlier
- **WHEN** it edits the file again
- **THEN** no question is asked

#### Scenario: A headless run editing a recently changed file

- **GIVEN** a headless run with nobody watching
- **WHEN** it edits a recently changed file
- **THEN** the edit proceeds without a question

### Requirement: A failure in the guard lets the edit through

Any failure of the guard SHALL let the edit through.

#### Scenario: The record file cannot be read

- **GIVEN** an unreadable record of recent edits
- **WHEN** a session edits a file
- **THEN** the edit runs

### Requirement: Recent edits age out after thirty minutes

The recorded edits SHALL cover only the last thirty minutes.

#### Scenario: An edit older than thirty minutes

- **GIVEN** an edit recorded more than thirty minutes ago
- **WHEN** a session edits that file
- **THEN** no question is asked

### Requirement: Ward off stops the questions and the recording

The ward off command SHALL stop both the questions and the recording of edits, and the ward on command SHALL restore them.

#### Scenario: Turning ward off

- **GIVEN** ward on
- **WHEN** the person sends the off command
- **THEN** no questions are asked and no edits are recorded

#### Scenario: Turning ward back on

- **GIVEN** ward off
- **WHEN** the person sends the on command
- **THEN** questions are asked and edits are recorded again

### Requirement: Edits made outside Claude Code are not recorded

Edits made outside Claude Code SHALL NOT be recorded.

#### Scenario: An edit made in an editor

- **GIVEN** a file edited in an editor outside Claude Code
- **WHEN** a session later edits the same file
- **THEN** the outside edit does not trigger a question
