## Purpose

Four generic tools on the resource router let an agent find any resource, read its type's content schema as JSON Schema, read its content at a JSON Pointer and edit it with RFC 6902 operations applied on the server and saved through the one content door, for every type in ResourceDefinitionMap with nothing registered per type.

## Requirements

### Requirement: Four tools reach every resource type with nothing registered per type

An agent holding the resources scope SHALL find, describe, read and edit every resource type through the same four tools, with nothing registered for each type.

#### Scenario: A newly added type is reachable the day it exists

- **GIVEN** a resource type added to the registry of types
- **WHEN** an agent lists the resources it can find
- **THEN** the new type's resources are reachable through the same tools

#### Scenario: The tool list does not grow with types

- **WHEN** resource types are added
- **THEN** the number of tools an agent sees stays the same

### Requirement: A type's content schema is given as JSON Schema with its gaps marked

A type's content schema SHALL be given to an agent as JSON Schema that marks every undescribed part and every read-only field.

#### Scenario: An undescribed part is marked as opaque

- **WHEN** an agent reads a content schema holding a field that describes no shape
- **THEN** the field is marked as opaque

#### Scenario: A read-only field is marked read-only

- **WHEN** an agent reads a content schema holding a read-only field
- **THEN** the field is marked read-only

#### Scenario: A kind of value with no JSON form is refused

- **WHEN** a content schema holds a kind of value that has no JSON form
- **THEN** the description fails rather than describing the value as an empty object

### Requirement: Content is read at a pointer, paged and summarised rather than truncated

An agent SHALL read stored content at a JSON Pointer, and content past the read size SHALL be replaced by the size of each of its members rather than cut short.

#### Scenario: A pointer selects one part of the content

- **WHEN** an agent reads content at a pointer
- **THEN** only the part at that pointer is returned

#### Scenario: A pointer to nothing is refused by name

- **WHEN** an agent reads at a pointer that selects nothing
- **THEN** the read is refused and the pointer is named in the refusal

#### Scenario: An array is returned one page at a time

- **WHEN** an agent reads an array longer than one page
- **THEN** one page is returned with the array's whole length

#### Scenario: Oversized content is summarised by member size

- **WHEN** an agent reads content larger than the read size at a pointer holding members
- **THEN** the answer gives the size of each member and leaves the content out

### Requirement: A read never reports a version newer than its content

Every read SHALL report a content version no newer than the content it returns, so that an edit pinned to that version is refused when the content has moved on.

#### Scenario: A save landing during a read leaves the version behind

- **GIVEN** a save lands between the version check and the content read
- **WHEN** the agent reads the content
- **THEN** the reported version is the older one

#### Scenario: An edit pinned to the older version is refused

- **GIVEN** an agent's read reported an older version than the current content
- **WHEN** the agent edits pinned to that version
- **THEN** the edit is refused as stale

### Requirement: An edit is refused before applying when it writes a read-only path

An edit SHALL be refused, naming the path, when any of its operations writes at or under a part the schema marks read-only or undescribed, and a test-only operation SHALL be allowed anywhere.

#### Scenario: A write under a read-only part is refused

- **WHEN** an agent edits a path under a part marked read-only
- **THEN** the edit is refused naming that path and the content is untouched

#### Scenario: A comparison at a read-only path is allowed

- **WHEN** an agent's edit only compares a value at a read-only path
- **THEN** the edit is allowed

### Requirement: An edit applies all of its operations or none

An edit SHALL apply all of its operations or none of them, and an edit with more operations than the limit SHALL be refused.

#### Scenario: A failed comparison leaves the content unchanged

- **WHEN** an edit contains a comparison that does not hold
- **THEN** no operation of the edit is applied

#### Scenario: An edit over the operation limit is refused

- **WHEN** an agent submits more operations than the limit allows
- **THEN** the edit is refused and nothing is applied

### Requirement: The edited result is validated before it is saved

An edit whose result the type's schema rejects SHALL be refused as the caller's mistake, with each issue naming its path, and the content SHALL stay unchanged.

#### Scenario: A result the schema rejects names each path

- **WHEN** an edit produces content the type's schema rejects
- **THEN** the refusal names each path that is wrong and the content is unchanged

### Requirement: Edits and their undo data are bounded in size

An edit whose resulting content or undo data would exceed the content size limit SHALL be refused.

#### Scenario: A copy that would double the content is refused

- **WHEN** an edit copies a large document into itself past the content size limit
- **THEN** the edit is refused and nothing is saved

### Requirement: A pinned edit is stale-checked and an unpinned edit retries a bounded number of times

An edit pinned to a content version SHALL be refused as stale once the content has moved past that version, and an unpinned edit SHALL retry against the latest content up to a fixed number of attempts.

#### Scenario: A pinned edit is refused once the content has moved on

- **GIVEN** an edit pinned to a version the content has since moved past
- **WHEN** the edit is submitted
- **THEN** it is refused as stale and the agent is told to read again

#### Scenario: An unpinned edit retries past a concurrent save

- **GIVEN** an unpinned edit and a save landing between its read and its write
- **WHEN** the write is attempted
- **THEN** the edit is read and reapplied against the newer content

#### Scenario: An unpinned edit gives up after its attempts

- **GIVEN** saves keep landing between the reads and writes of an unpinned edit
- **WHEN** the attempts are used up
- **THEN** the edit fails and nothing is overwritten

### Requirement: Every applied edit reports the operations that undo it

Every applied edit SHALL report the operations that undo it, so that an agent can undo its own edit in a single call.

#### Scenario: An agent undoes its own edit in one call

- **GIVEN** an agent's edit has been applied
- **WHEN** the agent submits the undo operations the edit reported
- **THEN** the content returns to its state before the edit
