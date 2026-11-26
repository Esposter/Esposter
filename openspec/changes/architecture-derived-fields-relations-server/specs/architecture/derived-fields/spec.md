## Purpose

Defines how the database keeps every server-derived aggregate and function value equal to its inputs, and how a write answers with the values it changed and a read serves them by key.

## ADDED Requirements

### Requirement: A change to a contributing row moves each of its targets by the same difference, in the same transaction

When a row that contributes to an aggregate is inserted, updated or removed, the database SHALL move each target the row names by the difference the row makes, within the same statement that changed the row.

#### Scenario: A revived vote moves the count of its post by its value

- **GIVEN** a post whose count no longer includes a removed vote's value
- **WHEN** the vote is revived with a value
- **THEN** the post's count rises by that value

#### Scenario: A removed comment lowers every post above it by the comments it removed

- **GIVEN** a comment with replies, under a post with a count that includes them
- **WHEN** the comment is removed with its replies
- **THEN** each post above the comment lowers its count by the number of comments removed

#### Scenario: A refused vote moves no count

- **GIVEN** a vote the server refuses because a live vote already stands
- **WHEN** the vote is written
- **THEN** the post's count is unchanged

#### Scenario: A change to the key column of a relation is refused

- **GIVEN** a contributing row whose target column is named by its relation
- **WHEN** an update changes that column
- **THEN** the update fails and no target moves

### Requirement: A moved count raises its row's version and leaves its update time

A target whose value a trigger moves SHALL have its version raised by one and its update time left as it was, so that a read ordered by version sees the move and an edit is never recorded for a count.

#### Scenario: A moved count raises the version of its post

- **GIVEN** a post at a version
- **WHEN** a vote on the post moves its count
- **THEN** the post's version is one higher than before

#### Scenario: A moved count leaves the update time of its post unchanged

- **GIVEN** a post with an update time
- **WHEN** a vote on the post moves its count
- **THEN** the post's update time is the same as before

### Requirement: A function-kind value is written in the same batch as its inputs

A value computed from other columns of its own row SHALL be written in the same batch as the inputs it is computed from, so that no read sees a value its inputs do not produce.

#### Scenario: A ranking follows its vote in the same write

- **GIVEN** a post with a ranking
- **WHEN** a vote on the post moves its count
- **THEN** the post's ranking is the ranking of its new count in the same write

#### Scenario: The stored ranking equals the ranking definition on the sampled grid

- **GIVEN** a grid of counts and creation times
- **WHEN** each point is stored and read back
- **THEN** each stored ranking equals the ranking definition within the parity tolerance

### Requirement: A write answers with the derived values of the rows it changed

A write that changes a derived value SHALL answer with the version and values of every derived row its batch changed, read after the batch's last change, and a refused write SHALL answer with its error and no values.

#### Scenario: A vote answers with the counts of its post at the version the vote moved them to

- **GIVEN** a post whose count a vote moves
- **WHEN** the vote is written
- **THEN** the answer holds the post's counts and the version the vote left the post at

#### Scenario: A refused vote answers with its error and no derived values

- **GIVEN** a vote the server refuses
- **WHEN** the vote is written
- **THEN** the answer is the refusal and holds no derived values

### Requirement: A batched read answers each key with its version and values, chunked at the cap

The read SHALL answer each key it is given with the key's version and derived values, in chunks no larger than the cap, so that a larger set of keys is read in several requests and no key is answered twice.

#### Scenario: A read of more keys than the cap is answered in chunks

- **GIVEN** a read naming more keys than the cap allows in one request
- **WHEN** the read is made
- **THEN** the keys are answered across several requests, each holding no more than the cap

#### Scenario: A key that matches no row is answered with nothing

- **GIVEN** a key naming no row of the table
- **WHEN** the read is made
- **THEN** the answer holds no entry for that key

### Requirement: Every declared aggregate equals its recomputation after any sequence of writes

After any sequence of writes made through the routers, each declared aggregate SHALL equal the value recomputed from its live contributing rows.

#### Scenario: A random sequence of votes and comments leaves every aggregate at its recomputation

- **GIVEN** a generated sequence of votes, comment creations, comment removals and vote changes
- **WHEN** the sequence has run through the routers
- **THEN** every declared aggregate equals its recomputation from the live rows

#### Scenario: An account erase leaves every aggregate at its recomputation

- **GIVEN** an account that holds votes on posts and posts of its own
- **WHEN** the account is erased
- **THEN** each post the account voted on lowers its count by the vote removed, and every ranking equals its recomputation from the live rows

### Requirement: A migration recomputes every aggregate once from its inputs

The migration that adds the triggers SHALL recompute each declared aggregate once from its inputs, so that a value a past write left wrong is corrected, and a correct value is left unchanged.

#### Scenario: A drifted count is corrected by the recompute

- **GIVEN** a post whose stored count differs from its live contributing rows
- **WHEN** the migration runs
- **THEN** the post's count equals its live contributing rows

#### Scenario: A correct count is left unchanged by the recompute

- **GIVEN** a post whose stored count equals its live contributing rows
- **WHEN** the migration runs
- **THEN** the post's count is unchanged

### Requirement: A derived key is updated only by its maintenance helpers

A statement outside the maintenance helpers SHALL NOT update a derived key, so that no write moves a derived value by hand.

#### Scenario: A set of a derived key outside the helpers is refused by lint

- **GIVEN** an update statement outside the helper module that sets a derived key
- **WHEN** lint runs
- **THEN** lint fails and names the key
