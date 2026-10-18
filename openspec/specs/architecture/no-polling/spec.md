## Purpose

Polling for state change is banned repo-wide — every wait is event-driven or awaits an explicit completion handle.

## Requirements

### Requirement: Code waits by awaiting, subscribing or scheduling, never by checking

Code that waits for something SHALL wait by awaiting a completion, subscribing to an event, or relying on a delivery scheduled for that time, and SHALL NOT repeatedly check whether the thing has happened.

#### Scenario: Code needs to react to a state change

- **GIVEN** code needs to react when a state changes
- **WHEN** the state changes
- **THEN** the code is told by the event that announces the change

#### Scenario: Code needs to know background work has finished

- **GIVEN** a call started background work that the caller must wait for
- **WHEN** the caller needs the work to be complete
- **THEN** it awaits the completion handle the work returns

#### Scenario: A test needs telemetry from in-flight work to settle

- **GIVEN** a test records telemetry from calls still in flight
- **WHEN** the test asserts on that telemetry
- **THEN** it drains the in-flight work deterministically before asserting

### Requirement: A timer runs only to do work on a cadence

A timer SHALL run only when its purpose is to do something every interval, and SHALL NOT run to check whether something else has finished.

#### Scenario: An autosave runs on a fixed interval

- **GIVEN** an autosave is configured to save every few seconds
- **WHEN** the interval elapses
- **THEN** the save runs because time has passed

#### Scenario: A timer asks whether a remote has changed

- **GIVEN** a timer would ask on each tick whether a remote source has changed
- **WHEN** the timer is considered for the code
- **THEN** it is refused and rewritten around the signal the remote already sends

### Requirement: The review queue is not drained on a timer

The review queue SHALL NOT start work on a timer that looks for newly landed commits.

#### Scenario: A commit lands on the queue

- **GIVEN** a commit lands on the queue branch
- **WHEN** nothing has signalled that the commit is ready to land
- **THEN** no timer picks it up
- **AND** the agent lands its own commits when it has something to land

### Requirement: The prompt-cache warning fires once per turn

The prompt-cache warning SHALL fire at most once for each request, at the moment the cache goes cold, and SHALL stand down while a new turn runs.

#### Scenario: A turn ends and the cache is about to go cold

- **GIVEN** a turn has just ended
- **WHEN** the cache expiry instant is known from the last request
- **THEN** one warning is armed for that instant

#### Scenario: A new turn starts before the cache goes cold

- **GIVEN** a warning is armed for a cache expiry instant
- **WHEN** a new turn starts
- **THEN** the armed warning stands down

### Requirement: An unattended runner never waits on a timer

Code that runs unattended in a runner SHALL react to events, even where an interactive command may use a bounded wait because a person is watching it.

#### Scenario: An interactive command waits for a result

- **GIVEN** a person is watching a terminal command
- **WHEN** the command waits for a result with a bounded wait
- **THEN** the person sees the result or the timeout

#### Scenario: The same wait runs inside an unattended runner

- **GIVEN** the same code runs inside an unattended runner
- **WHEN** it needs a result
- **THEN** it subscribes to the event that delivers the result instead of waiting on a timer

### Requirement: A dependency without a completion signal is fixed at its boundary

A dependency that exposes no completion signal SHALL be given one at its boundary, and code SHALL NOT poll around it.

#### Scenario: A dependency offers no completion signal

- **GIVEN** a dependency exposes no promise, event or webhook for a result
- **WHEN** code needs that result
- **THEN** the boundary is changed to expose a completion handle or an event
- **AND** the code does not poll the dependency

### Requirement: Wait-for-condition helpers fail the lint check

The lint check SHALL fail on any use of a helper that waits for a condition by repeated checking.

#### Scenario: A test uses a wait-until helper

- **GIVEN** a test calls a helper that waits for a condition to become true
- **WHEN** the lint check runs
- **THEN** the lint check fails
