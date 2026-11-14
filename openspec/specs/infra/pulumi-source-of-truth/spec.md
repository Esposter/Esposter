## Purpose

The Workers' variables and secrets are declared in the repository and written by the deploy, not set by hand in a dashboard.

## Requirements

### Requirement: Worker variables are declared in code

Each Worker's variables SHALL be declared in the repository, where its configuration is generated, so that a deploy writes them from the repository.

#### Scenario: The web Worker's variables come from its configuration

- **GIVEN** a variable whose value an environment's name fixes, such as the base URL
- **WHEN** the web Worker's wrangler configuration is generated
- **THEN** the variable carries the value that environment declares

### Requirement: Secret values come from the secrets environment

Each Worker's secrets SHALL be listed in the repository and their values SHALL be read from the secrets environment at deploy, and no secret value SHALL appear in the code.

#### Scenario: Deploy writes a Worker's secrets

- **GIVEN** a Worker's secrets listed in the worker secrets file
- **WHEN** the deploy job runs after the Worker is deployed
- **THEN** each secret's value is read from the secrets environment and written to that Worker
- **AND** no secret value is written in the code
