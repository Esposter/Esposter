## MODIFIED Requirements

### Requirement: A document is valid only against its own registry

The editor core SHALL accept a document only when its root's content holds only the types the registry's root accepts, its root's props pass the root's schema, every node's type is in the registry it was checked against, every slot holds only the child types it allows, every id is unique, and the node count is within the consumer's limit.

#### Scenario: A child its slot does not allow

- **GIVEN** a registry whose list type allows only items in its slot
- **WHEN** a document holding a list with a heading in that slot is checked
- **THEN** the document is refused
- **AND** the refusal names the slot

#### Scenario: A node's props its type's schema refuses

- **GIVEN** a registry whose heading type takes a text prop
- **WHEN** a document holding a heading whose text is a number is checked
- **THEN** the document is refused
- **AND** the refusal names the prop

#### Scenario: A document from another registry

- **GIVEN** a document built with one editor's registry
- **WHEN** it is checked against a second editor's registry that lacks one of its types
- **THEN** the document is refused

#### Scenario: A root holding a type its content does not accept

- **GIVEN** a registry whose root accepts only sections
- **WHEN** a document holding a heading directly in its content is checked
- **THEN** the document is refused
- **AND** the refusal names the heading's place in the content

#### Scenario: Root props its schema refuses

- **GIVEN** a registry whose root requires a title
- **WHEN** a document whose root has no title is checked
- **THEN** the document is refused
- **AND** the refusal names the root's title

### Requirement: Pasted nodes never share an id with the document

Pasting nodes SHALL give every pasted node a fresh id, SHALL refuse nodes whose types the destination's registry does not hold, and SHALL accept nodes the destination slot accepts whatever the root's content accepts.

#### Scenario: Pasting a node twice

- **GIVEN** a copied node with a child
- **WHEN** it is pasted into the same document twice
- **THEN** every node in the document has an id of its own

#### Scenario: Pasting into another editor

- **GIVEN** a node copied from one editor's document
- **WHEN** it is pasted into a document whose registry lacks its type
- **THEN** the paste is refused
- **AND** the document is unchanged

#### Scenario: Pasting a child its root does not accept into a slot that does

- **GIVEN** a registry whose root accepts only sections, and a copied heading
- **WHEN** the heading is pasted into a section's slot that accepts headings
- **THEN** the heading is added to that slot

## ADDED Requirements

### Requirement: A document renders from its leaves up

The editor core SHALL render a document by rendering each node after its slots, handing the consumer's render function the node, its type's definition and each slot's rendered output in order, and SHALL render nothing for a node whose type the registry lacks.

#### Scenario: Rendering a nested document

- **GIVEN** a document holding a section whose slot holds two headings
- **WHEN** it is rendered with a function that wraps each node's slots in its type's name
- **THEN** the section's output holds the two headings' output in their order

#### Scenario: A node whose type the registry lacks

- **GIVEN** a document holding a node whose type is not in the registry
- **WHEN** it is rendered
- **THEN** that node produces no output
- **AND** its siblings render
