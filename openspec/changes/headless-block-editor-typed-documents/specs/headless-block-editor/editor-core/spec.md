## ADDED Requirements

### Requirement: A document's schema is the check and the description

The editor core SHALL check a document with one schema built from its registry, and an agent SHALL read the same schema as the description of every node's props and of the child types each slot accepts. A key a node's type does not declare SHALL be refused by name, not dropped.

#### Scenario: A node of an accepted type parses

- **GIVEN** a registry whose section type accepts headings in its slot
- **WHEN** a document holding a section with a heading in that slot is parsed
- **THEN** the document parses

#### Scenario: A node of a type its slot refuses names its type field

- **GIVEN** a registry whose section type accepts only headings in its slot
- **WHEN** a document holding a text node in that slot is parsed
- **THEN** the document is refused
- **AND** the refusal names the text node's type field and the slot's accepted types

#### Scenario: A prop the type does not declare is refused by name

- **GIVEN** a registry whose heading type declares a text prop
- **WHEN** a document holding a heading with an undeclared prop is parsed
- **THEN** the document is refused
- **AND** the refusal names the undeclared prop

#### Scenario: A repeated id is refused across slots

- **GIVEN** a document holding two nodes in different slots with the same id
- **WHEN** the document is parsed
- **THEN** the document is refused
- **AND** the refusal names the second node's id

#### Scenario: A pasted child of a type its slot refuses is refused

- **GIVEN** a slot that accepts only headings
- **WHEN** a paste holding a text node is checked for that slot
- **THEN** the paste is refused

#### Scenario: An agent reads the types a slot accepts

- **GIVEN** a registry whose section type accepts headings and images in its slot
- **WHEN** an agent reads the JSON Schema of the document
- **THEN** the schema lists exactly the heading and image types for that slot
- **AND** each listed type shows its own props

#### Scenario: A recursive slot converts without an opaque part

- **GIVEN** a registry whose column type accepts columns in its own slot
- **WHEN** an agent reads the JSON Schema of the document
- **THEN** the recursion is a reference
- **AND** no part of the schema is marked opaque

### Requirement: Node props are typed from the registry to the renderer

The editor core SHALL type each node type's props as an interface that the type's schema satisfies, and SHALL type a document by its node union, so that a renderer, a props update and a store read a prop with no cast and no re-parse.

#### Scenario: A registry's props satisfy each type's interface

- **GIVEN** a registry whose heading type declares a text prop
- **WHEN** the registry's schema is built
- **THEN** the heading type's props satisfy its declared interface
- **AND** the interface's text prop is typed as a string

#### Scenario: A parsed document carries its node union type

- **GIVEN** a registry whose section type accepts headings in its slot
- **WHEN** a document holding a section with a heading in that slot is parsed
- **THEN** the parsed document is typed by the registry's node union
- **AND** its nodes' props are typed without a loose record

#### Scenario: A renderer reads a typed prop without a cast

- **GIVEN** a document holding a heading with a text prop
- **WHEN** the heading is rendered
- **THEN** the text prop is read from the typed node with no cast and no re-parse
