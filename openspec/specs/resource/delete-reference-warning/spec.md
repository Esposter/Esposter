## Purpose

A delete confirmation that names the other resources using the one being deleted, read off the resource-link index before anything is moved to the bin. The warning is advisory: the delete still goes ahead and can be restored.

## Requirements

### Requirement: The delete confirmation names resources that depend on the one being deleted

The delete confirmation SHALL list each of the owner's other live resources that refer to a resource being deleted, by name and type.

#### Scenario: A dashboard that uses a sheet is named when the sheet is deleted

- **GIVEN** a dashboard's visual is bound to a sheet
- **WHEN** the owner asks to delete the sheet
- **THEN** the confirmation says the dashboard uses it
- **AND** it names the dashboard and its type

#### Scenario: Several dependents are listed by name

- **GIVEN** two resources refer to the same sheet
- **WHEN** the owner asks to delete the sheet
- **THEN** the confirmation says two other resources use it
- **AND** lists both by name

#### Scenario: A resource with no dependents shows the plain confirmation

- **GIVEN** no other resource refers to the one being deleted
- **WHEN** the owner asks to delete it
- **THEN** the confirmation has no dependents warning

### Requirement: The warning covers a whole selection

The list delete confirmation SHALL name the dependents of every resource in a selection, and SHALL NOT name a dependent that is itself being deleted.

#### Scenario: A dependent deleted with its source is not named

- **GIVEN** the owner selects a dashboard and the sheet it uses
- **WHEN** they ask to delete both
- **THEN** no dependents warning names the dashboard

#### Scenario: A selection's dependent is named once

- **GIVEN** one outside resource refers to two resources in the selection
- **WHEN** the owner asks to delete the selection
- **THEN** that resource is named once

### Requirement: Resources that cannot be affected are not named

The warning SHALL NOT name resources in the recycle bin, nor resources owned by someone else.

#### Scenario: A dependent in the recycle bin is not named

- **GIVEN** a dashboard that uses a sheet is in the recycle bin
- **WHEN** the owner asks to delete the sheet
- **THEN** the dashboard is not named in the warning

#### Scenario: Another owner's resource is not revealed

- **GIVEN** a resource owned by someone else refers to the sheet
- **WHEN** the owner asks to delete the sheet
- **THEN** that resource is not named

### Requirement: The warning does not block the delete and a restore undoes it

The delete confirmation SHALL keep Delete enabled while it shows dependents, and a restore SHALL bring every dependent back to working.

#### Scenario: Delete proceeds despite dependents

- **GIVEN** the confirmation names a dependent
- **WHEN** the owner confirms the delete
- **THEN** the resource moves to the recycle bin

#### Scenario: Restoring heals the dependents

- **GIVEN** a deleted sheet was used by a dashboard
- **WHEN** the owner restores the sheet from the toast or the recycle bin
- **THEN** the dashboard reads the sheet again without any change to it
