## Purpose

A wrong name, shape or deployed identity is corrected in place — no aliases, re-export shims, legacy read paths or migration arms are ever carried to spare something the cost of changing.

## Requirements

### Requirement: A wrong name is corrected in place

A wrong name, shape or deployed identity SHALL be corrected in place, with every reference moved in the same change and the old form deleted.

#### Scenario: A name in code is wrong

- **GIVEN** a name in the code is wrong
- **WHEN** the name is corrected
- **THEN** every reference to it moves in the same change
- **AND** the old name no longer resolves anywhere in the repository

#### Scenario: A change would keep the old name working

- **GIVEN** a change renames something but keeps the old name resolvable through an alias or a forwarding path
- **WHEN** the change is reviewed
- **THEN** the change is rejected and the old name is deleted

### Requirement: A deployed identity is renamed only after its plan is read

A rename of a deployed resource SHALL be applied only after its plan has been reviewed.

#### Scenario: A deployed resource is renamed in place

- **GIVEN** a deployed resource is renamed
- **WHEN** its plan is reviewed before applying
- **THEN** the plan shows an in-place update
- **AND** the change ships with the plan line that shows it

#### Scenario: The plan says the resource must be replaced

- **GIVEN** a plan for a renamed resource says it must be replaced
- **WHEN** the change is applied
- **THEN** the replacement is created, traffic is cut over, and the old resource is deleted
- **AND** no alias keeps the old identity alive

### Requirement: A published package's export is removed without a compatibility wrapper

An export of a published package SHALL be renamed or removed as an ordinary refactor, with no forwarding wrapper and no major version bump.

#### Scenario: An export is no longer needed

- **GIVEN** an export of a published package has no remaining use
- **WHEN** the export is removed
- **THEN** it is deleted rather than kept behind a forwarding wrapper
- **AND** the release that carries it is a refactor rather than a breaking change

### Requirement: Code uses the runtime's own APIs at its declared floor

Code SHALL use a platform API directly whenever the declared minimum runtime already provides it, rather than a substitute for an older one.

#### Scenario: The runtime floor ships an API the code once reimplemented

- **GIVEN** the declared minimum runtime provides a native API
- **WHEN** code needs that behaviour
- **THEN** it calls the native API directly
- **AND** no substitute for an older runtime is kept

### Requirement: Stored data moves forward only

A schema change to stored data SHALL move the data to its new state through one forward migration, and no legacy read path SHALL remain behind it.

#### Scenario: A schema change to relational data lands

- **GIVEN** a schema change alters a stored table
- **WHEN** the change is deployed
- **THEN** one forward migration brings the stored data to the new state
- **AND** no code path reads the previous shape

### Requirement: An accurate name is kept

A name that is still accurate SHALL be kept, even when it does not match the prefix of its neighbours.

#### Scenario: A name is accurate but unlike its siblings

- **GIVEN** a function name describes exactly what the function does
- **WHEN** its neighbours use a different naming pattern
- **THEN** the name is left unchanged

### Requirement: Obsolete names are not kept alongside their replacements

Code SHALL NOT carry a version-suffixed twin of a name, a deprecation marker, or a comment explaining that a name is historical.

#### Scenario: A wrong name needs fixing

- **GIVEN** a name is wrong
- **WHEN** a fix is written
- **THEN** the fix replaces the name rather than adding a suffixed copy beside it
- **AND** no deprecation marker or historical comment is left behind
