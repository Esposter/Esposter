## Purpose

How Esposter's Azure resources are managed in Pulumi — one resource per file, ARM-aligned source paths, a single prod stack, and a GitHub provider alongside Azure.

## Requirements

### Requirement: Resources are declared, never created by hand

Every Azure resource the platform runs SHALL be declared as code for the single prod stack, so that no resource exists only as a portal setting.

#### Scenario: A resource created in the portal without a declaration

- **GIVEN** a live Azure resource that has no declaration
- **WHEN** the infrastructure is previewed
- **THEN** the resource is reported as drift to be imported and declared, or deleted

#### Scenario: Development and production share one stack

- **GIVEN** the development and production resource groups
- **WHEN** the infrastructure is deployed
- **THEN** both groups are declared under the one prod stack

### Requirement: One resource per declaration file

Each Azure resource SHALL be declared in its own file, named after that resource in camel case.

#### Scenario: Reviewing a declaration file

- **GIVEN** any declaration file
- **WHEN** a reviewer reads it
- **THEN** it declares exactly one resource

#### Scenario: A second resource added to an existing file

- **GIVEN** a file that already declares a resource
- **WHEN** another resource is added to the infrastructure
- **THEN** it is declared in a file of its own

### Requirement: Declaration paths follow Azure resource identifiers

The location of each resource's declaration SHALL mirror its Azure resource identifier, so that a resource found in the Azure portal shows where its declaration lives.

#### Scenario: Locating a declaration from a portal resource

- **GIVEN** a resource identifier copied from the Azure portal
- **WHEN** a person looks for its declaration
- **THEN** the declaration sits under the provider namespace and resource type that the identifier names

### Requirement: Imported resources are protected from deletion

Every imported Azure resource SHALL be protected, so that a bad change cannot delete live infrastructure.

#### Scenario: A change that would delete a protected resource

- **GIVEN** an imported resource marked protected
- **WHEN** a change would delete it
- **THEN** the deletion is refused and the resource stays in place

### Requirement: GitHub settings are declared apart from Azure

The repository's GitHub settings SHALL be declared under their own provider, separate from the Azure resources.

#### Scenario: A GitHub setting declared in the infrastructure

- **GIVEN** a repository setting such as a collaborator, label, environment or ruleset
- **WHEN** it is declared
- **THEN** it is declared under the GitHub provider rather than among the Azure resources

### Requirement: Resource names follow the naming convention from declaration

Every dev and production resource SHALL be named under the CAF-aligned naming convention with its parent hierarchy, applied when the resource is first declared.

#### Scenario: A stateful resource declared for the first time

- **GIVEN** a new stateful resource
- **WHEN** it is declared
- **THEN** its name already follows the naming convention

#### Scenario: Renaming a stateful resource

- **GIVEN** a stateful resource already in place
- **WHEN** its name changes
- **THEN** its data moves with it, so the rename is treated as a data move rather than a relabel

### Requirement: Function App settings are declared with the app

Each Function App's runtime settings SHALL be declared with the app, so that no deployed setting exists only in the portal.

#### Scenario: A runtime setting of a deployed app

- **GIVEN** a deployed Function App
- **WHEN** its runtime settings are read
- **THEN** every setting is one the app's declaration states

### Requirement: The subscription policy assignment is protected and renamed only by operator step

The subscription policy assignment SHALL be protected, so that a rename needs an operator step before the change can apply.

#### Scenario: Renaming the policy assignment without the operator step

- **GIVEN** the protected policy assignment
- **WHEN** its name changes and no operator step has run
- **THEN** the update aborts on the protected resource and nothing else in the same change lands

### Requirement: The search index schema is recreated from its data file

The Azure AI Search index schema SHALL be recreated from its data file rather than managed as a declared resource.

#### Scenario: Recreating the search index

- **GIVEN** the index schema data file
- **WHEN** the search index is recreated
- **THEN** its schema is taken from that file

### Requirement: GitHub defaults are declared rather than left to the settings page

The repository's Actions defaults and its automatic dependency pull requests SHALL be declared in code, so that a click on the settings page cannot change them without a diff.

#### Scenario: The default token permission for a workflow

- **GIVEN** a workflow that declares no permissions of its own
- **WHEN** a job runs
- **THEN** the job is handed read-only token permission

#### Scenario: Automatic dependency pull requests from a second bot

- **GIVEN** the repository's dependency bot settings
- **WHEN** a dependency is out of date
- **THEN** the second bot opens no pull request against the main branch
