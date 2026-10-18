## Purpose

How the local machine runs the work — the lanes, each worktree's dev server, each command's own browser, the session that bounds the one-off runs, the machine watcher, with the magnitude each one buys.

## Requirements

### Requirement: Each worktree serves its own parity page on its own port

Each worktree's dev server SHALL run on its own port, so that concurrent lanes do not share one page's memory.

#### Scenario: Two lanes work at the same time

- **GIVEN** the main session and a runner working at the same time
- **WHEN** each opens its parity page
- **THEN** each is served on its own port

#### Scenario: A lane loads many pages

- **GIVEN** a lane that loads many pages in one session
- **WHEN** the pages are loaded
- **THEN** its dev server's memory stays flat

### Requirement: A command that opens a browser owns and closes it

A command that opens a browser SHALL own that browser and close it when its page closes.

#### Scenario: A parity command finishes

- **GIVEN** a parity command that opened its own browser
- **WHEN** its page closes
- **THEN** its browser closes with it
- **AND** no browser is left running

### Requirement: A multi-task run is bounded by default

A multi-task run SHALL run at most four tasks at once unless its caller sets a higher limit.

#### Scenario: A multi-task run with no limit set

- **GIVEN** a multi-task run started without a concurrency limit
- **WHEN** it runs
- **THEN** at most four tasks run at once

#### Scenario: A whole-workspace typecheck with no heap cap

- **GIVEN** a whole-workspace typecheck started with no heap cap
- **WHEN** it runs
- **THEN** free memory on the machine can fall to about half a gigabyte

### Requirement: A commit from a fresh worktree needs no install and runs no check

A commit made from a fresh worktree SHALL NOT need its own install, and the commit hook SHALL run no check.

#### Scenario: A commit from a fresh worktree

- **GIVEN** a worktree with no install of its own
- **WHEN** it commits
- **THEN** the commit uses the main checkout's formatter
- **AND** no install is needed in the worktree

#### Scenario: A commit is made

- **GIVEN** staged files
- **WHEN** the commit is made
- **THEN** the hook formats only the staged files
- **AND** the hook runs no check

### Requirement: A machine runs at most one machine watcher

A machine SHALL run at most one machine watcher at a time.

#### Scenario: A second watcher starts beside a running one

- **GIVEN** a machine watcher already running on the machine
- **WHEN** a second watcher is started
- **THEN** the second watcher exits at once

#### Scenario: The previous watcher has exited

- **GIVEN** a watcher whose process has ended and which held the machine's claim
- **WHEN** a new watcher starts
- **THEN** the new watcher takes over the claim

### Requirement: The heartbeat is published every ten minutes

A machine's heartbeat SHALL be published every ten minutes, and a failed publish SHALL be logged once and retried at the next interval.

#### Scenario: A heartbeat push stalls

- **GIVEN** a heartbeat push that the network stalls
- **WHEN** the bound on the push passes
- **THEN** one line is logged
- **AND** the next heartbeat is pushed at the next interval

### Requirement: An idle reading starts no work by itself

An idle reading from the machine watcher SHALL NOT start work by itself.

#### Scenario: The machine has room and no session asks for work

- **GIVEN** the watcher reports that the machine has room
- **WHEN** no session asks for an entry
- **THEN** no work starts

### Requirement: Each efficiency mechanism is kept only with a measured magnitude

Each efficiency mechanism SHALL be kept only with its measured magnitude recorded beside it.

#### Scenario: A mechanism with a measured gain

- **GIVEN** a mechanism measured against the behaviour it replaces
- **WHEN** it is kept
- **THEN** its magnitude is recorded beside its rule

#### Scenario: A mechanism with no measured gain

- **GIVEN** a mechanism that measures no gain
- **WHEN** it is considered
- **THEN** it is removed
- **AND** it is not recorded
