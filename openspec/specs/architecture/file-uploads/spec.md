## Purpose

The two-step Azure Blob SAS upload pattern, the upload procedure inventory, and the staged path that commits a resource document too large for one request body by reference.

## Requirements

### Requirement: A binary upload goes straight to storage

A binary upload SHALL move from the browser directly to object storage through a short-lived signed address, and SHALL NOT pass through the request that carries the rest of the input.

#### Scenario: A member uploads a file to a message

- **GIVEN** a member of a room
- **WHEN** the member sends a file in a message
- **THEN** the file is stored in the room's attachment storage
- **AND** the message refers to the stored file

#### Scenario: Storage refuses an expired address

- **GIVEN** a signed address that has expired
- **WHEN** the browser uploads a file to it
- **THEN** the upload fails with a visible error
- **AND** nothing is reported as saved

### Requirement: A signed address is issued only to someone allowed to write there

The server SHALL issue an upload address only to a user who may write to the place the upload would land.

#### Scenario: A non-member asks for an attachment address

- **GIVEN** a user who is not a member of the room
- **WHEN** the user asks for an attachment upload address
- **THEN** the request is refused

#### Scenario: A resource owner uploads a file to a resource

- **GIVEN** the owner of a resource
- **WHEN** the owner asks for an upload address for a file of that resource
- **THEN** an address is issued scoped to that resource

### Requirement: A declared file size bounds only an honest client

The size of an upload SHALL be checked against its limit only as the client declares it, because storage does not limit the bytes written.

#### Scenario: A file over the room's maximum

- **GIVEN** a room with a maximum file size
- **WHEN** a member asks for an address for a file larger than that maximum
- **THEN** the request is refused

#### Scenario: A client declares a small size and uploads a larger file

- **GIVEN** a client that declares a small file size
- **WHEN** it uploads a larger file before its address expires
- **THEN** the upload succeeds
- **AND** the recorded size is the declared size

### Requirement: A batch of files is accepted or rejected as a whole

A batch of files SHALL be accepted or rejected as a whole, and the alert SHALL name the first invalid file.

#### Scenario: One invalid file in a multi-file drop

- **GIVEN** a drop of several files
- **WHEN** one of them fails validation
- **THEN** none of the files is kept
- **AND** the alert names the invalid file

### Requirement: A download keeps its uploaded name and a trusted type

A downloaded file SHALL keep the name it was uploaded under, and a read SHALL report the type the server recorded rather than the type the client claimed.

#### Scenario: Downloading an attachment

- **GIVEN** an attachment uploaded under a name
- **WHEN** a member downloads it
- **THEN** the downloaded file has the uploaded name

#### Scenario: Reading a stored attachment

- **GIVEN** an attachment with a recorded type
- **WHEN** it is read
- **THEN** the recorded type is reported whatever type the upload declared

### Requirement: Cleanup never removes an upload that may still be in flight

Removing superseded uploads SHALL keep every upload young enough to still be in flight.

#### Scenario: A second editor's upload not yet saved

- **GIVEN** a file uploaded seconds ago that its editor has not yet saved
- **WHEN** an older file of the same entity is cleaned up
- **THEN** the recent file is kept

#### Scenario: An abandoned old upload

- **GIVEN** an upload older than an address's lifetime that no entity refers to
- **WHEN** cleanup runs
- **THEN** the upload is removed

### Requirement: An open room's attachments stay downloadable

A message attachment's download address SHALL be renewed before it expires while its room stays open.

#### Scenario: A room left open past an address lifetime

- **GIVEN** a room with attachments left open for longer than one address lasts
- **WHEN** the renewal interval passes
- **THEN** the attachments receive fresh addresses
- **AND** downloads keep working

#### Scenario: A removed member's renewal is refused

- **GIVEN** a user removed from a room whose page is still open
- **WHEN** the background renewal is refused
- **THEN** the page raises no alert
- **AND** the page does not navigate away

### Requirement: A large resource save is staged and verified before it is committed

A resource save too large for one request SHALL be staged in storage and committed only when the stored content matches its hash and size.

#### Scenario: A large save within the content limit

- **GIVEN** a document whose save exceeds one request but stays under the content limit
- **WHEN** the save is made
- **THEN** the content is staged and committed by reference

#### Scenario: A document over the content limit

- **GIVEN** a document larger than the content limit
- **WHEN** the user saves it
- **THEN** the save is refused with a notice
- **AND** nothing is sent

#### Scenario: Staged content that does not match its hash

- **GIVEN** a staged document whose hash differs from the one the client sent
- **WHEN** the commit is attempted
- **THEN** the commit is rejected
- **AND** the document's version is unchanged

#### Scenario: Staged content overwritten by another device

- **GIVEN** two devices saving the same large resource
- **WHEN** the second device's staged content is overwritten before its commit reads it
- **THEN** the commit is rejected

#### Scenario: A committed save whose staged copy cannot be deleted

- **GIVEN** a large save that has been committed
- **WHEN** the staged copy cannot be deleted
- **THEN** the save stands
- **AND** the failure is logged
