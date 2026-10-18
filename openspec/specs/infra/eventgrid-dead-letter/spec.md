## Purpose

Failed Event Grid deliveries land in a blob container that push-triggers an automatic replay, capped per event by a counter carried on the event id that quarantines poison payloads.

## Requirements

### Requirement: Exhausted deliveries are kept as dead-letter blobs

An event delivery that exhausts its retries SHALL be written to the dead-letter container rather than being dropped.

#### Scenario: Endpoint refuses every attempt

- **GIVEN** an event's endpoint refuses every delivery attempt
- **WHEN** the attempts or the time limit run out
- **THEN** the undelivered events are written as a dead-letter blob

### Requirement: Dead letters are replayed without any scheduled job

A dead-letter blob SHALL be republished automatically when it is written, with no scheduled job and no manual command.

#### Scenario: Blob written to the container

- **GIVEN** a dead-letter blob is written under the dead-letter path
- **WHEN** the blob's creation event is delivered
- **THEN** the events in the blob are republished

### Requirement: Republished events carry their attempt count on their id

Each republished event SHALL carry its replay attempt count on its identifier, with the original identifier kept readable, so that the count survives repeated dead-lettering.

#### Scenario: Event republished for the first time

- **GIVEN** an event has no replay count on its identifier
- **WHEN** it is republished
- **THEN** its identifier is the original identifier followed by attempt one

#### Scenario: Event republished again

- **GIVEN** an event's identifier already carries a replay count
- **WHEN** it is republished
- **THEN** its count is incremented in place and the original identifier is kept

### Requirement: Events at the replay cap are quarantined

An event whose replay count has reached the cap SHALL be copied to the quarantine prefix and logged, and SHALL NOT be republished.

#### Scenario: Event reaches the cap

- **GIVEN** an event's replay count has reached the cap
- **WHEN** its dead-letter blob is replayed
- **THEN** the event is copied under the quarantine prefix
- **AND** an error is logged naming the blob and how many events were quarantined

### Requirement: Non-idempotent handlers are quarantined regardless of count

An event whose handler is not marked idempotent SHALL be quarantined rather than republished, whatever its replay count.

#### Scenario: Event for a handler that duplicates work when rerun

- **GIVEN** an event's handler would post a second copy of its result when rerun
- **WHEN** its dead-letter blob is replayed
- **THEN** the event is quarantined rather than republished

#### Scenario: Event for a handler that converges when rerun

- **GIVEN** an event's handler converges on the same state when rerun
- **WHEN** its dead-letter blob is replayed
- **THEN** the event is republished

### Requirement: Payloads that are not event lists are quarantined whole

A dead-letter payload that is not a list of dead-lettered events SHALL be copied whole to the quarantine prefix, and its original SHALL be deleted.

#### Scenario: Payload fails validation

- **GIVEN** a dead-letter payload does not match the expected list of events
- **WHEN** it is replayed
- **THEN** the payload is copied under the quarantine prefix
- **AND** the parse error is logged

### Requirement: Quarantined events resume by moving their blob back

An operator SHALL resume a quarantined event by copying its blob back to the dead-letter root under a new name, after which the replay picks it up without a manual command.

#### Scenario: Operator restores a capped event

- **GIVEN** an event was quarantined because it reached the cap
- **WHEN** its blob is copied back to the dead-letter root under a new name
- **THEN** the replay republishes the event with its count reset

#### Scenario: Restored event fails the idempotency check again

- **GIVEN** an event was quarantined because its handler is not idempotent
- **WHEN** its blob is copied back to the dead-letter root
- **THEN** the event is quarantined again without being republished

### Requirement: Startup re-queues stranded dead letters

The app start SHALL re-upload dead-letter blobs stranded past the delivery window, and SHALL leave archived and quarantined blobs and blobs still within the window alone.

#### Scenario: Stranded blob found at app start

- **GIVEN** a dead-letter blob is older than the delivery window and sits at the container root
- **WHEN** the app starts
- **THEN** the blob is re-uploaded so that a new creation event is raised

#### Scenario: Blob still within its window

- **GIVEN** a dead-letter blob is younger than the delivery window
- **WHEN** the app starts
- **THEN** the blob is skipped

#### Scenario: Container cannot be read at start

- **GIVEN** the dead-letter container cannot be read at app start
- **WHEN** the app starts
- **THEN** the app starts normally and the blobs wait for the next start

### Requirement: Republished events stay within both publish limits

Republished events SHALL be sent in requests that each fit both the byte limit and the event count limit, and never as one oversized request.

#### Scenario: Blob holds many tiny events

- **GIVEN** a dead-letter blob holds more events than one request may carry
- **WHEN** it is republished
- **THEN** the events are sent in several requests
- **AND** no request exceeds the byte limit or the event count limit

### Requirement: Quarantine copies keep the delivery diagnostics

A quarantine copy SHALL keep the delivery diagnostics Event Grid recorded for its original events.

#### Scenario: Operator opens a quarantine copy

- **GIVEN** an event was quarantined
- **WHEN** the quarantine copy is opened
- **THEN** it shows why the delivery was dead-lettered and how many attempts it made

### Requirement: Replayed originals are archived without reprocessing

A replayed original SHALL be archived under the archived prefix after its events are republished, and a failed archive SHALL leave the original in place without raising another replay.

#### Scenario: Archive fails after republish

- **GIVEN** the events were republished
- **WHEN** archiving the original fails
- **THEN** the original stays in the container
- **AND** it does not trigger another replay

### Requirement: Redelivery of a finished blob does nothing

A redelivered creation event whose blob is already gone SHALL be treated as a completed replay.

#### Scenario: Blob already handled

- **GIVEN** a dead-letter blob was already replayed and removed
- **WHEN** its creation event is redelivered
- **THEN** nothing is downloaded and nothing is republished

### Requirement: Replay exhaustion discards events without a page

A replay whose own delivery exhausts its attempts SHALL discard its events without raising an alert, and the dead letter SHALL remain until the thirty-day lifecycle deletes it.

#### Scenario: Replay delivery exhausts

- **GIVEN** the replay subscription's own deliveries are refused until they exhaust
- **WHEN** the attempts run out
- **THEN** the events are discarded
- **AND** no alert is raised

### Requirement: Dead-letter blobs expire after thirty days

Every blob under the dead-letter prefix SHALL be deleted thirty days after it is written.

#### Scenario: Blob older than thirty days

- **GIVEN** a dead-letter blob was written more than thirty days ago
- **WHEN** the lifecycle rule runs
- **THEN** the blob is deleted
