## Purpose

Azure service ownership, the storage split, event flows, and the real-time layer model.

## Requirements

### Requirement: Relational data and message-like streams use different stores

Relational and queryable data SHALL be kept in the relational database, and high-volume time-ordered message-like data SHALL be kept in the append-only table store.

#### Scenario: A relational feature is stored in the relational database

- **WHEN** a new feature holds relational or queryable data
- **THEN** its data is kept in the relational database

#### Scenario: A message-like stream is stored in the table store

- **WHEN** a new feature holds high-volume time-ordered data with no joins
- **THEN** its data is kept in the append-only table store keyed by its owning entity

### Requirement: Each kind of stored file is kept in the container that owns its kind

Every kind of stored file SHALL be kept in the blob container that owns its kind, so that one container's lifecycle rules never apply to another's content.

#### Scenario: Older attachments move to cheaper tiers

- **GIVEN** a message attachment stored in the blob store
- **WHEN** it has not been read for thirty days
- **THEN** it moves to a cooler tier, and after ninety days to the coldest tier

#### Scenario: Dead-lettered events are kept for thirty days

- **GIVEN** an event that could not be delivered
- **WHEN** thirty days have passed
- **THEN** the event is removed by the container's lifecycle rule

### Requirement: Sent messages become searchable within the indexer schedule

A newly sent message SHALL become searchable within the search index's refresh interval rather than at once, and soft-deleted messages SHALL NOT appear in search.

#### Scenario: A new message is searchable after the refresh interval

- **WHEN** a message is sent
- **THEN** it appears in search within five minutes

#### Scenario: A deleted message is excluded from search

- **GIVEN** a message that has been soft deleted
- **WHEN** a person searches the room
- **THEN** the deleted message does not appear

### Requirement: Background work runs after the request, never inside it

Work that need not block a request SHALL run in background functions triggered by events, and a request SHALL NOT wait for that work to be delivered.

#### Scenario: A posted message is answered before its notification is delivered

- **WHEN** a person posts a message
- **THEN** the response returns before any notification is delivered

#### Scenario: A background delivery retries without the request

- **GIVEN** a notification whose delivery failed
- **WHEN** the background function retries it
- **THEN** the retry happens without the original request being open

### Requirement: Delayed work runs at its scheduled time

Work that must run at a future time SHALL be scheduled to run at that time.

#### Scenario: A scheduled message is delivered at its run time

- **GIVEN** a message scheduled for a future time
- **WHEN** that time arrives
- **THEN** the message is delivered

#### Scenario: A todo reminder fires at its due time

- **GIVEN** a todo with a due time
- **WHEN** the due time arrives
- **THEN** the reminder is sent

### Requirement: Storage usage reflects the real size of an upload

The storage usage record SHALL reflect the real stored size of an upload once the upload lands, rather than the size the client declared.

#### Scenario: A declared size is corrected to the stored size

- **GIVEN** a client declared a size for an upload
- **WHEN** the upload lands in storage
- **THEN** the usage record is corrected to the stored object's real size

### Requirement: Changes reach open screens through the layer that made them

Changes made by a request SHALL reach open screens in-process, and changes made by background work SHALL reach them through the shared real-time hub.

#### Scenario: A message created by a request reaches subscribers on the same server

- **WHEN** a request creates a message
- **THEN** the subscribers on that server receive it

#### Scenario: A message from an inbound webhook reaches every server through the hub

- **GIVEN** a message delivered by an inbound webhook
- **WHEN** the background function publishes it
- **THEN** subscribers on every server receive it through the hub

#### Scenario: A participant's join keeps non-participants consistent

- **WHEN** the media server reports a participant joining a call
- **THEN** the non-participants and the subscriptions see the same call state
