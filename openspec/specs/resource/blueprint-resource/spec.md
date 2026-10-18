## Purpose

A parameterized, executable manifest of resources — deploy one Blueprint and get a fully wired set of resources with all the right settings and cross-references. Deploying is all-or-nothing on a best-effort basis, and a deployed set never changes when its blueprint is edited afterwards.

## Requirements

### Requirement: Deploying a blueprint creates its entries as wired resources

The owner SHALL be able to deploy a blueprint with parameter values, which creates every entry as a resource and links the entries that refer to one another.

#### Scenario: Deploying creates one resource per entry

- **GIVEN** a blueprint with several entries and no parameters
- **WHEN** the owner deploys it
- **THEN** each entry is created as a resource with its name and content
- **AND** the deploy result lists each entry's alias beside the resource it created

#### Scenario: An entry that refers to another entry binds to the created resource

- **GIVEN** a dashboard entry refers to a sheet entry by its alias
- **WHEN** the owner deploys the blueprint
- **THEN** the dashboard binds to the sheet resource that was created in the same deploy

### Requirement: Parameter values fill names and content

The system SHALL replace each parameter token with the value given at deploy time, in every entry name and content string.

#### Scenario: A parameter fills an entry name

- **GIVEN** an entry name contains a parameter token for "client"
- **WHEN** the owner deploys with the value "Acme"
- **THEN** the created resource is named with "Acme" in place of the token

#### Scenario: An undeclared parameter is left as its literal text

- **GIVEN** an entry contains a parameter token that the blueprint does not declare
- **WHEN** the owner deploys it
- **THEN** the token is kept as its literal text in the created resource
- **AND** the deploy dialog marks that row without blocking the deploy

#### Scenario: An empty entry name blocks deploy

- **GIVEN** a parameter value leaves an entry's name empty
- **WHEN** the owner opens the deploy dialog
- **THEN** Deploy is disabled
- **AND** the row for that entry says the name is empty

### Requirement: An invalid manifest is rejected before anything is created

The system SHALL validate every entry before creating any resource, and SHALL reject the whole deploy when any entry is invalid, when references form a cycle, or when a reference names no entry.

#### Scenario: An entry whose content fails its type's rules rejects the deploy

- **GIVEN** one entry's content would be rejected by its resource type's own rules
- **WHEN** the owner deploys the blueprint
- **THEN** the deploy is rejected
- **AND** no resource is created

#### Scenario: Entries that refer to each other in a cycle are rejected

- **GIVEN** two entries each refer to the other
- **WHEN** the owner deploys the blueprint
- **THEN** the deploy is rejected and nothing is created

#### Scenario: A reference to an unknown entry is rejected

- **GIVEN** an entry refers to an alias that no entry declares
- **WHEN** the owner deploys the blueprint
- **THEN** the deploy is rejected and nothing is created

### Requirement: A failed deploy removes what it already created

The system SHALL remove the resources a deploy already created when a later step fails, so that a failed deploy leaves no partial set behind on a best-effort basis.

#### Scenario: A failure part-way through removes earlier resources

- **GIVEN** a deploy has created some of its entries
- **WHEN** a later entry fails to create
- **THEN** the entries created so far are removed
- **AND** the owner is told the deploy failed

### Requirement: An entry without content deploys with no content

The system SHALL create an entry that has no content as a resource with no content, and SHALL NOT fail the deploy for it.

#### Scenario: A content-less entry deploys empty

- **GIVEN** a blueprint entry has no content
- **WHEN** the owner deploys it
- **THEN** the created resource has no content
- **AND** the rest of the deploy succeeds

### Requirement: A blueprint entry that is itself a blueprint is created, not deployed

The system SHALL create an entry of the blueprint type as a child blueprint with its manifest intact, and SHALL NOT deploy the child blueprint's entries as part of the outer deploy.

#### Scenario: A nested blueprint is created but not deployed

- **GIVEN** a blueprint has an entry whose type is blueprint
- **WHEN** the owner deploys the outer blueprint
- **THEN** a child blueprint resource is created with that entry's manifest
- **AND** the child's own entries are not created

#### Scenario: A nested blueprint's tokens are left for the child

- **GIVEN** a nested blueprint's content contains its own parameter and entry tokens
- **WHEN** the outer blueprint is deployed
- **THEN** those tokens are not filled or rewired by the outer deploy

### Requirement: Deployed resources are independent of their blueprint

The system SHALL NOT change a deployed resource when its blueprint is edited afterwards.

#### Scenario: Editing a blueprint leaves past deploys unchanged

- **GIVEN** a blueprint was deployed once
- **WHEN** the owner edits that blueprint's manifest and saves it
- **THEN** the resources from the earlier deploy keep their content

### Requirement: The manifest is edited and saved explicitly

The Editor SHALL save the manifest only when the owner saves it, and SHALL ask before leaving with unsaved text.

#### Scenario: Leaving with unsaved changes asks first

- **GIVEN** the owner has changed the manifest text without saving
- **WHEN** they try to leave the Editor
- **THEN** they are asked whether to keep or discard the change

#### Scenario: Deploy runs only the saved manifest

- **GIVEN** the manifest text on screen has changes not yet saved
- **WHEN** the owner looks at the Deploy command
- **THEN** Deploy is disabled until the text is saved

### Requirement: A deploy shows every resource it will create before it runs

The deploy dialog SHALL list each entry under the name it will be created with, updating as the parameter fields change.

#### Scenario: The review list updates with parameter values

- **GIVEN** the deploy dialog is open with a parameter field
- **WHEN** the owner changes the parameter value
- **THEN** each entry's listed name updates to match
