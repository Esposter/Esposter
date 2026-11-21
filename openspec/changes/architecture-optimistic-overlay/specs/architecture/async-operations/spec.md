## REMOVED Requirements

### Requirement: Writes queue per target and reads never wait

**Reason**: A write queues on the rows its entry touches, across the app, and no longer on a key of one instance.

**Migration**: The requirement below states the queue on touched rows, with reads that never wait.

### Requirement: A rejected write is rolled back and its error reported

**Reason**: A refused write drops its overlay entry, so no restore runs.

**Migration**: The requirement below states the drop and the error report.

### Requirement: A snapshot-then-compare sequence is queued as a write

**Reason**: The bell keeps the ids it has toasted, and each id toasts once, so no queue orders the comparison.

**Migration**: The requirement below states the set of toasted ids.

## ADDED Requirements

### Requirement: Writes queue on the rows they touch, and reads never wait

A write issued through the overlay SHALL queue behind an earlier overlay write only when the two touch a row in common, whichever store issues them, and a read SHALL NOT wait behind any write.

#### Scenario: Two writes to one row run in order

- **WHEN** two writes that touch the same row are issued
- **THEN** the second write is sent only after the first has settled

#### Scenario: Writes to different rows run together

- **WHEN** writes to two different rows are issued
- **THEN** both are sent without waiting for each other

#### Scenario: A read is not held behind a pending write

- **GIVEN** a write is pending for a row
- **WHEN** a read of that row is issued
- **THEN** the read is sent immediately

#### Scenario: Deleting a role is not held behind creating one

- **GIVEN** a role creation in flight
- **WHEN** the reader deletes a different role
- **THEN** the deletion is sent at once

### Requirement: A rejected write drops its entry and reports its error

A refused overlay write SHALL drop the entry it showed and report its error to its caller, so the screen shows the stored value and the reader sees the server's message.

#### Scenario: A rejected toggle drops its entry and shows the real message

- **GIVEN** a control that changed the screen optimistically
- **WHEN** the server rejects the write
- **THEN** the screen returns to the stored value and the alert shows the server's message

#### Scenario: A queued write builds on what its predecessor stored

- **GIVEN** a write queued behind another write to the same row
- **WHEN** the queued write is sent
- **THEN** its change is applied on top of the outcome the earlier write stored

### Requirement: Two awaited answers for one row hold the higher version

Two answers for one row SHALL be applied in version order, so the answer with the higher version holds whichever of them arrives first.

#### Scenario: Two answers for one row arriving in reverse order keep the higher version

- **GIVEN** two awaited writes to one row, the later one answered at a higher version
- **WHEN** the later answer arrives before the earlier one
- **THEN** the row keeps the higher version

### Requirement: A snapshot-then-compare sequence keeps the ids it has handled

A sequence that compares a fresh read with what the screen held SHALL record each id it handles, so two sequences that overlap handle each id once.

#### Scenario: Two pushes each toast a new notification once

- **GIVEN** two notifications pushed close together
- **WHEN** each push triggers the snapshot-read-compare sequence
- **THEN** each new notification is toasted once

## MODIFIED Requirements

### Requirement: Code does not order its own asynchronous work

Code SHALL NOT order its own asynchronous work with chained promises, held in-flight promises or its own call counters, and a surface that needs an ordering SHALL give its writes an entry over the rows they touch, or pass a target key to a read or to a write that has no entry.

#### Scenario: A surface that needs ordering passes a target key

- **WHEN** a surface needs two operations to run in order
- **THEN** both are issued under the same target key

#### Scenario: A hand-rolled call counter is rejected in review

- **WHEN** a review finds a call counter kept beside an asynchronous operation
- **THEN** the review rejects the change and asks for an entry or a target key instead
