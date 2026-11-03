## ADDED Requirements

### Requirement: The survey's accent and background colours apply to its respondent page

A survey's accent and background colours SHALL apply to its respondent page, and a survey that sets neither SHALL draw in the app's design style.

#### Scenario: Owner sets an accent colour

- **GIVEN** a published survey whose accent colour is a green
- **WHEN** a respondent opens the survey
- **THEN** the survey sets the accent token to that green, which its primary controls draw with

#### Scenario: A survey with no colour draws in the design style

- **GIVEN** a published survey with no accent or background colour
- **WHEN** a respondent opens the survey
- **THEN** the survey draws with the app's design style's own tokens

#### Scenario: The accent colour is applied to the preview as the library's accent token

- **GIVEN** the owner is editing a survey whose accent colour is set
- **WHEN** the owner opens the Theme tab
- **THEN** the preview draws with that accent colour, in every design style

### Requirement: The survey's progress bar and question numbering apply to the respondent page

The respondent page SHALL show the progress bar at the position the survey's progress bar setting names, and SHALL number its questions when the survey's question numbering setting is on; a survey with both settings off SHALL show neither.

#### Scenario: Owner turns on question numbering

- **GIVEN** a published survey with question numbering on
- **WHEN** a respondent opens the survey
- **THEN** each question shows its number

#### Scenario: Owner moves the progress bar to the bottom

- **GIVEN** a published survey whose progress bar is set to the bottom
- **WHEN** a respondent opens the survey
- **THEN** the progress bar is drawn below the page's questions

### Requirement: A file the survey no longer references is deleted when the editor closes

When the owner closes the editor, the survey's files that its document no longer references SHALL be deleted from the survey's file assets.

#### Scenario: Owner removes an image question

- **GIVEN** a survey with an image question whose picture was in the survey when the editor opened
- **WHEN** the owner removes the question and closes the editor
- **THEN** the picture's file is deleted

#### Scenario: Owner replaces the logo

- **GIVEN** a survey with an uploaded logo
- **WHEN** the owner uploads a new logo and closes the editor
- **THEN** the previous logo file is deleted
- **AND** the new logo file is kept

#### Scenario: Owner uploads a picture and removes it before closing

- **GIVEN** a survey with no pictures
- **WHEN** the owner uploads a picture, removes it from the survey and closes the editor
- **THEN** the uploaded picture's file is deleted

### Requirement: A picked file is validated before it is uploaded

A picked file SHALL be validated before it is uploaded.

#### Scenario: An empty file is rejected before the upload

- **GIVEN** an empty file
- **WHEN** the owner picks the file for an upload
- **THEN** the file is rejected
- **AND** nothing is uploaded
