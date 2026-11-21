## ADDED Requirements

### Requirement: Every row the server holds carries a version the database raises on each change

Each row in a table the server stores SHALL carry a version that starts at zero and that the database raises inside the statement that changes the row, so no write names the version it leaves.

#### Scenario: An update raises the version of the row it changes

- **GIVEN** a stored row at a version
- **WHEN** a write changes the row
- **THEN** the row's version is one higher than before the write

#### Scenario: A new row starts at version zero

- **WHEN** a write inserts a row without naming a version
- **THEN** the row is stored at version zero

### Requirement: A removed row stays in its table as a tombstone, and a revival continues its version

A removal SHALL leave the row in its table as a tombstone at a raised version, and a revival of the same key SHALL continue that version rather than restart it, so an older answer for the key loses to the removal.

#### Scenario: A removed row stays in its table as a tombstone

- **GIVEN** a live row a write removes
- **WHEN** the removal is made
- **THEN** the row remains in its table marked deleted, at a higher version

#### Scenario: A revived row continues the version of its tombstone

- **GIVEN** a tombstone for a key
- **WHEN** the key is written again
- **THEN** the row is live again at a version above the tombstone's

### Requirement: A mutation's answer names each row it changed at the version it left

A successful mutation SHALL name each row it changed, with the table, the key and the version the write left it at, so the client can settle the change it made at those versions, unless the write changed more rows than the header holds.

#### Scenario: A write's answer names each row it changed at its version

- **GIVEN** a write that changes two rows
- **WHEN** the write succeeds
- **THEN** the answer names both rows at the versions the write left them

#### Scenario: A write that changed too many rows names none of them

- **GIVEN** a bulk write that changes more rows than the answer's header holds
- **WHEN** the write succeeds
- **THEN** the answer names no row
- **AND** the rows the write changed reach their readers through the topics the write publishes

### Requirement: A tombstone is purged once it is older than seven days

The nightly purge SHALL remove each tombstone whose deletion is older than seven days, and SHALL keep a tombstone inside that window.

#### Scenario: A tombstone older than seven days is purged

- **GIVEN** a tombstone whose deletion is eight days old
- **WHEN** the nightly purge runs
- **THEN** the tombstone is removed

#### Scenario: A tombstone inside seven days is kept

- **GIVEN** a tombstone whose deletion is two days old
- **WHEN** the nightly purge runs
- **THEN** the tombstone is kept
