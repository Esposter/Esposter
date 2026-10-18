## Purpose

The standard for serving tabular data — contract, DatasetProvider capability, row cap.

## Requirements

### Requirement: Every product reads tabular data through one dataset contract

Every product that reads another product's tabular data SHALL read it through the one dataset contract, never through its own product-specific reads.

#### Scenario: A dashboard tile reads its bound rows through the contract

- **GIVEN** a dashboard tile is bound to survey responses
- **WHEN** the dashboard loads
- **THEN** the tile reads its rows through the shared dataset read

#### Scenario: An email merge field or an import reads the same way

- **GIVEN** an email merge field or a sheet import needs rows
- **WHEN** it reads them
- **THEN** it uses the same shared dataset read

### Requirement: A dataset reference resolves only to a resource its caller owns

A dataset reference SHALL resolve only to a resource the caller owns, and every other reference SHALL read as missing.

#### Scenario: A reference to a deleted source reads as missing

- **GIVEN** a binding's source resource is in the recycle bin
- **WHEN** the dashboard reads the binding
- **THEN** the reader sees a message that the source is missing
- **AND** the message offers to pick another source or restore this one

#### Scenario: A reference to another person's resource answers the same way

- **GIVEN** a reference points to a resource another person owns
- **WHEN** the reference is read
- **THEN** the answer is the same as for a deleted source
- **AND** nothing about the other person's resource is revealed

#### Scenario: A restored source heals the binding without changing it

- **GIVEN** a binding's source was deleted and then restored
- **WHEN** the consumer next reads its reference
- **THEN** the dataset loads again
- **AND** the stored reference is unchanged

### Requirement: A dataset holds at most the fixed row cap and reports truncation only when it knows

A dataset SHALL carry at most the fixed row cap, and SHALL report truncation only when it knows the uncapped total and the rows shown are fewer.

#### Scenario: A source over the cap shows a truncation warning

- **GIVEN** a source has more rows than the cap
- **WHEN** the dataset is read
- **THEN** the dataset carries the rows up to the cap
- **AND** the reader sees a truncation warning

#### Scenario: A source that cannot be counted never warns

- **GIVEN** a source whose total cannot be counted cheaply
- **WHEN** the dataset is read
- **THEN** no truncation warning appears

#### Scenario: A source under the cap shows every row without a warning

- **GIVEN** a source has fewer rows than the cap
- **WHEN** the dataset is read
- **THEN** every row is shown
- **AND** no truncation warning appears

### Requirement: An import copies rows once while a binding keeps its reference

An import SHALL copy a dataset's rows once, while a binding SHALL keep its reference and read the current rows when it loads.

#### Scenario: An imported sheet keeps its copy when the source changes

- **GIVEN** a sheet imported its rows from a source
- **WHEN** the source later changes
- **THEN** the sheet's copied rows are unchanged

#### Scenario: A bound tile shows current rows on load

- **GIVEN** a dashboard tile is bound to a source
- **WHEN** the source changes and the dashboard loads
- **THEN** the tile shows the current rows

### Requirement: A dataset is read on load and on refresh, never live

A dataset SHALL be read when its view loads and when the reader asks for a refresh, never as a live subscription.

#### Scenario: A view keeps its rows until the reader refreshes

- **GIVEN** a view is showing a dataset
- **WHEN** the source changes
- **THEN** the view keeps its rows
- **AND** the view updates only when the reader refreshes it

### Requirement: Public viewers see datasets as they were at publishing

A published resource SHALL show the datasets it held at publish time to public viewers, who SHALL NOT read datasets live.

#### Scenario: A public viewer sees the publish-time data

- **GIVEN** a dashboard was published with its data
- **WHEN** the source changes and a public viewer opens the dashboard
- **THEN** the viewer sees the data as it was at publishing

### Requirement: A declared provider must be registered

A resource type SHALL serve datasets only through a provider registered for it, and a declared provider with no registration SHALL fail the typecheck.

#### Scenario: A declared but unregistered provider fails the typecheck

- **GIVEN** a resource type declares a dataset provider
- **WHEN** no provider is registered for that type
- **THEN** the typecheck fails
