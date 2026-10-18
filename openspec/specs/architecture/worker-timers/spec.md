## Purpose

The page's intervals and timeouts run in a Web Worker so browser throttling of a background tab cannot stall them, the message protocol, cleanup, and the upstream package's verdicts. The timers keep their schedule off the page's main thread, and the upstream verdicts are recorded so that no issue is left unread.

## Requirements

### Requirement: Page timers keep their schedule while the tab is hidden

Recurring page timers SHALL keep their schedule while the tab is hidden, so that elapsed time and production do not stall in a background tab.

#### Scenario: An interval in a hidden tab keeps counting against the clock

- **GIVEN** a page runs an interval
- **WHEN** the tab is hidden for a while and then brought back
- **THEN** the interval's count matches the elapsed wall-clock time

### Requirement: A timeout runs its callback at most once

A timeout SHALL run its callback once when it fires and SHALL be forgotten at that point.

#### Scenario: A fired timeout is not run again

- **GIVEN** a timeout has fired and run its callback
- **WHEN** the browser delivers no further fire for it
- **THEN** its callback does not run again

### Requirement: Clearing a timer that is not pending has no effect

Clearing a timer that is no longer pending or was never scheduled SHALL have no effect and SHALL raise no error.

#### Scenario: A late clear after a timeout fired is silent

- **GIVEN** a timeout has already fired
- **WHEN** code clears it late
- **THEN** nothing happens
- **AND** no error is raised

### Requirement: A timer scheduled on mount stops when its component unmounts

A timer scheduled when a component mounts SHALL stop when that component unmounts.

#### Scenario: Unmounting stops a repeating timer

- **GIVEN** a component started a repeating timer when it mounted
- **WHEN** the component unmounts
- **THEN** the timer stops
- **AND** its callback does not run again

### Requirement: A timer armed by an event is cleared by the code that armed it

A timer armed by an event SHALL be cleared by the code that armed it.

#### Scenario: Clearing an event-armed timer stops its callback

- **GIVEN** a timer was armed by a press
- **WHEN** the code that armed it clears the timer
- **THEN** the callback no longer runs

### Requirement: A browser without background timer support fails rather than falling back

A browser without background timer support SHALL fail on first use rather than fall back to timers on the main thread.

#### Scenario: A timer request in a browser without support fails

- **GIVEN** a browser without background timer support
- **WHEN** a timer is first requested
- **THEN** the request fails
- **AND** no timer runs on the main thread in its place

### Requirement: Timeouts with equal delays are not relied on to fire in order

Timeouts with equal delays SHALL NOT be relied on to fire in the order they were scheduled.

#### Scenario: Two timeouts with equal delays fire in no guaranteed order

- **GIVEN** two timeouts were scheduled with equal delays
- **WHEN** both are due
- **THEN** their firing order is not guaranteed

### Requirement: Timers after a device suspend follow the browser's scheduling

Timers that are pending across a device suspend SHALL follow the browser's own scheduling.

#### Scenario: A timer pending through a sleep follows the browser's schedule

- **GIVEN** the device sleeps with timers pending
- **WHEN** the device resumes
- **THEN** the timers follow the browser's own scheduling
