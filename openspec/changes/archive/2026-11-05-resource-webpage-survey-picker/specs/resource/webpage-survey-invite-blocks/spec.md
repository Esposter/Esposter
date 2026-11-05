## MODIFIED Requirements

### Requirement: A webpage offers a survey invite as a page-builder node

The webpage editor SHALL offer a survey invite node in its Survey palette category, created with the label "Survey" and no survey bound.

#### Scenario: Owner drops a survey invite

- **GIVEN** the webpage editor is open
- **WHEN** the owner drops a survey invite from the Survey category
- **THEN** the node is created labelled "Survey" with no survey bound

## ADDED Requirements

### Requirement: An owner binds an invite to one of their published surveys from a picker

The survey invite SHALL offer only the owner's published surveys, by title. Choosing one stores that survey's id as the invite's survey.

#### Scenario: Owner binds a published survey

- **GIVEN** an owner with a published survey and an unbound survey invite on a webpage
- **WHEN** the owner chooses the survey by its title
- **THEN** the invite is bound to that survey
- **AND** the page saves the survey as a link from the page

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
