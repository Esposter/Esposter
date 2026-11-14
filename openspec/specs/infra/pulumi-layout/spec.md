## Purpose

How Esposter's Cloudflare resources and GitHub settings are declared in Pulumi: one resource per file, folders by resource type, names built by one function, and a single prod stack for both environments.

## Requirements

### Requirement: Resources are declared, never created by hand

Every Cloudflare resource the platform runs and every GitHub repository setting SHALL be declared as code for the single prod stack, so that no resource exists only as a dashboard setting.

#### Scenario: A resource created in the dashboard without a declaration

- **GIVEN** a live Cloudflare resource that has no declaration
- **WHEN** the infrastructure is previewed
- **THEN** the resource is reported as drift to be imported and declared, or deleted

#### Scenario: Development and production share one stack

- **GIVEN** the development and production resources
- **WHEN** the infrastructure is deployed
- **THEN** both are declared under the one prod stack

### Requirement: One resource per declaration file

Each Cloudflare resource SHALL be declared in its own file, named after that resource in camel case.

#### Scenario: Reviewing a declaration file

- **GIVEN** any declaration file
- **WHEN** a reviewer reads it
- **THEN** it declares exactly one resource

#### Scenario: A second resource added to an existing file

- **GIVEN** a file that already declares a resource
- **WHEN** another resource is added to the infrastructure
- **THEN** it is declared in a file of its own

### Requirement: Declaration folders follow the resource type

The folder holding a resource's declaration SHALL be named for the Cloudflare resource type it declares.

#### Scenario: Locating a bucket's declaration

- **GIVEN** a bucket named in the dashboard
- **WHEN** a person looks for its declaration
- **THEN** the declaration sits in the folder for buckets

### Requirement: Resource names come from one function

Every resource's name SHALL be built by the same function the Workers use to name it, so that a resource and the code that names it always agree.

#### Scenario: A stateful resource declared for the first time

- **GIVEN** a new stateful resource
- **WHEN** it is declared
- **THEN** its name is the one the Workers compute for it

#### Scenario: Renaming a stateful resource

- **GIVEN** a stateful resource already in place
- **WHEN** its name changes
- **THEN** its data moves with it, so the rename is treated as a data move rather than a relabel

### Requirement: Resources that name a Worker wait for the Worker

A queue consumer or a custom domain SHALL be declared only after the Worker it names exists.

#### Scenario: The first apply of a new environment

- **GIVEN** an environment whose Workers have not been deployed
- **WHEN** its first apply runs
- **THEN** its queue consumers and custom domains are left out until the Workers are deployed

### Requirement: GitHub settings are declared apart from Cloudflare

The repository's GitHub settings SHALL be declared under their own provider, separate from the Cloudflare resources.

#### Scenario: A GitHub setting declared in the infrastructure

- **GIVEN** a repository setting such as a collaborator, label, environment or ruleset
- **WHEN** it is declared
- **THEN** it is declared under the GitHub provider rather than among the Cloudflare resources

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
