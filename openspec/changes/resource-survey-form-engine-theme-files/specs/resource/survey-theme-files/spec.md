## ADDED Requirements

### Requirement: The survey's accent and background apply to the respondent page

The respondent page SHALL draw the survey's accent colour on its primary controls and its background colour behind the survey, and a survey with neither SHALL follow the app's design style.

#### Scenario: Owner sets an accent colour

- **GIVEN** a published survey whose accent colour is a green
- **WHEN** a respondent opens the survey
- **THEN** the survey's primary controls are drawn in that green

### Requirement: A file removed from the survey is deleted

When the owner closes the editor, every file the survey uploaded and no longer references SHALL be deleted from the survey's file assets, and a file still referenced SHALL be kept.

#### Scenario: Owner removes an image question

- **GIVEN** a survey with an image question whose image the owner uploaded
- **WHEN** the owner removes the question and closes the editor
- **THEN** the image file is deleted

#### Scenario: Owner replaces the logo

- **GIVEN** a survey with an uploaded logo
- **WHEN** the owner uploads a new logo and closes the editor
- **THEN** the previous logo file is deleted
- **AND** the new logo file is kept
