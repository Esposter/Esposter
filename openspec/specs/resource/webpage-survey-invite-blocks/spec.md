## Purpose

The owner's published surveys offered as drag-in invite-button blocks in both GrapesJS editors — a published webpage becomes a survey distribution surface.

## Requirements

### Requirement: Only published surveys are offered as invite blocks

The webpage and email editors SHALL offer the owner's published surveys as invite-button blocks, and SHALL NOT offer a survey that is still a draft.

#### Scenario: Draft survey

- **GIVEN** a survey still in draft
- **WHEN** the owner opens the editor's blocks
- **THEN** no invite block for that survey is offered

#### Scenario: Published survey

- **GIVEN** a published survey
- **WHEN** the owner opens the editor's blocks
- **THEN** an invite block for that survey is offered

### Requirement: An invite block links to the survey's public page

An invite block SHALL be a button that links to the survey's public page.

#### Scenario: Visitor clicks an invite button

- **GIVEN** a published webpage with a survey invite block
- **WHEN** a visitor clicks the button
- **THEN** the visitor opens the survey's public page

### Requirement: Invite blocks follow the survey list

The survey invite blocks SHALL update when the editor changes or the owner's survey list changes.

#### Scenario: Survey published while the editor is open

- **GIVEN** the editor is open
- **WHEN** the owner publishes a survey
- **THEN** its invite block is offered without reopening the editor

### Requirement: Survey names are shown as text

A survey name in an invite block SHALL be shown as text, so markup in the name does not run.

#### Scenario: Survey name with markup characters

- **GIVEN** a survey whose name contains markup characters
- **WHEN** its invite block is shown
- **THEN** the name appears as literal text

### Requirement: A webpage invite carries no per-visitor identity

A webpage invite block SHALL link to the plain public survey address, with no token identifying the visitor.

#### Scenario: Visitor clicks an invite on a published page

- **GIVEN** a published webpage with a survey invite block
- **WHEN** a visitor clicks the button
- **THEN** the visitor opens the plain public survey address

### Requirement: The webpage editor offers no form blocks

The webpage editor SHALL offer no form blocks, so a survey invite block is how a published page collects answers.

#### Scenario: Owner browses the webpage editor's blocks

- **GIVEN** the webpage editor is open
- **WHEN** the owner browses its blocks
- **THEN** no form blocks are listed

### Requirement: Surveys are not embedded inline

A published webpage SHALL NOT embed a survey inline, and SHALL offer a button to the survey instead.

#### Scenario: Owner adds a survey to a webpage

- **GIVEN** the owner adds a survey to a webpage
- **WHEN** the page is published
- **THEN** the survey appears as a button
- **AND** no survey form is embedded in the page
