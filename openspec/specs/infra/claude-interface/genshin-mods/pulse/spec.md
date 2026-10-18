## Purpose

A session-scoped machine watcher, kept running as the session's own child, so the machine's state and heartbeat keep being written.

## Requirements

### Requirement: The machine watcher runs as the session's own child

While pulse is on, the session SHALL run the machine watcher as its own child, so the machine's state keeps being written for as long as the session is open.

#### Scenario: Starting a session with pulse on

- **GIVEN** pulse on and a session in the repository
- **WHEN** the session starts
- **THEN** the machine watcher starts as the session's child

#### Scenario: The watcher exits while the session is open

- **GIVEN** a watcher that has exited
- **WHEN** a minute has passed
- **THEN** the session starts the watcher again

#### Scenario: Starting a session outside the repository

- **GIVEN** a session outside the repository
- **WHEN** it starts with pulse on
- **THEN** no watcher starts

### Requirement: Only one machine watcher samples the machine at a time

At most one machine watcher SHALL sample the machine at a time.

#### Scenario: A second watcher starting while one holds the lock

- **GIVEN** a live watcher holding the lock
- **WHEN** a second watcher starts
- **THEN** the second watcher exits without sampling

#### Scenario: A lock left by a watcher that is gone

- **GIVEN** a lock whose holding process no longer exists
- **WHEN** a new watcher starts
- **THEN** it takes the lock over and samples the machine

### Requirement: Pulse is on by default and read at session start

Pulse SHALL be on by default, the pulse off command SHALL stop it, and a change SHALL take effect at the next session.

#### Scenario: Turning pulse off

- **GIVEN** pulse on
- **WHEN** the person sends the off command
- **THEN** the next session starts no watcher

#### Scenario: Turning pulse back on

- **GIVEN** pulse off
- **WHEN** the person sends the on command
- **THEN** the next session starts the watcher

### Requirement: Pulse shows no row and submits no prompt

Pulse SHALL draw no row above the prompt and SHALL submit no prompt of its own.

#### Scenario: The machine goes idle

- **GIVEN** a watcher running while the machine is idle
- **WHEN** the idle line is printed
- **THEN** no prompt is submitted to the session

### Requirement: The resume check reports the watcher's state

The resume check SHALL report the watcher satisfied while its reading is fresh and its process is alive.

#### Scenario: A fresh reading from a live watcher

- **GIVEN** a watcher with a fresh reading and a live process
- **WHEN** the resume check runs
- **THEN** the watcher row is satisfied

#### Scenario: No session running pulse

- **GIVEN** no session with pulse on
- **WHEN** the resume check runs
- **THEN** the watcher row names starting the watcher as its action

### Requirement: The watcher ends with the session that started it

The machine watcher SHALL end with the session that started it.

#### Scenario: The session ends

- **GIVEN** a session that started a watcher
- **WHEN** the session ends
- **THEN** the watcher ends with it
