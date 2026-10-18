## Purpose

Every static dataset genshin-world reads — the game's tables and words, the fitted scenes and the authored world files — is published to Azure Blob Storage as content-addressed objects under a committed lock of their hashes and fetched by the browser at the world's gate, as the opening plays or as a screen opens, so the package bundles only the lock and one save bound, and the suites read the same objects through a local mirror.

## Requirements

### Requirement: Records are named by the hash of their content

The game's static datasets SHALL be stored as records each named by the hash of its own content, so a name always refers to the same bytes.

#### Scenario: Identical content is stored once

- **GIVEN** a record is already stored under the hash of its content
- **WHEN** the same content is published again
- **THEN** no second copy is written
- **AND** an object already present under its name is accepted as the state asked for rather than as an error

#### Scenario: A rerun with unchanged data makes no request

- **GIVEN** the lock already names the hash of every record of a dataset
- **WHEN** its builder runs again
- **THEN** the builder reports the data as unchanged
- **AND** no request is made to storage

### Requirement: The published lock is the only switch to new data

The published lock SHALL be the one switch that makes new records readable, so no page reads a new record before the commit of its lock has been deployed.

#### Scenario: New records reach pages on deploy

- **GIVEN** a dataset has been republished and its lock committed
- **WHEN** the deploy carrying that lock goes out
- **THEN** every page reads the new records

#### Scenario: An open page keeps the records it started with

- **GIVEN** a page is open on the build from before the lock changed
- **WHEN** new records are published
- **THEN** that page keeps reading the old records
- **AND** the old records stay stored

### Requirement: A read fetches only a key the lock names

A reader SHALL fetch a record only by a key the published lock names, and SHALL refuse any other key.

#### Scenario: A key the lock lacks is refused

- **GIVEN** no published lock names the key
- **WHEN** a reader asks for it
- **THEN** the read fails, reporting that the key is not in the game data lock

#### Scenario: An entity missing from its index is refused

- **GIVEN** an index holds no entry for the requested id
- **WHEN** a reader asks for that entity
- **THEN** the read fails, reporting that the entity is not in its index

### Requirement: Reading one entity takes two small fetches

A read of one entity from an index SHALL fetch the index first and then only the one record the index names.

#### Scenario: Opening one entity fetches its index, then its record

- **GIVEN** a screen opens one entity of an index collection
- **WHEN** the entity is read
- **THEN** the index is fetched first
- **AND** then only the one record the index names is fetched

### Requirement: A record is parsed by its own schema

A reader SHALL parse each record with its own schema and SHALL reject a record that schema does not parse.

#### Scenario: A record that fails its schema is rejected

- **GIVEN** a stored record whose content the reader's schema does not parse
- **WHEN** the reader reads it
- **THEN** the read is rejected rather than returned

#### Scenario: Each caller receives a value of its own

- **GIVEN** two callers read the same record
- **WHEN** each receives its value
- **THEN** each holds a value of its own

### Requirement: A record is fetched once per page and a failed fetch is retried

A record fetch SHALL be made once for the life of a page, and a failed or timed-out fetch SHALL be retried by the next read.

#### Scenario: A repeated read reuses the first fetch

- **GIVEN** a record was fetched earlier on the same page
- **WHEN** it is read again
- **THEN** no second fetch is made

#### Scenario: A failed fetch is retried

- **GIVEN** a fetch failed or timed out
- **WHEN** the record is read again
- **THEN** the fetch is made again

### Requirement: The world stays shut until its gate records load

The world SHALL stay shut until every record its gate names has loaded, and a failed gate read SHALL leave it shut.

#### Scenario: The world opens once its gate records load

- **GIVEN** the world is entered
- **WHEN** every record its gate names has loaded
- **THEN** the world opens

#### Scenario: A failed gate read keeps the world shut

- **GIVEN** a record the gate names fails to load
- **WHEN** the gate settles
- **THEN** the world stays shut
- **AND** the failure is logged

### Requirement: A screen keeps what it showed when a later read fails

A screen whose later record read fails SHALL keep showing what it had and SHALL log the failure.

#### Scenario: A failed read on an open screen keeps its content

- **GIVEN** a screen is showing its content
- **WHEN** a record it reads later fails to load
- **THEN** the screen keeps showing what it had
- **AND** the failure is logged

### Requirement: The opening holds its splashes white until its title logo loads

The opening SHALL hold its splashes white until the title logo it reads first has loaded.

#### Scenario: The splashes wait on the title logo

- **GIVEN** the opening has started
- **WHEN** its title logo has not yet arrived
- **THEN** the splashes stay white

