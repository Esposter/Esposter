## Purpose

Every cross-resource reference a resource's content holds, indexed in one table by the role the target plays — declared once at the schema field that holds it, read off the content schemas, and kept in step with the content by the save that writes it.

## Requirements

### Requirement: A reference field declares its role where it is defined

Every field that holds another resource's identifier SHALL declare the role the target plays, and every declared reference SHALL be indexed without any separate list being kept.

#### Scenario: A new reference field is added to a resource type

- **GIVEN** a resource type gains a field that holds another resource's identifier
- **WHEN** a resource of that type is saved with the field set
- **THEN** the reference is indexed with its declared role
- **AND** no other list is edited

### Requirement: An empty reference is no reference

An empty reference field SHALL count as holding no reference, and SHALL NOT be stored in the index.

#### Scenario: A program is saved with no survey chosen

- **GIVEN** a program is saved with its survey field empty
- **WHEN** the save lands
- **THEN** the program holds no survey reference

### Requirement: The index reflects the saved content after every save that lands

After a save lands, the index SHALL list exactly the references in the saved content, and a save that changes no reference SHALL write nothing to the index.

#### Scenario: A save removes a reference

- **GIVEN** a resource holds a reference to another resource
- **WHEN** a save removes that reference and lands
- **THEN** the index no longer lists the reference

#### Scenario: An autosave changes no reference

- **GIVEN** a resource's references are already indexed
- **WHEN** an autosave lands with the same references
- **THEN** the index is not written

### Requirement: A partly failed save leaves no references rather than stale ones

When a save fails partway, the index SHALL be left with no references for that resource rather than with references the content no longer backs.

#### Scenario: A save fails after its content was stored

- **GIVEN** a save stored its content and then failed to write the index
- **WHEN** a participant presents a token the program issued
- **THEN** the token is refused until the next save that lands

### Requirement: Two saves racing keep the newer save's references

When two saves of one resource race, the references SHALL be those of the save that committed last.

#### Scenario: Two saves land at once

- **GIVEN** two saves of one resource run at the same time
- **WHEN** both finish
- **THEN** the index holds the references of the save that committed last

### Requirement: A reference to a deleted resource fails soft

A reference to a deleted resource SHALL NOT break the resource that holds it, and a soft-deleted resource SHALL keep the references it holds until it is purged.

#### Scenario: A survey that a program refers to is deleted

- **GIVEN** a program refers to a survey
- **WHEN** the survey is deleted
- **THEN** the program still opens
- **AND** the reference shows as missing

#### Scenario: A program is moved to the recycle bin

- **GIVEN** a program has issued participant tokens
- **WHEN** the program is moved to the recycle bin
- **THEN** the tokens it issued are still accepted

### Requirement: A participant token is accepted only from a linked program

An identified survey SHALL accept a participant token only when a program bound to that survey issued it.

#### Scenario: A participant submits a token from a bound program

- **GIVEN** a program is bound to an identified survey and issued a token
- **WHEN** a participant submits the token with a response
- **THEN** the response is accepted

#### Scenario: A participant submits a token from an unbound program

- **GIVEN** a token was issued by a program not bound to the survey
- **WHEN** a participant submits the token with a response
- **THEN** the response is refused

### Requirement: Deleting a resource warns its owner of resources that link to it

Before a resource is deleted, its owner SHALL be shown the owner's live resources that reference it.

#### Scenario: The owner deletes a survey that a program refers to

- **GIVEN** a live program refers to a survey
- **WHEN** the owner asks to delete the survey
- **THEN** the owner is shown the program as a resource that refers to it

### Requirement: A blueprint template holds no links of its own

A blueprint template SHALL NOT be indexed as a resource that refers to others, and each resource created from it SHALL index its own references.

#### Scenario: A blueprint is deployed

- **GIVEN** a blueprint is deployed
- **WHEN** each resource it creates is saved
- **THEN** each created resource indexes its own references
- **AND** the blueprint itself is not indexed
