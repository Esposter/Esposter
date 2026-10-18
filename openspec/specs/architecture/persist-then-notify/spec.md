## Purpose

Once a write lands the outcome is decided — the realtime notify follows it immediately, and every effect after that is best-effort.

## Requirements

### Requirement: A mutation refused by a guard changes nothing

A mutation SHALL refuse the caller with an error, and write nothing, whenever a guard that decides whether it is allowed fails.

#### Scenario: A caller lacks permission for the mutation

- **GIVEN** a caller is not allowed to perform the mutation
- **WHEN** the caller submits it
- **THEN** the caller receives an error
- **AND** nothing is written and no event is sent

#### Scenario: A caller exceeds a rate limit

- **GIVEN** a caller has spent its budget for the mutation
- **WHEN** the caller submits it again
- **THEN** the caller is refused as too many requests
- **AND** nothing is written

### Requirement: A limit that gates the next attempt advances before the write

A limit whose stored value decides the next attempt SHALL advance before the write, so that a failed write costs the caller one window rather than lifting the limit.

#### Scenario: A sender posts inside a slow mode window

- **GIVEN** a room has a slow mode and a sender posted within its window
- **WHEN** the sender posts again
- **THEN** the post is refused until the window has passed

#### Scenario: The write fails after the limit advanced

- **GIVEN** a sender's post was refused by the write after the limit advanced
- **WHEN** the sender tries again
- **THEN** the sender waits for the window before the next attempt is accepted

### Requirement: A failed primary write is returned as a failure

A failure of the write that constitutes the entity SHALL be returned to the caller as a failure, and no notification SHALL be sent for it.

#### Scenario: The primary write of a message fails

- **GIVEN** a message write fails
- **WHEN** the failure happens
- **THEN** the caller receives the error
- **AND** no realtime notification is sent for the message

### Requirement: The realtime notification follows the primary write at once

The realtime notification SHALL be sent immediately after a successful primary write, with no fallible step between the two.

#### Scenario: A message is saved

- **GIVEN** the primary write of a message succeeds
- **WHEN** the write returns
- **THEN** connected clients are notified before any other effect of the message runs

### Requirement: Effects after the notification are best-effort

Every effect that runs after the notification SHALL be best-effort, so that its failure is logged and the caller still receives success.

#### Scenario: A counter update fails after the message is saved

- **GIVEN** a message has been saved and notified
- **WHEN** an effect that follows, such as a badge count update, fails
- **THEN** the caller receives success
- **AND** the failure is logged

### Requirement: Effects that read each other run in their required order

Best-effort effects that a later effect reads from SHALL run before that later effect, even though each may fail without costing the caller its result.

#### Scenario: A reply creates follow records before its notification

- **GIVEN** a reply creates follow records that the notification resolves its recipients from
- **WHEN** the reply is saved
- **THEN** the follow records are written before the notification is published

### Requirement: A write that changed nothing announces nothing

A mutation that changed no state SHALL NOT record activity or send any event for the change it did not make, and SHALL still answer the caller.

#### Scenario: A stale tab repeats a deletion already performed

- **GIVEN** a resource was already deleted by another session
- **WHEN** a stale tab repeats the deletion
- **THEN** no activity entry is written and no push is sent to the owner's other devices
- **AND** the caller receives its answer

### Requirement: An effect that a cleanup undoes completes before the caller is answered

An effect that a compensating cleanup would otherwise leave behind SHALL complete before the caller is answered.

#### Scenario: A create is rolled back after its activity was written

- **GIVEN** a resource creation writes its activity entry and then rolls back
- **WHEN** the rollback runs
- **THEN** no activity entry remains for the removed resource

### Requirement: A post-write effect whose loss breaks a promise is published as a durable event

A post-write effect whose loss would break a promise to a user SHALL be published as an event that is retried until it completes, and a publish that never reaches the event system SHALL be logged and not retried.

#### Scenario: A file attachment is deleted

- **GIVEN** a message attachment is deleted
- **WHEN** its storage deletion is published
- **THEN** the deletion is retried until the stored file is removed

#### Scenario: The publish itself fails

- **GIVEN** the event system does not accept the publish
- **WHEN** the failure happens
- **THEN** the failure is logged
- **AND** nothing is retried

### Requirement: A fan-out persists each item on its own

A mutation that fans out over several items SHALL process each item independently, so that one item's refusal never undoes another item's write.

#### Scenario: One room refuses a forwarded message

- **GIVEN** a message is forwarded into several rooms and one room refuses it
- **WHEN** the forward runs
- **THEN** the rooms that accepted the message keep it
- **AND** the caller receives the first refusal

### Requirement: A retried handler never duplicates its own post-write effects

A handler that is retried after its primary write SHALL NOT create a duplicate of any effect that runs after that write.

#### Scenario: An event is delivered twice

- **GIVEN** an event is delivered to a handler more than once
- **WHEN** the handler runs for the second delivery
- **THEN** its post-write effects are not created a second time

### Requirement: A fallible step after a notification is refused by the lint check

The lint check SHALL fail on any fallible step that follows a notification in the same function, unless that step can never reject.

#### Scenario: A developer awaits a rejecting call after an emit

- **GIVEN** code awaits a call that can reject after emitting a notification
- **WHEN** the lint check runs
- **THEN** the lint check fails