#### Scenario: The login records arrive while the splashes play

- **GIVEN** the splashes are playing
- **WHEN** the login records finish loading
- **THEN** the login screen draws them

### Requirement: A publish replaces only the scope it names

A publish SHALL replace only the keys under the scope it names and SHALL keep every other key the lock already holds.

#### Scenario: A dataset scope replaces all of its keys

- **GIVEN** a dataset scope is published
- **WHEN** the publish runs
- **THEN** every key under that dataset is replaced

#### Scenario: A key scope replaces one key

- **GIVEN** a key scope naming one record is published
- **WHEN** the publish runs
- **THEN** only that key is replaced
- **AND** the dataset's other keys keep their lock entries

#### Scenario: A bare dataset given as a key is refused

- **GIVEN** a dataset name is given where a key is expected
- **WHEN** the publish is attempted
- **THEN** it is refused before anything is published

### Requirement: Retiring a record removes its lock entry and later its objects

Retiring a record SHALL remove its entry from the lock, and its stored objects SHALL be deleted only once no live lock names them and they are older than ninety days.

#### Scenario: A retired key leaves the lock on its next write

- **GIVEN** a key is deleted from the lock or its dataset is removed
- **WHEN** the lock is next written
- **THEN** the key no longer appears in the lock

#### Scenario: A prune keeps objects a live lock still names

- **GIVEN** an object is named by a lock on a live branch or in the recent window
- **WHEN** a prune runs
- **THEN** the object is kept

#### Scenario: A prune is skipped when the remote cannot be fetched

- **GIVEN** the remote repository cannot be fetched
- **WHEN** a prune runs
- **THEN** nothing is deleted
- **AND** the skipped prune is noted

#### Scenario: A reverted lock commit still resolves

- **GIVEN** a lock commit from within the window is reverted
- **WHEN** the reverted lock is read
- **THEN** its objects are still stored and resolve

### Requirement: Test suites read game data through a local mirror

Test suites SHALL read game data through a local mirror of the published objects and SHALL NOT keep a copy of the game data in the repository.

#### Scenario: A suite reads a record the mirror lacks

- **GIVEN** the mirror does not hold the hash of a record
- **WHEN** a suite reads the record
- **THEN** the record is downloaded from the development account
- **AND** it is kept in the shared cache

#### Scenario: A downloaded record that does not match its name is refused

- **GIVEN** a downloaded record whose bytes do not hash to its name
- **WHEN** it is stored
- **THEN** the read throws
- **AND** nothing is kept in the cache

#### Scenario: CI restores the mirror for every shard

- **GIVEN** a CI run for a lock whose hash already has a cache
- **WHEN** the test shards start
- **THEN** each shard restores the cache
- **AND** no shard fetches any record

### Requirement: The package bundles its lock and no game record

The package SHALL bundle only its lock and the one achievement count the save schema needs at import, and SHALL NOT bundle any game record.

#### Scenario: A build includes no game record

- **GIVEN** the package is built
- **WHEN** its bundle is produced
- **THEN** no game record is included in it

#### Scenario: A record is fetched when a page first needs it

- **GIVEN** a player opens a page that needs a record
- **WHEN** the record's key is read
- **THEN** the browser fetches the record from storage at that moment

### Requirement: Records are served straight from storage to the browser

Each record SHALL be served directly from storage to the browser with no app route in between, and SHALL be cached by the browser for a year without revalidation.

#### Scenario: A record is fetched from storage directly

- **GIVEN** a page needs a record
- **WHEN** the browser fetches it
- **THEN** the request goes to storage rather than to the app's server

#### Scenario: A repeat visit uses the cached record

- **GIVEN** the record was fetched before
- **WHEN** the page loads again within a year
- **THEN** the browser answers without making a request

### Requirement: A profile or book record is checked before it is published

A profile or book record SHALL be parsed by its schema before it is published, and an index SHALL hash to the same name whatever order its entries were built in.

#### Scenario: An invalid profile record is not published

- **GIVEN** a profile record that its schema does not parse
- **WHEN** the publish runs
- **THEN** the record is not published

#### Scenario: The order of index entries does not change the name

- **GIVEN** two builds list the same index entries in different orders
- **WHEN** each index is hashed
- **THEN** both hash to the same name

### Requirement: Verification confirms every reached object matches its name

A verification SHALL fetch every object the lock reaches from each account and SHALL confirm that each hashes to its name.

#### Scenario: Verification checks each account

- **GIVEN** the lock names objects in both accounts
- **WHEN** verification runs
- **THEN** each reached object is fetched from each account without credentials
- **AND** each is checked against its name
