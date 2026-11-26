## Purpose

Defines how the server steps the counters and assigns the values that the database cannot maintain on its own, how the client predicts the one counter whose reset it can state, and how a value that crosses a store boundary is repaired from its source.

## ADDED Requirements

### Requirement: A counter adds the step its write declares, in the write's own transaction

A write that changes a counter SHALL add the step it declares to that counter within the same batch as the write, so that the counter moves exactly when the write succeeds.

#### Scenario: A join adds one to the uses of its invite

- **GIVEN** an invite with uses below its maximum
- **WHEN** a member joins through the invite
- **THEN** the invite's uses rise by one

#### Scenario: A refused join adds nothing to the uses of its invite

- **GIVEN** an invite already at its maximum uses
- **WHEN** a member tries to join through it
- **THEN** the join is refused and the invite's uses are unchanged

### Requirement: A mention count clears to zero when its room is read

A read of a room SHALL set the reader's mention count to zero, and the reader's view SHALL show zero at once, so that a count the reader has already seen is not shown again.

#### Scenario: Opening a room shows its mention count at zero at once

- **GIVEN** a room whose mention count the reader holds above zero
- **WHEN** the reader opens the room and the server has not answered
- **THEN** the room's mention count shows zero

#### Scenario: A refused clear restores the held mention count

- **GIVEN** a room the reader opened, with its count cleared at once
- **WHEN** the clear is refused by the server
- **THEN** the room's mention count shows the count it held before the clear

### Requirement: A value that crosses a store boundary is repaired from its source when its write fails

A value whose contributing rows are in another store SHALL be repaired by a reconcile that recounts it from its source whenever the write that moved the source fails after the source was written, so that the value converges to its source.

#### Scenario: A failed mention write enqueues a reconcile for its room

- **GIVEN** a message that mentions members, written and then failing to update their counts
- **WHEN** the count update fails
- **THEN** a reconcile for the room is enqueued

#### Scenario: A reconcile recounts the mention count and the last message time from the messages of the room

- **GIVEN** a room whose mention counts and last message time disagree with its messages
- **WHEN** the reconcile runs
- **THEN** each member's mention count and the room's last message time equal the values the messages give

#### Scenario: A burst of failed mention writes queues one reconcile for the room

- **GIVEN** several messages to a room whose mention count updates fail while one reconcile for the room is pending
- **WHEN** the updates fail
- **THEN** only one reconcile for the room is pending

### Requirement: A value the client cannot predict exactly is answer-only

A derived value whose change the client cannot state exactly SHALL be shown only once the server's answer sets it, so that no value is shown as fact before it is known.

#### Scenario: The storage counter holds its value until the reserve answers

- **GIVEN** an upload whose stored bytes are reserved on the server
- **WHEN** the reserve has not answered
- **THEN** the storage counter shows its value before the reserve, unchanged

#### Scenario: A view count holds its value until the view is counted

- **GIVEN** a resource whose view count is shown
- **WHEN** a view is counted and the server has not answered
- **THEN** the view count shows its value before the view, unchanged

#### Scenario: A counter shows the value its answer carries

- **GIVEN** a counter whose write has been issued
- **WHEN** the write's answer arrives with the counter's value
- **THEN** the counter shows the value the answer carries
