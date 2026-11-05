## Purpose

A survey offered as an invite button. A webpage's invite is a page-builder node that links to the survey, and the email editor holds the same node as an MJML button. A published page becomes a survey distribution surface.

## Requirements

### Requirement: A webpage offers a survey invite as a page-builder node

The webpage editor SHALL offer a survey invite node in its Survey palette category, created with the label "Survey" and no survey bound.

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

### Requirement: The webpage editor offers no form nodes

The webpage editor SHALL offer no form nodes, so a survey invite is how a published page collects answers.

#### Scenario: Owner browses the webpage editor's nodes

- **GIVEN** the webpage editor is open
- **WHEN** the owner browses its palette
- **THEN** no form nodes are listed

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

### Requirement: An owner binds an invite to one of their published surveys from a picker

The survey invite SHALL offer only the owner's published surveys, by title. Choosing one stores that survey's id as the invite's survey.

#### Scenario: Owner binds a published survey

- **GIVEN** an owner with a published survey and an unbound survey invite on a webpage
- **WHEN** the owner chooses the survey by its title
- **THEN** the invite is bound to that survey

#### Scenario: An unpublished survey is not offered

- **GIVEN** an owner with a survey that is not published
- **WHEN** the owner opens the survey picker of an invite
- **THEN** the unpublished survey is not among the surveys offered

#### Scenario: A bound survey is unpublished later

- **GIVEN** an invite bound to a survey the owner then unpublishes
- **WHEN** the owner opens the invite
- **THEN** the survey is shown as unpublished
- **AND** the invite keeps its bound survey

#### Scenario: No published survey to offer

- **GIVEN** an owner with no published survey
- **WHEN** the owner opens the survey picker of an invite
- **THEN** the picker says a survey must be published before it can be chosen
- **AND** no survey id is saved
