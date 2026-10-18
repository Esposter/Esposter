## Purpose

Per-user blob-storage quotas (Free = 10 GiB) held atomically at SAS issuance, charged by Storage's own BlobCreated event for client uploads and at write time for the server's own, with a usage meter in the resource explorer's header.

## Requirements

### Requirement: Each user's allowance is set by their storage tier

Each user SHALL have a storage allowance set by their tier, and the Free tier allowance SHALL be 10 GiB.

#### Scenario: Free user opens the meter

- **GIVEN** a user is on the Free tier
- **WHEN** the user views the storage meter
- **THEN** the allowance shown is 10 GB

### Requirement: An upload is refused when it would exceed the allowance

An upload SHALL be refused before any upload begins when storing it would take the owner over their allowance.

#### Scenario: Upload that does not fit

- **GIVEN** the owner has 9.9 GB stored of a 10 GB allowance
- **WHEN** the owner uploads a 1 GB file
- **THEN** the upload is refused
- **AND** the owner is told they have run out of storage

### Requirement: Simultaneous uploads cannot together exceed the allowance

Uploads started at the same time SHALL NOT together take the owner over their allowance.

#### Scenario: Many uploads at once

- **GIVEN** the owner has little allowance left
- **WHEN** the owner starts many uploads at the same moment
- **THEN** only the uploads that fit within the allowance are approved

### Requirement: A declared upload counts from approval until its real size is known

An upload's declared size SHALL count against the allowance from the moment the upload is approved until its real size is recorded.

#### Scenario: Upload approved but not yet completed

- **GIVEN** an upload of 500 MB was approved
- **WHEN** the owner checks their storage meter before the file finishes
- **THEN** the 500 MB counts against the allowance

### Requirement: A completed upload is charged its actual stored size

A completed upload SHALL be charged its actual stored size, which replaces its declared size in the allowance.

#### Scenario: Declared size was too small

- **GIVEN** an upload was declared as 1 MB but the stored file is 1 GB
- **WHEN** the upload completes
- **THEN** the owner is charged 1 GB

#### Scenario: Next upload after under-declaring

- **GIVEN** the owner under-declared an upload and it has now been charged in full
- **WHEN** the owner starts another upload that would exceed the allowance
- **THEN** that upload is refused

### Requirement: An abandoned upload stops counting once its approval expires

An approved upload that is never completed SHALL stop counting against the allowance once its approval expires.

#### Scenario: Owner abandons an upload

- **GIVEN** an upload was approved and never completed
- **WHEN** its approval expires
- **THEN** it no longer counts against the owner's allowance

### Requirement: Files the server writes are charged without being refused

Content and files the server writes SHALL be charged to the owner, and a save SHALL NOT be refused for being over the allowance.

#### Scenario: Save while over the allowance

- **GIVEN** the owner is over their allowance
- **WHEN** the owner saves a document
- **THEN** the save succeeds
- **AND** the next upload is refused

### Requirement: A repeated completion notice changes the allowance once

A repeated completion notice for the same upload SHALL NOT change the allowance again.

#### Scenario: Completion notice arrives twice

- **GIVEN** an upload's completion notice has already been applied
- **WHEN** the same notice arrives again
- **THEN** the owner's allowance does not change

### Requirement: Out-of-order completion notices settle on the latest write

When completion notices for the same file arrive out of order, the allowance SHALL reflect the most recent write.

#### Scenario: Older notice arrives last

- **GIVEN** a file was written twice in quick succession
- **WHEN** the notice for the first write arrives after the notice for the second
- **THEN** the allowance reflects the size of the second write

### Requirement: Deleting stored files gives their bytes back

Deleting a stored file SHALL give its bytes back to the owner's allowance.

#### Scenario: Owner deletes a file

- **GIVEN** the owner has a stored file of 200 MB
- **WHEN** the owner deletes it
- **THEN** the allowance is reduced by 200 MB

#### Scenario: Purging a resource

- **GIVEN** a resource has stored files
- **WHEN** the owner purges the resource
- **THEN** all of its bytes are given back to the allowance

### Requirement: An expired revision keeps counting until a later save or purge removes it

A revision past its retention period SHALL keep counting against the allowance until a later save removes it or the resource is purged.

#### Scenario: Resource nobody edits

- **GIVEN** a resource has revisions older than their retention period
- **WHEN** the owner views the storage meter
- **THEN** those revisions still count against the allowance

### Requirement: Stored bytes whose completion notice is lost stay uncharged

Bytes whose completion notice is lost SHALL stay uncharged until the usage is recounted, and nothing SHALL retry them automatically.

#### Scenario: Completion notice is lost

- **GIVEN** an upload completed but its completion notice was lost
- **WHEN** the owner views the storage meter
- **THEN** the upload is not counted

### Requirement: Room attachments and game saves are not counted

Room attachments, avatars, room images and game save files SHALL NOT count against the storage allowance.

#### Scenario: Room attachment uploaded

- **GIVEN** a user uploads a file to a room
- **WHEN** the upload completes
- **THEN** the user's storage allowance does not change

### Requirement: Existing users start with no counted usage

Existing users SHALL start with zero counted usage, and files uploaded before counting began SHALL NOT be counted.

#### Scenario: Existing user with old files

- **GIVEN** a user has files uploaded before counting began
- **WHEN** the user views the storage meter
- **THEN** those files are not counted

### Requirement: A change of tier changes the allowance at once

A change of a user's tier SHALL change their allowance at once.

#### Scenario: Owner moves to a new tier

- **GIVEN** the owner's tier allowance changes
- **WHEN** the owner views the storage meter
- **THEN** the new allowance is shown

### Requirement: The usage meter appears on every resource page

The usage meter SHALL appear on every resource page and show the amount used, the allowance and the plan.

#### Scenario: Owner opens a resource page

- **GIVEN** the owner has used some of their allowance
- **WHEN** the owner opens any resource page
- **THEN** the meter shows the amount used, the allowance and the plan

### Requirement: The usage meter updates without a reload

The usage meter SHALL update without reloading the page when the owner's usage changes.

#### Scenario: Deleting a file while the meter is open

- **GIVEN** the meter is shown on a resource page
- **WHEN** the owner deletes a stored file in another tab
- **THEN** the meter shows the lower usage without a reload
