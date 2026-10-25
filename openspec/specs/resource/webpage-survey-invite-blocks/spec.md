## Purpose

A survey offered as an invite button. A webpage's invite is a page-builder node that links to the survey, and the email editor holds the same node as an MJML button. A published page becomes a survey distribution surface.

## Requirements

### Requirement: A webpage offers a survey invite as a page-builder node

The webpage editor SHALL offer a survey invite node in its Survey palette category, created with the label "Survey" and no survey bound. The owner binds a survey by its id, since no picker lists the owner's published surveys yet.

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

### Requirement: An email survey invite is a button to the survey

An email survey invite SHALL be a button that links to its bound survey's public page, at the absolute address of the origin the email is compiled for.

#### Scenario: Recipient clicks an invite in a sent email

- **GIVEN** an email with a survey invite bound to a survey
- **WHEN** the recipient clicks the button
- **THEN** the recipient opens the plain public address of that survey

### Requirement: An email survey invite shows its label as escaped text

An email survey invite SHALL show its label as the button's text, escaped, so markup in the label does not run.

#### Scenario: Label with markup characters in an email

- **GIVEN** an email survey invite whose label contains markup characters
- **WHEN** the email is compiled
- **THEN** the label appears as literal text
