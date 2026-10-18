## Purpose

zstd is the codec for every format this repo owns; a format someone else wrote or will read keeps its counterparty's codec.

## Requirements

### Requirement: Bytes this repository owns use one shared codec

Every byte format this repository owns SHALL be stored with the one shared modern codec, chosen once rather than per call site.

#### Scenario: A new stored format uses the shared codec

- **GIVEN** a new feature stores bytes that only this repository reads
- **WHEN** the feature is written
- **THEN** it stores those bytes with the shared codec

#### Scenario: A different codec for owned bytes is sent back in review

- **GIVEN** a change stores bytes this repository owns with a different codec
- **WHEN** the change is reviewed
- **THEN** the review asks for the shared codec instead

### Requirement: Formats that other parties read or write keep their codec

A format that another party writes or reads SHALL keep the codec that party's specification names.

#### Scenario: A map editor's file is read with its own codec

- **GIVEN** a map file was written by a map editor
- **WHEN** the app reads the file
- **THEN** the codec the editor's specification names decodes it

#### Scenario: A personalized export is a standard archive

- **GIVEN** a reader downloads a personalized email export
- **WHEN** the download completes
- **THEN** the file is a standard archive the reader's file manager opens

#### Scenario: A staged save uploads with a codec the browser can produce

- **GIVEN** a reader's browser stages a large save for upload
- **WHEN** the browser uploads it
- **THEN** the upload uses a codec the browser can produce

### Requirement: Retained versions are stored as edits from their predecessor

A retained version of a document SHALL be stored as the edit from the version before it, so a small change costs a small fraction of a full copy.

#### Scenario: A small edit costs a small fraction of a full copy

- **GIVEN** a document has an earlier retained version
- **WHEN** the reader makes a small edit and it is retained
- **THEN** the stored version is a small fraction of the size of a full copy of the document

#### Scenario: A retained edit reads back exactly

- **GIVEN** a retained version is stored as an edit
- **WHEN** the reader opens that version
- **THEN** it shows exactly the content saved at that time

### Requirement: A stored document carries the settings it was written with

A stored document SHALL carry the compression settings it was written with, so a later change to those settings cannot make it unreadable.

#### Scenario: A later release does not break an older document

- **GIVEN** a document was stored under earlier compression settings
- **WHEN** a later release changes the compression setting and the document is read
- **THEN** the document reads in full

### Requirement: Browser bundles carry no server-only compression

A package built for the browser SHALL NOT include a server-only compression facility, and its build SHALL fail when it reaches for one.

#### Scenario: A browser package that reaches for a server facility fails its build

- **GIVEN** a package is built for the browser
- **WHEN** it imports a server-only compression facility
- **THEN** its build fails

#### Scenario: A server package compresses on the server

- **GIVEN** a package compresses bytes on the server
- **WHEN** it is built
- **THEN** it builds as a server package

### Requirement: Built assets are served compressed and rendered pages are not

Built assets SHALL be served pre-compressed with a codec the browser accepts, and server-rendered pages SHALL be sent uncompressed.

#### Scenario: A browser that accepts the pre-compressed codec gets the compressed asset

- **GIVEN** a browser accepts the pre-compressed codec
- **WHEN** it requests a build asset
- **THEN** it receives the pre-compressed copy

#### Scenario: A browser that does not accept it gets the plain asset

- **GIVEN** a browser does not accept the pre-compressed codec
- **WHEN** it requests a build asset
- **THEN** it receives the plain asset

#### Scenario: A rendered page is sent uncompressed

- **GIVEN** a reader loads a server-rendered page
- **WHEN** the page is sent
- **THEN** the page's HTML is sent uncompressed
