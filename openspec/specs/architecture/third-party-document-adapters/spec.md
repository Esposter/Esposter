## Purpose

A library that holds the live document must be handed a replacement, because a copy it keeps is not a stale view but a write-back that lands as the owner's own edit.

## Requirements

### Requirement: An open editor adopts restored content before its next save

When a restore replaces a resource's content, every open editor that holds its own copy of the document SHALL adopt the restored content before its next save.

#### Scenario: Restoring an older version under an open note

- **GIVEN** a note open in an editor that holds its own copy of the document
- **WHEN** the reader restores an older version of the note
- **THEN** the editor shows the restored text
- **AND** the next save stores the restored text rather than the text from before the restore

#### Scenario: An editor that does not adopt the restore

- **GIVEN** an editor that holds its own copy of the document and does not adopt restored content
- **WHEN** the reader restores an older version and the editor then saves
- **THEN** the save writes the pre-restore document back, undoing the restore without any notice

### Requirement: Restored content is re-read from storage before any editor adopts it

Restored content SHALL be re-read from storage before any open editor adopts it.

#### Scenario: A restore completes

- **GIVEN** a restore that has just written new content
- **WHEN** the restore finishes
- **THEN** the stored content is re-read first
- **AND** only then are open editors given the re-read content

### Requirement: An editor's adoption ends when the editor closes

An editor's adoption SHALL end when the editor closes, so that no closed editor receives a later restore.

#### Scenario: Closing a note and opening another

- **GIVEN** a note open in an editor that has adopted restores
- **WHEN** the reader closes the note and opens another
- **THEN** a later restore does not reach the closed editor

### Requirement: An editor takes restored content through its own replace call

An editor SHALL take the restored document through its own replace call rather than being rebuilt from scratch.

#### Scenario: A restore lands in an open editor

- **GIVEN** an open editor that can replace its document through its own call
- **WHEN** a restore lands
- **THEN** the editor is not remounted
- **AND** the document is replaced through its own call

### Requirement: Editors that render from stored content need no adoption

An editor that renders the stored content on every change SHALL NOT need to adopt restored content, because replacing the stored content already changes what is on screen.

#### Scenario: A content type rendered from stored content

- **GIVEN** a content type whose editor renders directly from the stored content
- **WHEN** a restore replaces the stored content
- **THEN** the editor shows the restored content without any adoption step
