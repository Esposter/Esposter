## Purpose

Cloudflare service ownership: where each kind of data is kept, how live updates reach open screens, how background work runs, and how delayed work is scheduled.

## Requirements

### Requirement: Relational data and room-local message streams use different stores

Relational and queryable data SHALL be kept in the relational database, and high-volume time-ordered message data SHALL be kept in the object of the one room it belongs to.

#### Scenario: A relational feature is stored in the relational database

- **WHEN** a new feature holds relational or queryable data
- **THEN** its data is kept in the relational database

#### Scenario: A room's messages are stored in the room's own object

- **WHEN** a message is sent to a room
- **THEN** the message, its reactions and its search entry are kept in that room's object

### Requirement: Each kind of stored file is kept in the bucket that owns its kind

Every kind of stored file SHALL be kept in the bucket that owns its kind, so that one bucket's lifecycle rules never apply to another's content.

#### Scenario: Older attachments move to a cheaper storage class

- **GIVEN** a message attachment stored in its bucket
- **WHEN** thirty days have passed since it was written
- **THEN** it moves to the infrequent-access storage class

#### Scenario: A job that keeps failing is held for inspection

- **GIVEN** a queued job whose handler throws on every retry
- **WHEN** its retry count is spent
- **THEN** the message is kept in the job's dead-letter queue

### Requirement: Searchable at once

A newly sent message SHALL be searchable as soon as it is sent, and a deleted message SHALL NOT appear in search.

#### Scenario: A new message is searchable at once

- **WHEN** a message is sent
- **THEN** a search of the room finds it before the send returns

#### Scenario: A deleted message is excluded from search

- **GIVEN** a message that has been deleted
- **WHEN** a person searches the room
- **THEN** the deleted message does not appear

### Requirement: Background work runs after the request, never inside it

Work that need not block a request SHALL run as a queued job, and a request SHALL NOT wait for that work to be delivered.

#### Scenario: A posted message is answered before its notification is delivered

- **WHEN** a person posts a message
- **THEN** the response returns before any notification is delivered

#### Scenario: A failed delivery retries without the request

- **GIVEN** a notification whose delivery failed
- **WHEN** the queue retries it
- **THEN** the retry happens without the original request being open

### Requirement: Delayed work runs at its scheduled time

Work that must run at a future time SHALL be run by an alarm on the object that owns it, at that time.

#### Scenario: A scheduled message is delivered at its run time

- **GIVEN** a message scheduled for a future time
- **WHEN** that time arrives
- **THEN** the message is delivered

#### Scenario: A TodoList reminder fires at its due time

- **GIVEN** a TodoList item with a due time
- **WHEN** the due time arrives
- **THEN** the reminder is sent

### Requirement: Storage usage reflects the real size of an upload

The storage usage record SHALL reflect the real stored size of an upload once the upload lands, rather than the size the client declared.

#### Scenario: A declared size is corrected to the stored size

- **GIVEN** a client declared a size for an upload
- **WHEN** the upload lands in its bucket
- **THEN** the usage record is corrected to the stored object's real size

### Requirement: Changes reach open screens through the object that holds the state

Changes made by a request SHALL reach open screens through the object that owns the state changed, and changes made by background work SHALL reach them by calling that same object.

#### Scenario: A message created by a request reaches the room's viewers

- **WHEN** a request creates a message
- **THEN** every socket viewing that room receives it

#### Scenario: A message from an inbound webhook reaches the room's viewers

- **GIVEN** a message delivered by an inbound webhook
- **WHEN** the background job that processes it calls the room's object
- **THEN** every socket viewing that room receives it

#### Scenario: A participant's join keeps non-participants consistent

- **WHEN** RealtimeKit reports a participant joining a call
- **THEN** the call's sockets see the same call state
