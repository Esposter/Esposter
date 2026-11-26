## Purpose

Defines the one declaration every server-derived column carries, the generated set that reads the declarations, and the types and overlay checks that keep a client from writing a derived value.

## ADDED Requirements

### Requirement: Every server-derived column declares its kind beside its definition

A column whose value the server derives SHALL carry one declaration on its own line, naming its kind, its inputs and its prediction, so that no derived value is defined in any other place.

#### Scenario: A column declared derived reports its kind and inputs

- **GIVEN** a table with a column declared as a derived aggregate
- **WHEN** the table is built
- **THEN** the table reports the column's kind, its inputs and its prediction

#### Scenario: A declaration naming a missing input fails the schema build

- **GIVEN** a declaration whose input column is on neither its own table nor the contributing table its relation names
- **WHEN** the schema is built
- **THEN** the build fails and names the missing input

### Requirement: The derived set is generated from the declarations and never kept by hand

The list of derived columns SHALL be written by the generator from the declarations, so that a new declaration appears in the set on regeneration and no other file names the set.

#### Scenario: A new declaration appears in the generated set on regeneration

- **GIVEN** a new derived column declared on a table
- **WHEN** the generator runs
- **THEN** the generated set holds the column with its table, kind and inputs

#### Scenario: A generated set that differs from the declarations fails the check

- **GIVEN** a generated set edited by hand so that it differs from the declarations
- **WHEN** the generation check runs
- **THEN** the check fails and names the difference

### Requirement: A derived value is readonly in every row type and absent from every draft

Row types SHALL mark each derived key readonly, and draft and patch types SHALL omit each derived key, so that a client write to a derived value is a type error.

#### Scenario: A client write to a derived key is a type error

- **GIVEN** client code that assigns a derived key of a row
- **WHEN** the code is type-checked
- **THEN** the check reports the assignment as an error

#### Scenario: A draft of a new row omits its derived keys

- **GIVEN** a draft typed for a new row of a table with derived keys
- **WHEN** the draft is checked against its type
- **THEN** a derived key set on the draft is an error

### Requirement: The overlay refuses a patch to a derived key at runtime

A patch written through the overlay SHALL be refused when it names a derived key, so that a caller which reaches the overlay without the types still cannot move the value.

#### Scenario: A patch naming a derived key is refused

- **GIVEN** an overlay patch for a row that names one of the row's derived keys
- **WHEN** the patch is applied
- **THEN** the patch is refused and no value of the row changes
