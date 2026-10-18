## Purpose

The console output of a failed IndexedDB upgrade in @esposter/shared: each failed upgrade is logged once, with the message its callback threw, and an upgrade aborted without a throw is still logged.

## Requirements

### Requirement: Thrown upgrade failure is logged once

The IndexedDB upgrade SHALL write exactly one console error for each failed upgrade whose callback throws.

#### Scenario: A thrown upgrade failure is logged once

- **GIVEN** an upgrade whose callback throws an error
- **WHEN** the upgrade fails
- **THEN** exactly one console error is written

### Requirement: Upgrade aborted without a thrown error is logged

The IndexedDB upgrade SHALL write a console error when an upgrade aborts without its callback throwing, so that no failed upgrade goes unlogged.

#### Scenario: An upgrade aborted by a request error is logged

- **GIVEN** an upgrade in which a request fails and the callback throws nothing
- **WHEN** the transaction aborts
- **THEN** exactly one console error is written

### Requirement: Logged upgrade failure names the thrown message

The IndexedDB upgrade SHALL name, in the console error it writes for a thrown failure, the message the upgrade callback threw.

#### Scenario: A thrown upgrade failure keeps its message

- **GIVEN** an upgrade whose callback throws an error with a message
- **WHEN** the upgrade fails
- **THEN** the console error includes that message
