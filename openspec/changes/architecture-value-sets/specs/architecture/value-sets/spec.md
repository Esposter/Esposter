## ADDED Requirements

### Requirement: Every set of named values is one erasable form

A closed set of named values SHALL be declared as a constant object with a type of the same name, in every package, so that a runtime which only strips types loads it, and a declaration in the other form SHALL fail the typecheck.

#### Scenario: A set loaded by Node's type stripping

- **GIVEN** a module that declares a set of named values
- **WHEN** a bare Node process with no transform imports it
- **THEN** the module loads and its members read as their values

#### Scenario: Declaring an enum

- **GIVEN** a source file that declares a TypeScript `enum`
- **WHEN** the repository is typechecked
- **THEN** the typecheck fails on that declaration

### Requirement: Merged sets refuse a shared key

Combining several sets into one namespace SHALL refuse any key two of them share, whichever two they are, both when the code is typechecked and when the merge runs.

#### Scenario: Two sets sharing a key

- **GIVEN** two sets that both hold a member under one key
- **WHEN** they are merged
- **THEN** the merge throws an error naming the key

#### Scenario: The first and last of three sets sharing a key

- **GIVEN** three sets where only the first and the third share a key
- **WHEN** their merge is typechecked
- **THEN** the merged type is never

#### Scenario: Sets with no key in common

- **GIVEN** several sets with no key in common
- **WHEN** they are merged
- **THEN** the merged set holds every member of each, under its own key and value

### Requirement: A set mirroring outside data is generated in the one form

A set whose members name data the repository does not author SHALL be written by the generator reading that data, in the same form as a hand-written set.

#### Scenario: Generating a set from a listing

- **GIVEN** a list of names read from outside data
- **WHEN** the set generator writes them
- **THEN** it writes a constant object of those names, sorted, with a type of the same name
