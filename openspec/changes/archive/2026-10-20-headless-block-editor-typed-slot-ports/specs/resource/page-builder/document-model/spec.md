## ADDED Requirements

### Requirement: Each webpage node's children come from its own slots

A webpage node's children SHALL be read through the webpage's children port, so that each node type's children are typed by its own slots.

#### Scenario: Each webpage node's children come from its own slots

- **GIVEN** a webpage holding a node of each type that has slots
- **WHEN** the children of each node are read through the port
- **THEN** each node's children are the nodes in its own slots

### Requirement: A stored webpage is parsed by the static node schema

A webpage the editors have stored SHALL parse under the webpage's statically built node schema.

#### Scenario: A stored webpage parses under the static node schema

- **GIVEN** a webpage holding a node of every webpage type, each with the props the editor stores
- **WHEN** the webpage is parsed against its document schema
- **THEN** the webpage parses without a refusal

### Requirement: The registry's slot lists match the node schema

The registry's slot lists SHALL equal the child types the node schema accepts in each slot.

#### Scenario: A registry's slot lists match the node schema's accepted types

- **GIVEN** the webpage registry and its static node schema
- **WHEN** each slot's list is compared with the tags the schema accepts in that slot
- **THEN** every slot's list equals its accepted tags
