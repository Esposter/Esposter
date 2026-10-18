## Purpose

IndexedDB mirror of Pinia state — generic pagination cache composables with per-feature thin wrappers. The browser keeps a copy of what the reader last loaded, so a room can be read offline, and the copy never replaces what is already on screen.

## Requirements

### Requirement: Offline, a room shows the messages it last loaded

While offline, the app SHALL show the messages cached for the room the reader opens, up to the cache limit.

#### Scenario: a reader opens a room while offline

- **GIVEN** a room the reader loaded in an earlier online session
- **WHEN** the reader opens that room while offline
- **THEN** the cached messages for that room are shown
- **AND** no more than the cache limit of messages is shown

#### Scenario: a reader switches rooms while offline

- **GIVEN** two rooms each with cached messages
- **WHEN** the reader switches from one room to the other while offline
- **THEN** the messages shown are those cached for the room now open

### Requirement: Cached content never replaces what is already loaded

Restoring from the cache SHALL NOT replace messages the session has already loaded for that room.

#### Scenario: the reader returns to a room whose messages are already loaded

- **GIVEN** a room whose messages are loaded in this session
- **WHEN** the reader navigates away and back while offline
- **THEN** the loaded messages stay on screen
- **AND** the cached page does not replace them

### Requirement: A room that loads empty clears its cached messages

A room that loads with no messages SHALL NOT keep messages cached from an earlier session.

#### Scenario: a room's messages were deleted since the last session

- **GIVEN** a room with messages cached from an earlier session
- **WHEN** the reader opens the room online and it has no messages
- **THEN** the cached messages for that room are removed
- **AND** the room shows no messages offline later

### Requirement: Cached data is kept separately for each room and each user

Cached messages, members and rooms SHALL be kept apart by the room or user they belong to.

#### Scenario: a second user signs in on the same browser

- **GIVEN** a browser where one user's room list is cached
- **WHEN** a different user signs in and reads their rooms offline
- **THEN** the first user's rooms are not shown

### Requirement: The browser refusing the cache does not disturb the reader

When the browser refuses a cache operation, the app SHALL keep working and SHALL NOT alert the reader.

#### Scenario: the browser's storage quota is full

- **GIVEN** a browser with its storage quota reached
- **WHEN** the app tries to write a room's messages to the cache
- **THEN** the write is logged
- **AND** the reader is shown no error and the room still loads online

### Requirement: A late cache read lands only in the room it was read for

A cache read that finishes after the reader has moved to another room SHALL NOT appear in the room now open.

#### Scenario: the reader leaves a room before its cache finishes restoring

- **GIVEN** a reader who opened a room while offline
- **WHEN** the reader switches to another room before the first room's cache finishes restoring
- **THEN** the restored messages are kept under the room they were read for
- **AND** the room now open shows its own messages only
