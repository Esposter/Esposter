## ADDED Requirements

### Requirement: A document loads through the consumer's renderer

The package SHALL load every document through the renderer module the consumer passes, importing no renderer of its own.

#### Scenario: Loading through a legacy renderer build

- **GIVEN** a consumer that passes the renderer's legacy build
- **WHEN** a document is loaded
- **THEN** the document comes from that build's loader

#### Scenario: The package's build holds no renderer

- **WHEN** the package is built
- **THEN** none of its output imports the renderer at runtime

### Requirement: A document loads from any source with its parameters

The package SHALL load a document from a URL, from bytes or from a file the reader picked, passing the consumer's loading parameters to the renderer as given.

#### Scenario: Opening a local file

- **GIVEN** a file the reader picked from their device
- **WHEN** it is loaded
- **THEN** the document's page count is the file's

#### Scenario: Loading parameters reach the renderer as given

- **GIVEN** loading parameters that turn range loading off
- **WHEN** a document is loaded from a URL
- **THEN** the renderer's loader receives those parameters with the URL

### Requirement: Loading reports its progress

The package SHALL report how much of a document has loaded, as it loads.

#### Scenario: Loading progress rises to the whole file

- **GIVEN** a document whose bytes arrive in several parts
- **WHEN** it loads
- **THEN** the progress rises with each part and ends at the file's size

### Requirement: A protected document asks for its password

The package SHALL ask for the password a protected document needs, and ask again after a wrong one.

#### Scenario: Opening with the right password

- **GIVEN** a document protected by a password
- **WHEN** the reader gives the right password
- **THEN** the document loads

#### Scenario: A wrong password asks again

- **GIVEN** a document protected by a password
- **WHEN** the reader gives a wrong password
- **THEN** the password is asked for again, marked as wrong
- **AND** no document is loaded

### Requirement: A failed load is a failure state

The package SHALL report a document that cannot load as a failure, releasing its load.

#### Scenario: A file that is not a PDF

- **GIVEN** a source holding bytes that are not a PDF
- **WHEN** it is loaded
- **THEN** a failure is reported
- **AND** no document is loaded

### Requirement: A superseded load leaves nothing behind

The package SHALL release a load whose source changed or whose consumer unmounted before it finished, reporting nothing from it.

#### Scenario: Changing the source mid-load

- **GIVEN** a document still loading
- **WHEN** the source changes to a second document
- **THEN** the first load is released
- **AND** the first load's failure, if it fails, is never reported

#### Scenario: Unmounting mid-load

- **GIVEN** a document still loading
- **WHEN** its consumer unmounts
- **THEN** the load is released and nothing is reported from it
