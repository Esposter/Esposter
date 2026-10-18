## Purpose

Private, append-only per-member notes visible only to moderators. Notes give moderators context for later decisions, and a correction is always a new note rather than an edit.

## Requirements

### Requirement: Notes about a member are visible only to moderators

A member's notes SHALL be readable only by members holding the kick members permission.

#### Scenario: a moderator opens a member's notes

- **GIVEN** a member with notes in the room and a moderator holding the kick members permission
- **WHEN** the moderator opens the notes for that member
- **THEN** the notes are listed

#### Scenario: an ordinary member asks for another member's notes

- **GIVEN** a member who does not hold the kick members permission
- **WHEN** the member asks for another member's notes
- **THEN** the request is refused

### Requirement: Notes are append-only

A moderator SHALL add notes but SHALL NOT edit or delete a note once it is added.

#### Scenario: a moderator corrects an earlier note

- **GIVEN** a note that a moderator now believes is wrong
- **WHEN** the moderator wants to correct it
- **THEN** the moderator adds a new note
- **AND** the earlier note remains as it was written

### Requirement: Notes are listed newest first in pages

The notes for a member SHALL be listed newest first, page by page.

#### Scenario: a moderator pages through a long history of notes

- **GIVEN** a member with more notes than fit on one page
- **WHEN** the moderator opens the notes and asks for the next page
- **THEN** the first page shows the newest notes
- **AND** the next page continues with older notes

### Requirement: The member menu shows how many notes exist

The Notes item in a member's actions SHALL show how many notes exist for that member once the count has loaded.

#### Scenario: a moderator opens a member's action menu

- **GIVEN** a member with three notes
- **WHEN** a moderator opens that member's action menu
- **THEN** the Notes item shows the count of three

### Requirement: A note may not exceed the maximum length

A note SHALL be refused when it is longer than the maximum note length.

#### Scenario: a moderator writes a note longer than the maximum

- **GIVEN** a moderator writing a note
- **WHEN** the note is longer than the maximum note length
- **THEN** the note is refused and nothing is added

### Requirement: Deleting a room deletes its notes

Deleting a room SHALL remove every note written in that room.

#### Scenario: a room owner deletes the room

- **GIVEN** a room with moderator notes about its members
- **WHEN** the owner deletes the room
- **THEN** none of those notes can be read anymore
