## Purpose

One cached-read primitive owns read-once-per-session, and a write invalidates it by naming a tag rather than the caches that hold it.

## Requirements

### Requirement: A shared read is fetched once per session

A read that many surfaces share SHALL be fetched from the server once and served from memory for the rest of the session.

#### Scenario: A second mount does not ask the server again

- **GIVEN** a shared read that has already loaded
- **WHEN** another surface mounts and asks for it
- **THEN** no request is sent and the loaded value is shown

#### Scenario: Concurrent first mounts share one request

- **GIVEN** two surfaces mount before the shared read has loaded
- **WHEN** both ask for it
- **THEN** one request is sent and both surfaces receive its answer

### Requirement: A failed read is not cached

A read that fails SHALL leave nothing cached, so that the next mount or the surface's own retry fetches it again.

#### Scenario: A retry after a failure fetches again

- **GIVEN** a shared read that failed
- **WHEN** the surface's retry is used
- **THEN** the read is sent again

#### Scenario: A failure does not leave the surface empty for the session

- **GIVEN** a shared read that failed on first load
- **WHEN** the next surface mounts
- **THEN** the read is sent again rather than shown as empty

### Requirement: A write invalidates the caches that depend on what it changed

A write SHALL declare what it changed, and only the shared reads that depend on that change SHALL be invalidated.

#### Scenario: A deletion invalidates the favourites and recents

- **GIVEN** the favourites and recents are loaded
- **WHEN** a resource is deleted
- **THEN** both are invalidated

#### Scenario: A recorded visit invalidates only the recency order

- **GIVEN** the recents are loaded
- **WHEN** a visit is recorded
- **THEN** the recents are invalidated and the favourites are not

### Requirement: Invalidation happens only after a write has persisted

A write SHALL invalidate shared reads only after it has persisted, so that a rejected or rolled-back write invalidates nothing.

#### Scenario: A rejected write invalidates nothing

- **GIVEN** a write that the server rejects
- **WHEN** the write fails
- **THEN** no shared read is invalidated

#### Scenario: A partly persisted delete still invalidates

- **GIVEN** a delete sent in chunks where an earlier chunk persisted before a later one failed
- **WHEN** the failure is reported
- **THEN** the shared reads are invalidated because part of the write did persist

### Requirement: A capped list changed by a delete is re-read, not edited

A capped list that a delete changes SHALL be re-read from the server rather than edited locally, because only the server knows the item that refills it.

#### Scenario: A deleted recent is replaced by the next item from the server

- **GIVEN** a recents list capped at its limit
- **WHEN** one of its resources is deleted
- **THEN** the list is re-read and shows the next resource from the server

#### Scenario: Starring keeps the favourites list edited in place

- **GIVEN** a favourites list capped at its limit
- **WHEN** a resource is starred
- **THEN** the star shows at once and the list is not re-read

### Requirement: Each shared read declares whether it re-reads when invalidated

Each shared read SHALL declare whether it re-reads at once when invalidated, and a read with no surface showing it SHALL wait until its next use.

#### Scenario: Favourites re-read at once for the table that deleted them

- **GIVEN** stars rendered in the table a delete was issued from
- **WHEN** the favourites are invalidated
- **THEN** the favourites are re-read at once

#### Scenario: Recents wait until they are next shown

- **GIVEN** the recents are invalidated while no surface shows them
- **WHEN** the next surface shows them
- **THEN** they are read then

### Requirement: A shared read with no tag has a stated reason no write changes it

A shared read with no tag SHALL have a recorded reason that no write can change its value.

#### Scenario: A storage total without a tag updates when the upload lands

- **GIVEN** the storage total is shown
- **WHEN** an upload finishes
- **THEN** the total is updated by the upload's own event, not by a write's invalidation

#### Scenario: A read with no tag and no reason is rejected in review

- **WHEN** a review finds a shared read with no tag and no recorded reason
- **THEN** the review asks for the tag or the reason

### Requirement: A keyed shared read keeps each key's entries independent

A shared read keyed by an entity SHALL keep each key's entries independent, so that one key loading does not change another key's entries.

#### Scenario: One room loading does not affect another room

- **GIVEN** the thread-follow state of one room is loaded
- **WHEN** another room's state is loaded
- **THEN** the first room's state is unchanged
