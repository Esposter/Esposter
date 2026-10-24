## Purpose

The owner's published surveys offered as invite buttons. A webpage's invite is a page-builder node that links to the survey; the email editor's invite is a GrapesJS block until the email cutover. A published page becomes a survey distribution surface.

## Requirements

### Requirement: A webpage offers a survey invite as a page-builder node

The webpage editor SHALL offer a survey invite node in its Survey palette category, created with the label "Survey" and no survey bound until the owner picks one.

#### Scenario: Owner drops a survey invite

- **GIVEN** the webpage editor is open
- **WHEN** the owner drops a survey invite from the Survey category
- **THEN** the node is created labelled "Survey" with no survey bound

### Requirement: A webpage invite links to the survey's public page

A webpage invite SHALL be a button that links to its bound survey's public page, at the absolute address of the origin the page is published from.

#### Scenario: Visitor clicks an invite on a published page

- **GIVEN** a published webpage with a survey invite bound to a survey
- **WHEN** a visitor clicks the button
- **THEN** the visitor opens the plain public address of that survey

### Requirement: A webpage invite shows its label as text

A webpage invite SHALL show its label as the button's text, and SHALL NOT render the survey's name, so markup in the label does not run.

#### Scenario: Label with markup characters

- **GIVEN** a webpage invite whose label contains markup characters
- **WHEN** the page is rendered
- **THEN** the label appears as literal text

### Requirement: A webpage invite carries no per-visitor identity

A webpage invite SHALL link to the plain public survey address, with no token identifying the visitor.

#### Scenario: Visitor clicks an invite on a published page

- **GIVEN** a published webpage with a survey invite
- **WHEN** a visitor clicks the button
- **THEN** the visitor opens the plain public survey address

### Requirement: The webpage editor offers no form nodes

The webpage editor SHALL offer no form nodes, so a survey invite is how a published page collects answers.

#### Scenario: Owner browses the webpage editor's nodes

- **GIVEN** the webpage editor is open
- **WHEN** the owner browses its palette
- **THEN** no form nodes are listed

### Requirement: Surveys are not embedded inline

A published webpage SHALL NOT embed a survey inline, and SHALL offer a button to the survey instead.

#### Scenario: Owner adds a survey to a webpage

- **GIVEN** the owner adds a survey to a webpage
- **WHEN** the page is published
- **THEN** the survey appears as a button
- **AND** no survey form is embedded in the page

### Requirement: The email editor offers only published surveys

The email editor SHALL offer the owner's published surveys as invite blocks, and SHALL NOT offer a survey that is still a draft.

#### Scenario: Draft survey

- **GIVEN** a survey still in draft
- **WHEN** the owner opens the email editor's blocks
- **THEN** no invite block for that survey is offered

#### Scenario: Published survey

- **GIVEN** a published survey
- **WHEN** the owner opens the email editor's blocks
- **THEN** an invite block for that survey is offered

### Requirement: The email editor reads the survey list once the session is available

The email editor SHALL read the owner's survey list when the owner's session becomes available, and SHALL NOT re-read it while the editor is open.

#### Scenario: Survey published while the email editor is open

- **GIVEN** the email editor is open
- **WHEN** the owner publishes a survey
- **THEN** the survey is not offered until the editor is opened again

### Requirement: An email invite block shows the survey's name as escaped text

An email invite block SHALL show the survey's name as escaped text, so markup in the name does not run.

#### Scenario: Survey name with markup characters

- **GIVEN** a published survey whose name contains markup characters
- **WHEN** its invite block is offered
- **THEN** the name appears as literal text
