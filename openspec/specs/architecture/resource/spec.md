## Purpose

The standard for product persistence and surface — one Postgres table, one blob container, one procedure factory, opt-in capabilities.

## Requirements

### Requirement: Every product artifact is one identity record and one content document

Every product artifact SHALL be stored as one identity record and one content document, and every type SHALL share one set of operations for them.

#### Scenario: A resource of any type is created

- **GIVEN** a user creates a resource of any type
- **WHEN** the resource is created
- **THEN** it has one identity record and its content is written as one document
- **AND** it is listed with the other resources of its owner

### Requirement: A cross-cutting behaviour is available only to types that declare it

A cross-cutting behaviour such as publishing, dataset serving, file assets or import and export SHALL be offered for a resource type only when that type declares it.

#### Scenario: A type declares publishing

- **GIVEN** a resource type declares publishing
- **WHEN** its owner opens it
- **THEN** the publish operations are offered

#### Scenario: A type does not declare publishing

- **GIVEN** a resource type does not declare publishing
- **WHEN** a request is made for a publish operation on it
- **THEN** the request is answered as not found

### Requirement: Settings and data save together through one operation

A resource's settings and its data SHALL be saved together through one save operation that advances one content version.

#### Scenario: The owner edits settings and data in two panels

- **GIVEN** the owner has edited a resource's settings and its data
- **WHEN** the owner saves
- **THEN** one save stores both
- **AND** the content version advances once

### Requirement: A save based on an out-of-date version is refused

A content save SHALL be refused when it is based on an out-of-date content version, so that two saves can never silently lose one another's writes.

#### Scenario: Two devices save the same resource

- **GIVEN** two devices hold the same content version of a resource
- **WHEN** the first device saves and then the second saves its older copy
- **THEN** the second save is refused as stale

#### Scenario: A save fails to store its content

- **GIVEN** a save fails while storing its content
- **WHEN** the failure is reported
- **THEN** the content version is unchanged

### Requirement: Deletion is reversible until a purge

Deleting a resource SHALL hide it and stop its publication, and a deleted resource SHALL be restorable until it is purged.

#### Scenario: The owner deletes a published resource

- **GIVEN** a resource is published
- **WHEN** the owner deletes it
- **THEN** the resource is hidden
- **AND** its publication stops

#### Scenario: The owner restores a deleted resource

- **GIVEN** a resource was deleted but not purged
- **WHEN** the owner restores it
- **THEN** its content is returned as it was

#### Scenario: The owner purges a deleted resource

- **GIVEN** a deleted resource
- **WHEN** the owner purges it
- **THEN** its content is removed and it cannot be restored

### Requirement: Renaming and tagging are independent edits

Renaming and tagging a resource SHALL be independent edits, and an edit of tags SHALL replace the whole set of tags.

#### Scenario: The owner edits only the tags

- **GIVEN** a resource has a name and tags
- **WHEN** the owner changes only its tags
- **THEN** the name is unchanged
- **AND** no rename is recorded in the activity log

#### Scenario: The owner renames a resource

- **GIVEN** a resource has a name
- **WHEN** the owner renames it
- **THEN** its tags are unchanged
- **AND** the rename is recorded in the activity log

### Requirement: Only the owner reads or changes a resource's content

A resource's content SHALL be readable and changeable only by its owner, except where the resource is published.

#### Scenario: Another user asks for a resource's content

- **GIVEN** a resource belongs to one user
- **WHEN** another signed-in user asks for its content
- **THEN** the request is refused

### Requirement: A save reaches the owner's other devices without a reload

A content save SHALL reach the owner's other open devices without a reload, and the device that saved SHALL NOT receive its own save back.

#### Scenario: The owner saves on one device

- **GIVEN** the owner has the resource open on two devices
- **WHEN** a save lands on one device
- **THEN** the other device shows the saved content
- **AND** the saving device does not receive its own save

### Requirement: Content is read once per opening of a resource

A resource's content SHALL be read once for each opening of the resource, and every view of it SHALL draw from that one read.

#### Scenario: The owner switches between views of an open resource

- **GIVEN** a resource is open and its content has been read
- **WHEN** the owner switches to another view of the resource
- **THEN** no further request for the content is made

#### Scenario: A read lands after the owner has opened another resource

- **GIVEN** a read of one resource's content is still pending
- **WHEN** the owner opens a different resource before it lands
- **THEN** the late read is discarded and the other resource is shown

### Requirement: A save of unchanged content writes nothing

A save whose content is identical to the content last stored SHALL NOT advance the content version.

#### Scenario: An editor autosaves an unchanged document

- **GIVEN** a document was last saved with its current content
- **WHEN** the editor autosaves it again with no change
- **THEN** the content version does not advance

### Requirement: Resource pages require sign-in

Resource pages SHALL require sign-in, and there SHALL be no anonymous local editing path.

#### Scenario: An anonymous visitor opens a resource page

- **GIVEN** a visitor is not signed in
- **WHEN** the visitor opens a resource page
- **THEN** the visitor is asked to sign in
- **AND** no content is edited locally

### Requirement: Every content write runs the same steps as one unit

Every content write, whether an editor save, a deployment, a duplicate or a restore, SHALL check the content against its type, store it, announce it, record its activity and run the type's after-save hook as one unit.

#### Scenario: A blueprint is deployed into resources

- **GIVEN** a blueprint is deployed
- **WHEN** each resource's content is written
- **THEN** each write is checked against its type
- **AND** each write records its activity and announces the change in the same way as an editor save

### Requirement: A type's after-save hook never fails or delays the save

A type's after-save hook SHALL NOT fail or delay the save that triggers it.

#### Scenario: The after-save hook throws an error

- **GIVEN** a type's after-save hook fails
- **WHEN** the save that triggered it lands
- **THEN** the save still succeeds
