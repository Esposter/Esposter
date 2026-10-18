## Purpose

Content can name any resource by id, so what it names is read only when its owner owns it — an id in content is a claim, not a grant.

## Requirements

### Requirement: A reference in content returns data only to the owner of the named resource

A read through an identifier held in a resource's content SHALL return data only when the resource's owner also owns the named resource.

#### Scenario: A dashboard names a dataset its owner owns

- **GIVEN** a dashboard whose content names a dataset owned by the dashboard's owner
- **WHEN** the dashboard is read
- **THEN** the dataset's data is shown

#### Scenario: A dashboard names a dataset owned by someone else

- **GIVEN** a dashboard whose content names a dataset owned by another user
- **WHEN** the dashboard is read
- **THEN** no data from that dataset is shown

### Requirement: An unowned reference answers as if the resource were missing

A read through an identifier that the owner does not own SHALL answer as it would for a missing resource, so that no response reveals whether the named resource exists.

#### Scenario: A program names a survey owned by someone else

- **GIVEN** a program whose content names a survey owned by another user
- **WHEN** the program's status is read
- **THEN** the status shows no responses from that survey
- **AND** the answer is the same as for a survey that does not exist

### Requirement: Asset addresses the copier cannot read are carried over unchanged

When content is cloned, an asset address the copier may not read SHALL be carried over unchanged rather than copied or failing the clone.

#### Scenario: Cloning a resource that links another user's file

- **GIVEN** a resource whose content links a file the cloning user cannot read
- **WHEN** the resource is cloned
- **THEN** the copy keeps the original address
- **AND** no copy of the file is made

### Requirement: A blueprint is captured only from resources the caller owns

A blueprint capture SHALL be refused unless the caller owns every resource in the set being captured.

#### Scenario: A set that includes a resource the caller does not own

- **GIVEN** a set of resources in which one resource belongs to another user
- **WHEN** the caller captures a blueprint from the set
- **THEN** the capture is refused
