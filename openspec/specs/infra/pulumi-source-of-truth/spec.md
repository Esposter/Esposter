## Purpose

The Function Apps' runtime app settings are managed in Pulumi rather than set by hand in the portal.

## Requirements

### Requirement: Runtime settings are declared in code

Each Function App's runtime settings SHALL be declared in the infrastructure code rather than set by hand in the portal.

#### Scenario: Setting added in the portal

- **GIVEN** a setting was added to a Function App in the portal
- **WHEN** the next deploy runs
- **THEN** the setting is removed because it is not declared

### Requirement: Secret settings come from the secrets environment

Secret settings SHALL come from the secrets environment, and no secret value SHALL appear in the code.

#### Scenario: Deploy reads secret settings

- **GIVEN** a Function App declares secret settings
- **WHEN** a deploy runs
- **THEN** the secret values are read from the secrets environment
- **AND** no secret value is written in the code

### Requirement: Declared settings replace the live settings

The declared settings list SHALL replace the live list, so a live setting the declaration omits is removed by the next deploy.

#### Scenario: Adding or removing a setting

- **GIVEN** a setting is to be added or removed from the declaration
- **WHEN** the change is prepared
- **THEN** the live settings are compared with the declared list first

### Requirement: Deploys run from a package with no shared access signature

The Function Apps SHALL run from a package URL that carries no shared access signature, and deployment SHALL NOT change app settings.

#### Scenario: Deployment writes a package

- **GIVEN** a Function App runs from a package URL
- **WHEN** a deployment happens
- **THEN** a package blob is written
- **AND** no app setting is changed

### Requirement: Content-share settings are not declared

The declared settings SHALL NOT include the consumption-plan content-share settings, and the app SHALL use identity-based storage access instead.

#### Scenario: Restart after declaration

- **GIVEN** the declared settings omit the content-share settings
- **WHEN** the app restarts
- **THEN** the host starts with identity-based storage access

### Requirement: Imported apps are adopted in place

Imported Function App resources SHALL be protected from replacement and adopted in place, so that adoption updates their settings rather than recreating them.

#### Scenario: Adoption deploy

- **GIVEN** a Function App resource was imported
- **WHEN** the adopting deploy runs
- **THEN** the resource is updated in place
- **AND** it is not recreated
