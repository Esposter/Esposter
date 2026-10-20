## ADDED Requirements

### Requirement: A node's children are read through the consumer's port

The editor core SHALL read a node's children through the consumer's children port, a function from a node to its slots' typed child lists, so that no slot is looked up by a runtime name and no node is asserted to a type.

#### Scenario: A renderer reads a child through the port

- **GIVEN** a document holding a section with a heading in its children slot
- **WHEN** the document is rendered through the port
- **THEN** the heading is rendered as a child of the section
- **AND** no read of the children is asserted

#### Scenario: A document is typed by its consumer's node schema

- **GIVEN** a consumer whose node schema is a statically built union over its node types
- **WHEN** the consumer builds its document schema from that node schema and its root props schema
- **THEN** the document schema's output is typed by the consumer's document type
- **AND** the document schema is built with no assertion

#### Scenario: A pointer to a misspelt slot fails the typecheck

- **GIVEN** an internal pointer built by the slot pointer helper
- **WHEN** a slot name that the node does not declare is passed to it
- **THEN** the typecheck fails at the call

### Requirement: The typed path contains no assertion

The editor core's typed path SHALL contain no `as` assertion, no double assertion, and no non-null assertion, and an `unknown` value SHALL be used as typed only after a guard or a schema parse.

#### Scenario: The core's source has no assertion

- **GIVEN** the core's source outside its tests
- **WHEN** it is searched for assertions
- **THEN** no typed path contains one
