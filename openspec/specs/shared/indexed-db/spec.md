## Purpose

The typed IndexedDB wrapper in @esposter/shared — a schema that types every store, index and key, and the absorption of idb it replaced, with every upstream issue's verdict.

## Requirements

### Requirement: The schema types every store, index and key of the browser database

The database wrapper SHALL accept only the store names, index names and keys that its schema declares, and SHALL refuse any other at compile time.

#### Scenario: A store the schema does not declare is refused

- **GIVEN** a schema declaring one store
- **WHEN** a caller opens a store under a name the schema does not declare
- **THEN** the program does not compile

#### Scenario: An index is typed by the store it belongs to

- **GIVEN** a schema whose store declares one index
- **WHEN** a caller looks up a different index on that store
- **THEN** the program does not compile

### Requirement: A read-only transaction cannot write

The wrapper SHALL give a read-only transaction no write operation, so that a function requiring a writable transaction refuses a read-only one at compile time.

#### Scenario: A writing function is given a read-only transaction

- **GIVEN** a function that requires a writable transaction
- **WHEN** a caller passes it a read-only transaction
- **THEN** the program does not compile

### Requirement: Opening the database touches the browser only when called

The wrapper SHALL leave the browser database untouched until a caller opens it, so importing it where no browser database exists causes no error.

#### Scenario: Importing the wrapper on a server causes no error

- **GIVEN** a process with no browser database available
- **WHEN** the wrapper is imported and never opened
- **THEN** no error is raised

### Requirement: A failed upgrade leaves the database version unchanged

The wrapper SHALL abort the version change when its upgrade callback throws, so that the version is not applied with only some of its stores.

#### Scenario: An upgrade that throws aborts the version change

- **GIVEN** an upgrade callback that throws part way through creating stores
- **WHEN** a caller opens the database at the new version
- **THEN** the open request rejects with the abort
- **AND** the database keeps its previous version

### Requirement: A transaction settles with its own outcome

The wrapper SHALL settle a transaction's completion with the error that aborted it, and SHALL settle an abort that carries no error as an abort error.

#### Scenario: A failed transaction rejects with the error that aborted it

- **GIVEN** a transaction whose request fails
- **WHEN** a caller awaits the transaction's completion
- **THEN** the completion rejects with the error that aborted it

#### Scenario: An abort with no error of its own rejects as an abort

- **GIVEN** a transaction aborted without an error
- **WHEN** a caller awaits the transaction's completion
- **THEN** the completion rejects with an abort error

#### Scenario: A failure nobody awaits is logged

- **GIVEN** a transaction that fails and whose completion no caller reads
- **WHEN** the failure occurs
- **THEN** the failure is logged rather than left unhandled

### Requirement: A single request reports its own error

The wrapper's one-request operations SHALL report the request's own error to the caller.

#### Scenario: A failed read reports the request's error

- **GIVEN** a single read that the browser database rejects
- **WHEN** a caller awaits the read
- **THEN** the caller receives the request's own error

### Requirement: The wrapper offers the operations its callers use and no more

The wrapper SHALL offer opening with its upgrade, blocked, blocking and terminated callbacks, the get, getAll, getAllKeys, put and delete operations, and the store and index creation an upgrade needs, and SHALL NOT offer cursors, iteration, add, clear, count or database deletion.

#### Scenario: A caller looks for a cursor

- **GIVEN** a caller that wants to iterate a store with a cursor
- **WHEN** the caller looks at the wrapper's surface
- **THEN** no cursor or iteration operation is offered

### Requirement: Every upstream issue and pull request carries exactly one verdict

The audit of the upstream repository SHALL record exactly one verdict for every issue and pull request it reads.

#### Scenario: A reviewer finds the outcome of an upstream issue

- **GIVEN** an issue or pull request on the upstream repository
- **WHEN** a reviewer looks it up on the audit page
- **THEN** exactly one verdict is recorded for it
