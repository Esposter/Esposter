## Purpose

A document crosses the server only while one request body carries it and only where the server has to interpret it — anything larger moves between the browser and Blob Storage through a signed url, an edit to it crosses as a delta, and a write that changes nothing stores no new bytes.

## Requirements

### Requirement: A document crosses the server only within one request body

A document SHALL cross the server in a request body only while that body is under the request size limit, and anything larger SHALL move directly between the browser and storage.

#### Scenario: A small document is saved

- **GIVEN** a document whose save body is under the request size limit
- **WHEN** the document is saved
- **THEN** the save is sent inline in the request

#### Scenario: A large document is read

- **GIVEN** a document whose stored size is over the request size limit
- **WHEN** the document is read
- **THEN** the browser downloads it directly from storage through a signed read address

### Requirement: A large save is sent as a delta or staged in storage

A save larger than the request size limit SHALL be sent as a delta against the stored bytes when a confirmed baseline exists, and otherwise SHALL be staged in storage.

#### Scenario: A large save with a confirmed baseline

- **GIVEN** a large document whose stored bytes the server has confirmed
- **WHEN** an edit is saved
- **THEN** the edit is sent as a delta against the stored bytes

#### Scenario: A large save without a confirmed baseline

- **GIVEN** a large document with no confirmed baseline
- **WHEN** it is saved
- **THEN** the whole document is staged in storage and committed by its hash

#### Scenario: A delta that does not apply

- **GIVEN** a large save sent as a delta
- **WHEN** the delta does not apply to the stored bytes
- **THEN** the whole document is staged in storage instead

### Requirement: A document is read inline when its size was never recorded

A document whose size was not recorded before the size field existed SHALL be read inline until its next save records the size.

#### Scenario: A row saved before its size was recorded

- **GIVEN** a document saved before its size was recorded
- **WHEN** it is read
- **THEN** it is read inline through the request
- **AND** the next save records its size

### Requirement: The server validates every document it stores

A document the server stores SHALL be parsed and validated by the server before it is written.

#### Scenario: A large document is saved

- **GIVEN** a large document saved by a staged or delta save
- **WHEN** the server receives it
- **THEN** the server parses and validates the whole document before writing it

#### Scenario: A document that fails validation

- **GIVEN** a document that fails validation
- **WHEN** it is saved
- **THEN** nothing is stored
- **AND** the save fails

### Requirement: Computed reads and live updates pass through the server

Reads that compute from a document and live updates to subscribed devices SHALL pass through the server, at any document size.

#### Scenario: A dashboard reads a document

- **GIVEN** a dashboard that computes from a document
- **WHEN** the dashboard loads
- **THEN** the server reads and computes the result

#### Scenario: A subscribed device receives a save from another device

- **GIVEN** a device subscribed to a document
- **WHEN** another device saves the document
- **THEN** the subscribed device receives the parsed document through the server

### Requirement: A write that changes nothing stores no new bytes

A write that changes no value SHALL store no new bytes, and a write that changes some values SHALL store only the changed values as new.

#### Scenario: A file identical to the stored one is imported

- **GIVEN** a stored sheet
- **WHEN** a file identical to its contents is imported
- **THEN** each row keeps its identity
- **AND** no new bytes are stored

#### Scenario: A changed file is imported

- **GIVEN** a stored sheet
- **WHEN** a changed file is imported
- **THEN** only the changed rows are stored as new

### Requirement: A new resource type inherits large-document transport

A new resource type SHALL get large-document transport by registering with the shared resource store, and SHALL keep the identities of its items stable across writes that change nothing.

#### Scenario: A new resource type is registered

- **GIVEN** a new resource type registered with the shared resource store
- **WHEN** its documents outgrow one request body
- **THEN** they are saved and read through the same transport without new transport code
