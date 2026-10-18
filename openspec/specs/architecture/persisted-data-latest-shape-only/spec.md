## Purpose

No legacy-shape schemas, migration arms, or backwards-compat defaulting — every read path assumes the latest, cleanest shape.

## Requirements

### Requirement: Persisted client state is read in its latest shape only

Persisted client state SHALL be read only in the latest shape the code writes, and data that does not parse in that shape SHALL reset to a fresh default.

#### Scenario: A stored browser save no longer parses

- **GIVEN** a browser-stored save does not parse in the current shape
- **WHEN** the app loads it
- **THEN** the app starts from a fresh default
- **AND** no migration of the old data runs

#### Scenario: A stored shape changes

- **GIVEN** the shape of a persisted entity changes
- **WHEN** the change is made
- **THEN** the schema and the old shape are replaced in the same change
- **AND** no union of the old and new shapes is kept

### Requirement: A player's only copy of a save is never reset

A save that is the player's only copy SHALL NOT be reset when it fails to parse, and SHALL instead be reported as an error and left unchanged.

#### Scenario: A game save no longer parses

- **GIVEN** the player's game save no longer parses in the current shape
- **WHEN** the game loads it
- **THEN** the game reports an error
- **AND** the stored save is left as it was

### Requirement: A server-stored content blob is backfilled when its shape changes

When the schema of server-stored content changes, the stored content SHALL be rewritten to the new shape in the same change rather than reset.

#### Scenario: A content schema changes

- **GIVEN** stored content no longer parses after a schema change
- **WHEN** the change is deployed
- **THEN** the stored content is rewritten to the new shape by a one-off script
- **AND** the content is not replaced with a default

#### Scenario: A version taken before the change is restored

- **GIVEN** a version snapshot was taken before the schema change
- **WHEN** a reader restores it
- **THEN** the restore fails because the snapshot is not rewritten

### Requirement: A field added to a stored row applies to rows written from then on

A field added to a stored table entity SHALL describe rows written after the change, and rows written earlier SHALL read the field's default.

#### Scenario: A new field is added to an entity

- **GIVEN** an entity gains a new field
- **WHEN** a row written before the change is read
- **THEN** the field reads its default value
- **AND** no read path infers the field from the row's other values

#### Scenario: The earlier rows must be corrected

- **GIVEN** the rows written before the change need the new field to be correct
- **WHEN** the change is made
- **THEN** a one-off backfill script is committed with the change

### Requirement: Relational data evolves through migrations

Relational data SHALL change shape only through a database migration, and no legacy read path SHALL remain beside the migrated shape.

#### Scenario: A relational table changes shape

- **GIVEN** a table in the relational database changes shape
- **WHEN** the change is deployed
- **THEN** a migration brings the stored rows to the new shape
- **AND** the code reads only the new shape
