## Purpose

One primitive decides concurrency from what an operation targets and whether it reads or writes — reads are latest-wins, writes queue, and nothing is ever dropped silently.

## Requirements

### Requirement: Reads are latest-wins per target

A read SHALL take effect only when it is the newest read issued for its target, so that a slow earlier response never overwrites a newer one.

#### Scenario: A superseded read is silent

- **GIVEN** a newer read issued for the same target before an earlier one answers
- **WHEN** the earlier read answers
- **THEN** its data is not applied and no error or alert is shown

#### Scenario: A joined read resolves with the outcome of the read it joined

- **GIVEN** a read is already in flight for a target and a second caller asks for the same exclusive read
- **WHEN** the in-flight read answers
- **THEN** the second caller receives that same outcome and no second request is sent

### Requirement: Writes queue per target and reads never wait

Writes to the same target SHALL run one at a time in the order they were issued, writes to different targets SHALL run concurrently, and a read SHALL NOT wait behind any write.

#### Scenario: Two writes to one target run in order

- **WHEN** two writes to the same target are issued
- **THEN** the second write is sent only after the first has settled

#### Scenario: Writes to different targets run together

- **WHEN** writes to two different targets are issued
- **THEN** both are sent without waiting for each other

#### Scenario: A read is not held behind a pending write

- **GIVEN** a write is pending for a target
- **WHEN** a read for that target is issued
- **THEN** the read is sent immediately

### Requirement: A rejected write is rolled back and its error reported

A write SHALL apply its change when it is sent, and when the server rejects it SHALL restore the previous state and report the error.

#### Scenario: A rejected toggle reverts and reports the real message

- **GIVEN** a control that changed the screen optimistically
- **WHEN** the server rejects the write
- **THEN** the screen returns to its previous state and the alert shows the server's message

#### Scenario: A queued write builds on what its predecessor stored

- **GIVEN** a write queued behind another write to the same target
- **WHEN** the queued write is sent
- **THEN** its change is applied on top of the outcome the earlier write stored

### Requirement: A write is never discarded silently

A write SHALL NOT be discarded unless its caller asked for that, and every write that is discarded or superseded SHALL report its outcome to its caller.

#### Scenario: A duplicate exclusive write is reported as dropped

- **GIVEN** an exclusive write for a target already in flight
- **WHEN** another exclusive write for that target is issued
- **THEN** the second call is reported as dropped and nothing is sent

#### Scenario: A superseded write that failed still reports its failure

- **GIVEN** a superseding write whose earlier call failed after a newer call was issued
- **WHEN** the earlier call's failure arrives
- **THEN** the failure is reported to its caller

### Requirement: A write-back lands under the target it was issued for

An operation's results SHALL be filed under the target it was issued for, even when the screen has moved to another target before the results arrive.

#### Scenario: A read that resolves after a room switch files its rows under the old room

- **GIVEN** a read issued for one room
- **WHEN** the user switches to another room before the read answers
- **THEN** the read's rows are filed under the room it was issued for

### Requirement: A pushed event applies to the entity it names

An event pushed for one entity SHALL apply to the entity the event names, and SHALL NOT apply to whichever entity is on screen.

#### Scenario: A deletion elsewhere is applied to its own room

- **GIVEN** a deletion pushed for a room that is not on screen
- **WHEN** the event arrives
- **THEN** the deletion is applied to that room's data and the screen's room is unchanged

### Requirement: A callback that can fail reports its own outcome

A callback passed to an operation that can fail SHALL report its failure as its own outcome rather than throwing, because a throw rejects the caller's promise.

#### Scenario: A failing callback produces a result instead of a rejection

- **GIVEN** a callback that can fail while applying its result
- **WHEN** the callback fails
- **THEN** the caller receives an outcome rather than a rejected promise

### Requirement: Code does not order its own asynchronous work

Code SHALL NOT order its own asynchronous work with chained promises, held in-flight promises or its own call counters, and a surface that needs an ordering SHALL supply the target key instead.

#### Scenario: A surface that needs ordering passes a target key

- **WHEN** a surface needs two operations to run in order
- **THEN** both are issued under the same target key

#### Scenario: A hand-rolled call counter is rejected in review

- **WHEN** a review finds a call counter kept beside an asynchronous operation
- **THEN** the review rejects the change and asks for a target key instead

### Requirement: Search-as-you-type cancels the request it supersedes

Search-as-you-type SHALL cancel a superseded request rather than only ignoring its answer.

#### Scenario: A keystroke cancels the previous search request

- **GIVEN** a search request in flight
- **WHEN** the user types another character
- **THEN** the earlier request is cancelled

### Requirement: A snapshot-then-compare sequence is queued as a write

A sequence that snapshots state, reads, and compares the read against the snapshot SHALL be queued as a write under one target, so that two interleaved runs cannot both see the same before-state.

#### Scenario: Two pushes each toast a new notification once

- **GIVEN** two notifications pushed close together
- **WHEN** each push triggers the snapshot-read-compare sequence
- **THEN** each new notification is toasted once and the second run sees the first run's result
