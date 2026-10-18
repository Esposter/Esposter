## Purpose

A server write derived from what it just read is conditional on that version, and a lost race re-applies the intent to the version it re-reads — an etag, a row lock, or an event's own ordering value, since idempotent is not order-independent.

## Requirements

### Requirement: A derived write applies only to the version it was computed from

A write computed from an entity the procedure has just read SHALL apply only to the version of that entity it was computed from.

#### Scenario: Two concurrent edits to one entity keep both

- **GIVEN** two readers change the same entity at the same moment
- **WHEN** both writes land
- **THEN** the change that landed first is still present

#### Scenario: A full-body replace does not revert another reader's change

- **GIVEN** a reader clears a field on an entity that another reader has just changed
- **WHEN** the clear is written
- **THEN** the other reader's change is kept

### Requirement: A lost race re-applies the intent to the newest version

A write that loses a race SHALL re-apply the caller's intent to the newest version of the entity rather than resend the body it first computed.

#### Scenario: A vote lost to a concurrent change is recorded on the newest state

- **GIVEN** a vote was computed from a poll that another vote has since changed
- **WHEN** the write loses the race
- **THEN** the vote is recorded against the newest state of the poll

#### Scenario: Every attempt losing sends the change back to the caller

- **GIVEN** every attempt keeps losing the race
- **WHEN** the last attempt loses
- **THEN** the caller receives a conflict asking it to send the change again

### Requirement: An absent entity and a failed read are reported as different outcomes

An entity that is absent and a read that failed SHALL be reported as different outcomes.

#### Scenario: An entity deleted during the write is reported as not found

- **GIVEN** an entity is deleted while a write is in progress
- **WHEN** the retry finds no entity
- **THEN** the caller is told the entity was not found

#### Scenario: A failed re-read asks the caller to try again

- **GIVEN** the re-read fails for a reason other than the entity being absent
- **WHEN** the caller is answered
- **THEN** the caller receives a conflict asking it to send the change again
- **AND** the fault is logged with its cause

#### Scenario: A write that fails for another reason reports that failure

- **GIVEN** the entity's version has not changed
- **WHEN** the write fails
- **THEN** the original failure is reported

### Requirement: A handler keeps the newer value when an older event arrives late

A handler whose write depends on when its event happened SHALL keep the newer value when an older event for the same item is delivered after it.

#### Scenario: An older event does not overwrite a newer value

- **GIVEN** a newer change to an item has already been applied
- **WHEN** an older event for the same item is delivered
- **THEN** the newer value is kept

#### Scenario: An older event is acknowledged rather than retried

- **GIVEN** a newer change to an item has already been applied
- **WHEN** an older event for the same item is delivered
- **THEN** the event is acknowledged as handled
- **AND** it is not retried

### Requirement: Concurrent computations from one stored value do not interleave

Two computations made from one stored value SHALL NOT interleave, so each one sees the result of the other.

#### Scenario: Simultaneous uploads leave an accurate storage total

- **GIVEN** two uploads to one owner's storage finish at the same moment
- **WHEN** their charges are recorded
- **THEN** the owner's storage total equals the sum of both uploads

### Requirement: A claim is decided by the single write that takes it

A gate that allows one action per interval, or a single claim, SHALL be decided by the one write that takes it, so only one of concurrent callers wins.

#### Scenario: Two callers claiming at once produce one winner

- **GIVEN** two callers check the same claim at the same moment
- **WHEN** both try to take it
- **THEN** exactly one of them wins

#### Scenario: An attempt inside the interval makes no second revision

- **GIVEN** an automatic revision was made within the current interval
- **WHEN** another attempt comes in during that interval
- **THEN** no second revision is made
