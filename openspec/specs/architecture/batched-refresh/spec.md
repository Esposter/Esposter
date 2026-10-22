## Purpose

The one primitive that re-reads a server-derived value for the keys a client marks as changed: one run at a time, every mark read by the run after it, a failed read retried on a backoff and a cap, and the post counts applied to every copy the client holds.

## Requirements

### Requirement: One run reads at a time, and the newest run finishes last

A batched refresh SHALL run one read at a time, and a key marked while a run is in flight SHALL be read by the run owed after it.

#### Scenario: A mark during a run is read after it

- **GIVEN** a run in flight that reads key A
- **WHEN** key B is marked
- **THEN** B is read by the run owed after the one in flight, and the reads do not overlap

#### Scenario: The flight's caller and every call made during it wait for the owed run

- **GIVEN** a flight with an owed run
- **WHEN** the flight's caller, or a call made during the flight, awaits its refresh
- **THEN** the call settles only after the owed run has read its keys

### Requirement: A run with no keys makes no read

A run whose dirty set is empty SHALL NOT call the read.

#### Scenario: A scheduled retry finds nothing left to read

- **GIVEN** a retry scheduled before a mark, and a run that already read the marked key
- **WHEN** the retry runs
- **THEN** no read is made

### Requirement: A failed read puts its keys back and logs the error

A run that fails SHALL put its keys back in the dirty set, SHALL log the error, and SHALL NOT reject its caller.

#### Scenario: The next mark reads the failed keys again

- **GIVEN** a run that failed on key A
- **WHEN** key B is marked
- **THEN** the next run reads A and B

#### Scenario: The caller does not see the failure

- **GIVEN** a run that fails
- **WHEN** the caller awaits the refresh
- **THEN** the caller resolves, and the error is logged once

### Requirement: A failed read is retried on the backoff, up to five times

A failed run SHALL schedule one more run without a mark, paced by the backoff from [retry and backoff](../retry-and-backoff/design.md), and SHALL stop after five retries in a row.

#### Scenario: A failed read recovers without a mark

- **GIVEN** a run that fails once and then succeeds
- **WHEN** the backoff's first wait has passed
- **THEN** the failed keys are read again without a mark

#### Scenario: A server that stays down is not asked forever

- **GIVEN** a read that fails on every attempt
- **WHEN** the retries are exhausted
- **THEN** the read has been made six times in total, and no further retry is scheduled

#### Scenario: A success after the cap reads again on the next mark

- **GIVEN** a read that has stopped retrying at the cap
- **WHEN** a key is marked and the read succeeds
- **THEN** the key is read after the backoff's last wait, the maximum, and the retry count resets

### Requirement: A post count moves only by a read, and every copy the client holds receives it

A count the server keeps on a post SHALL reach every copy the post or comment stores hold only through the one read of `usePostCountStore`, and a write that brings a copy from its response SHALL read the count back rather than take it from the response.

#### Scenario: A reply reaches the feed's copy of its parent

- **GIVEN** a feed holding a post and a thread on that post's page
- **WHEN** a reply is created on the page
- **THEN** the feed's card for the post shows the count the server holds

#### Scenario: An edit's older response does not replace a count the read has set

- **GIVEN** an edit whose response carries an older count than a read that already landed
- **WHEN** the edit settles
- **THEN** the copy shows the count the owner reads back

#### Scenario: A rejected delete restores the count the server holds

- **GIVEN** a delete the server rejects, after the count moved while the comment was out of the thread
- **WHEN** the rollback restores the comment
- **THEN** the restored comment shows the count the server holds

## Non-goals

- Ordering across owners. Two owners of the same copies are not supported, so the question does not arise; a value with copies in two stores has one owner.
- Retrying a write. Writes are rolled back and reported, as [client data](../client-data/design.md) states.
