## Purpose

Why a resource content blob's JSON key order is load-bearing for its version address, and why the repo settles on no canonicalization step.

## Requirements

### Requirement: Unchanged content is stored once

Saved resource content SHALL serialize to the same bytes each time the content is unchanged, so that saving unchanged content stores nothing new.

#### Scenario: Saving content that has not changed

- **GIVEN** resource content that is already stored as a version
- **WHEN** the same content is saved again
- **THEN** no new version is stored

### Requirement: Content is not re-sorted before saving

The repository SHALL NOT sort the keys of saved content, unless a second producer of those bytes ever appears.

#### Scenario: A content schema changes its field order

- **GIVEN** a content schema whose field order changes in a deploy
- **WHEN** the next save of each history is made
- **THEN** that save stores one full copy under the new order
- **AND** later saves store only changes again
- **AND** every stored version still reads back as the content it was

#### Scenario: A proposal to sort keys before saving

- **GIVEN** a change that adds a step sorting every key of every saved document
- **WHEN** the change is reviewed
- **THEN** it is rejected because the repository has one producer of these bytes
