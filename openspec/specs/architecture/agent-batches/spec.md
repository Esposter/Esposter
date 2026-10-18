## Purpose

How a large body of settled work is built at once — the main session splits it into units, a wave of agents builds them, each in its own worktree on `ai/queue`, checking only the packages it touched, one fixer runs every check once, and the long runs wait in a compute queue for runners.

## Requirements

### Requirement: A large batch is built in waves of isolated agents

A large body of settled work SHALL be split into units, with one agent building each unit in its own isolated copy of the repository.

#### Scenario: Each unit is built by one agent

- **GIVEN** settled work split into units
- **WHEN** the batch starts
- **THEN** each unit is built by one agent working in its own copy

#### Scenario: An agent that conflicts on a shared file settles its own conflict

- **GIVEN** two agents editing the same shared file
- **WHEN** the second agent lands its commit after the first
- **THEN** the second agent resolves the conflict on its own changes

### Requirement: Each agent checks only the packages it edited

Each agent SHALL check only the packages it edited, once before its commit, and the full checks SHALL run once for the whole batch after every report is in.

#### Scenario: An agent checks its own packages before committing

- **WHEN** an agent finishes its unit
- **THEN** it runs the check of each package it edited once before committing

#### Scenario: The full checks run once after all reports

- **GIVEN** every agent's report is in
- **WHEN** the batch is closed
- **THEN** one fixer runs the full checks once and fixes what they find

#### Scenario: No background watcher re-runs checks during a batch

- **WHEN** an agent saves a file during its unit
- **THEN** no standing process re-runs checks on that save

### Requirement: A failed build keeps the last good output

A package build that fails on another agent's half-written file SHALL leave the last good build output in place for the rest of the batch.

#### Scenario: A failed build leaves the previous output usable

- **GIVEN** another agent's file is half written
- **WHEN** a package build fails on that file
- **THEN** the previous build output remains available to the other units

### Requirement: Values measured from the game are queued, not guessed

A value that must be measured off the game SHALL get a provisional value and a queued measurement item, and a miss SHALL return to the main session as a question rather than a rerun on a guessed value.

#### Scenario: A queued item gives its exact command and bar

- **WHEN** a unit needs a value measured from the game
- **THEN** the queued item states its command, its inputs, its outputs and the bar the measure must meet

#### Scenario: A missed measure returns as a question

- **GIVEN** a queued measure that misses its bar
- **WHEN** the runner reports the miss
- **THEN** the main session receives it as a question to settle before any rerun

### Requirement: Long runs wait in lanes with free memory

Long measurement runs SHALL wait in a queue, with at most one page runner and a few CPU runners, and each runner SHALL wait for free memory before it starts.

#### Scenario: The page lane has one runner

- **GIVEN** a page measurement is queued
- **WHEN** the page lane is idle
- **THEN** exactly one runner takes the page measurement

#### Scenario: A runner waits for free memory before starting

- **GIVEN** free memory is below the threshold for the machine
- **WHEN** a runner is about to start a run
- **THEN** the runner waits until enough memory is free

#### Scenario: A runner works through its lane until it is empty

- **WHEN** a runner finishes an item and its lane has another item
- **THEN** the runner takes the next item without being started again

### Requirement: The batch advances on completion, never on a schedule

The batch SHALL advance only when an agent's work completes, and SHALL NOT advance on a timer or a poll.

#### Scenario: A finished report starts the next step

- **WHEN** an agent's report is read and its work has landed
- **THEN** its open work becomes the next wave's units

#### Scenario: A queued item starts a runner when its lane is idle

- **GIVEN** an item is queued on a lane with no runner
- **WHEN** the item is queued
- **THEN** a runner starts for that lane

### Requirement: Questions for the user are asked in one batch

The main session SHALL settle every call that does not need the user before briefing an agent, and SHALL ask the user's calls together in one batch.

#### Scenario: Calls are settled before the agent is briefed

- **WHEN** the main session writes an agent's prompt
- **THEN** every call the unit needs is already settled in the prompt

#### Scenario: Calls only the user can make are asked together

- **GIVEN** questions about taste, money, licensing or the user's own eyes and ears
- **WHEN** the main session has them all
- **THEN** they are asked to the user in a single batch

### Requirement: A batch stops when only queue items and questions remain

A batch SHALL stop when a wave's reports leave only queue items and questions for the user, and SHALL continue with another wave while units remain open.

#### Scenario: A wave that leaves only queue items and questions ends the batch

- **GIVEN** a wave whose reports leave only queue items and questions
- **WHEN** the last report is read
- **THEN** the batch is complete

#### Scenario: A wave that leaves open units starts another wave

- **GIVEN** a wave whose reports leave open units
- **WHEN** the last report is read
- **THEN** another wave is built from those open units
