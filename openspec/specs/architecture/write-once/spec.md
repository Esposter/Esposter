## Purpose

A mechanism that serves many cases is written once over the description every case already has, so adding a case is one declaration at its source and never a change to the mechanism — the standard for code that costs nothing to maintain and nothing to extend. It sets how a mechanism is shaped and when it is written.

## Requirements

### Requirement: Mechanisms read the description each case already carries

A mechanism SHALL read each case's behaviour from the description that case already has, and SHALL NOT keep a second copy of that description.

#### Scenario: A case's existing declaration is what the mechanism reads

- **GIVEN** a case whose name, input and permission check are declared at its source
- **WHEN** the mechanism serves that case
- **THEN** the mechanism uses those declared values
- **AND** no other copy of them exists to drift from the declaration

#### Scenario: A changed declaration reaches the mechanism without an edit to it

- **GIVEN** a case served by a mechanism
- **WHEN** its declaration at the source is changed
- **THEN** the mechanism serves the changed declaration
- **AND** the mechanism's own code is unchanged

### Requirement: A new case is one declaration at its source

Adding a case SHALL take one declaration where the case is defined and no change to the mechanism that serves it.

#### Scenario: A new case is added by a declaration alone

- **GIVEN** a mechanism already serves its cases
- **WHEN** a case is added as an entry in its definition map or as a flag in its procedure's metadata
- **THEN** the mechanism serves the case
- **AND** no new file, list entry or branch is added to the mechanism's own code

### Requirement: A mechanism has no per-case branch

A mechanism SHALL NOT branch on an individual case, and a case it cannot serve uniformly SHALL have its source reshaped instead.

#### Scenario: A case the mechanism cannot serve uniformly is reshaped at its source

- **GIVEN** a case whose source does not give the mechanism the input it reads
- **WHEN** the case is added
- **THEN** its source is reshaped for its consumer
- **AND** the mechanism's body is unchanged

### Requirement: A mechanism is written once when its input already exists for every case

A mechanism SHALL be written once from its first case when every case it will serve already has the input it reads, and SHALL wait for a second consumer when that input would have to be guessed from one case.

#### Scenario: A mechanism over an input every case already has is written at once

- **GIVEN** every case the mechanism will serve already has the input it reads
- **WHEN** the first case needs the mechanism
- **THEN** the mechanism is written generically from that first case

#### Scenario: A shared contract that one case cannot reveal waits for a second consumer

- **GIVEN** the input a mechanism would read is a contract that several cases must agree on
- **WHEN** only one case exists
- **THEN** the mechanism is not written until a second consumer exists

### Requirement: Security-shaped and spec-tracking code comes from a maintained library

Code that is security-shaped or tracks an outside specification SHALL come from a maintained library, and the mechanism SHALL only connect its source to that library.

#### Scenario: A mechanism that needs authentication or a wire protocol uses a maintained library

- **GIVEN** a mechanism needs authentication, key storage or a wire protocol
- **WHEN** the mechanism is written
- **THEN** a maintained library provides that part
- **AND** the mechanism only connects its source to the library

### Requirement: A new resource type is one entry in the resource definition map

A new resource type SHALL be added as one entry in the resource definition map and SHALL NOT need a router of its own.

#### Scenario: A new resource type gets its procedures from its map entry

- **GIVEN** a resource type has its entry in the resource definition map
- **WHEN** the type is added to the product
- **THEN** its procedures are built from that entry
- **AND** no router is written for the type

### Requirement: A new procedure is checked without registration

Every procedure SHALL have its input checked by the repository's checks on the day it exists, with nothing registered for it.

#### Scenario: A procedure added to a router is checked without registration

- **GIVEN** a router gains a procedure with an input schema
- **WHEN** the repository's checks run
- **THEN** the procedure's input is checked
- **AND** no entry for the procedure was added anywhere to make that happen

### Requirement: A form is rendered from the schema that validates it

A form SHALL render each field from the schema that validates it, so a new field is a schema field and never template code.

#### Scenario: A field added to a validation schema appears in its form

- **GIVEN** a form renders from its validation schema
- **WHEN** a field is added to that schema
- **THEN** the form renders the field
- **AND** no template of the form is changed
