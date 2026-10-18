## ADDED Requirements

### Requirement: An agent creates a resource of a named type

An agent holding the Resources scope SHALL be able to create a resource by giving its type and its name.

#### Scenario: An agent creates a resource of a named type

- **GIVEN** a key holds the Resources scope
- **WHEN** the agent creates a resource of a type with a name
- **THEN** a resource of that type with that name exists

#### Scenario: A key without the Resources scope cannot create a resource

- **GIVEN** a key does not hold the Resources scope
- **WHEN** the key creates a resource
- **THEN** the request is refused
- **AND** no resource is created

### Requirement: An agent renames and tags a resource without changing its content

An agent SHALL be able to rename a resource and set its tags, and the resource's content SHALL stay the same.

#### Scenario: An agent renames and tags a resource

- **GIVEN** a resource has a name, tags and content
- **WHEN** an agent renames it and sets new tags
- **THEN** the resource has the new name and tags
- **AND** its content is unchanged

### Requirement: A binned resource comes back whole when restored

A resource an agent moves to the bin SHALL come back whole when restored.

#### Scenario: A resource moved to the bin and restored comes back whole

- **GIVEN** a resource has content and tags
- **WHEN** an agent moves the resource to the bin and then restores it
- **THEN** the resource is back with the content and tags it had

### Requirement: An agent duplicates a resource

An agent SHALL be able to duplicate a resource into a second resource.

#### Scenario: An agent duplicates a resource

- **GIVEN** a resource has content
- **WHEN** an agent duplicates it
- **THEN** a second resource exists with the same content

### Requirement: An agent publishes only what its type publishes

An agent SHALL be able to publish and unpublish a resource only when its type publishes, and SHALL be refused with a message otherwise.

#### Scenario: An agent publishes and unpublishes a resource of a publishing type

- **GIVEN** a resource's type publishes
- **WHEN** an agent publishes the resource and then unpublishes it
- **THEN** the resource is published as its type publishes it
- **AND** after unpublishing it is no longer published

#### Scenario: A type that does not publish is refused in words

- **GIVEN** a resource's type does not publish
- **WHEN** an agent asks to publish the resource
- **THEN** the request is refused with a message saying the type does not publish
- **AND** nothing is published

### Requirement: An agent uploads and removes files within a time limit

An agent SHALL be able to upload a file to an address that stays valid for a short time, and SHALL be able to remove a file.

#### Scenario: An agent uploads a file before its address expires

- **GIVEN** an agent has asked for an upload address for a file
- **WHEN** the agent sends the file's bytes to that address before it expires
- **THEN** the file is stored on the resource

#### Scenario: An upload to an expired address is refused

- **GIVEN** an upload address has expired
- **WHEN** an agent sends bytes to that address
- **THEN** the upload is refused
- **AND** no file is stored

#### Scenario: An agent removes a file from a resource

- **GIVEN** a resource has a file
- **WHEN** an agent removes the file
- **THEN** the file is no longer on the resource

### Requirement: An agent reads what links to a resource and what it links to

An agent SHALL be able to read a resource's references, both what it links to and what links to it, and a link written into a document SHALL appear in those references.

#### Scenario: An agent reads what links to a resource

- **GIVEN** resource A links to resource B
- **WHEN** an agent reads the references of resource B
- **THEN** resource A is listed as linking to it

#### Scenario: A link written into a document appears in references

- **GIVEN** an agent writes a link field into a document
- **WHEN** the save completes
- **THEN** the link appears in the resource's references

### Requirement: An agent reads a resource's activity and history

An agent SHALL be able to read a resource's activity and its revision history, and to restore an earlier version.

#### Scenario: A restore keeps the version it replaces as a revision

- **GIVEN** a resource has an earlier version in its history
- **WHEN** an agent restores that earlier version
- **THEN** the version held before the restore is kept as a revision
- **AND** restoring that revision undoes the restore

### Requirement: An agent reads a dataset as one table

An agent SHALL be able to read a Sheet's rows, a Survey's responses or a Program's status as one table.

#### Scenario: An agent reads a Sheet's rows as one table

- **GIVEN** a Sheet has rows
- **WHEN** an agent reads the dataset
- **THEN** the rows come back as one table

### Requirement: Program participant tokens are issued once per audience member

A Program's participant generation SHALL issue one token per audience member, and a repeated request SHALL return the same tokens.

#### Scenario: Repeating participant generation returns the same tokens

- **GIVEN** a Program has an audience
- **WHEN** an agent asks for participant tokens twice
- **THEN** each audience member has one token
- **AND** the second request returns the same tokens as the first
