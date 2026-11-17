# resource/survey-theme-files Specification

## Purpose

A survey's accent and background colours on its respondent page, and the survey's uploaded files, deleted when the owner closes the editor if the document no longer references them.

## Requirements

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

### Requirement: The respondent page shows the progress bar and question numbers the survey sets

The respondent page SHALL show the progress bar at the position the survey's progress bar setting names, and SHALL number its questions when the survey's question numbering setting is on; a survey with both settings off SHALL show neither.

#### Scenario: Owner turns on question numbering

- **GIVEN** a published survey with question numbering on
- **WHEN** a respondent opens the survey
- **THEN** each question shows its number

#### Scenario: Owner moves the progress bar to the bottom

- **GIVEN** a published survey whose progress bar is set to the bottom
- **WHEN** a respondent opens the survey
- **THEN** the progress bar is drawn below the page's questions

### Requirement: The Theme tab sets the progress bar and question numbering

The Theme tab SHALL let the owner choose where the progress bar is drawn, or none, and turn question numbering on or off.

#### Scenario: Owner sets the progress bar on the Theme tab

- **GIVEN** the owner is editing a survey whose progress bar is off
- **WHEN** the owner chooses the bottom of the survey for the progress bar
- **THEN** the survey's progress bar is set to the bottom

#### Scenario: Owner turns on question numbers on the Theme tab

- **GIVEN** the owner is editing a survey with question numbers off
- **WHEN** the owner turns question numbers on
- **THEN** the survey's question numbers are on, and the Theme tab shows them on

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

#### Scenario: A picture still uploading when the owner closes the editor is deleted

- **GIVEN** a survey with no pictures, and a picture for an image question still uploading
- **WHEN** the owner closes the editor before the upload finishes
- **THEN** the picture's file is deleted as it lands

### Requirement: A picked file is validated before it is uploaded

A picked file SHALL be validated before it is uploaded.

#### Scenario: An empty file is rejected before the upload

- **GIVEN** an empty file
- **WHEN** the owner picks the file for an upload
- **THEN** the file is rejected
- **AND** nothing is uploaded

### Requirement: The Theme tab sets the survey's background picture

The Theme tab SHALL let the owner upload a background picture for the survey and remove it, as it does the logo.

#### Scenario: Owner uploads a background picture on the Theme tab

- **GIVEN** the owner is editing a survey with no background picture
- **WHEN** the owner picks a picture for the background
- **THEN** the survey's background picture is that picture

#### Scenario: Owner removes the background picture

- **GIVEN** the owner is editing a survey whose background picture is set
- **WHEN** the owner removes the background picture
- **THEN** the survey has no background picture

#### Scenario: A rejected background picture leaves the survey unchanged

- **GIVEN** the owner is editing a survey with no background picture
- **WHEN** the owner picks a file that fails validation for the background
- **THEN** the file is rejected with an alert
- **AND** the survey still has no background picture

### Requirement: The respondent page and the Theme tab preview draw the background picture

The respondent page and the Theme tab's preview SHALL draw the survey's background picture behind their content, over its background colour.

#### Scenario: A background picture is drawn behind the respondent page's questions

- **GIVEN** a published survey with a background picture
- **WHEN** a respondent opens the survey
- **THEN** the picture fills the page behind the survey's questions

#### Scenario: A survey without a background picture draws its colour alone

- **GIVEN** a published survey with a background colour and no background picture
- **WHEN** a respondent opens the survey
- **THEN** the page draws the background colour and no picture

#### Scenario: The Theme tab preview draws the picture as the respondent page does

- **GIVEN** the owner is editing a survey with a background picture
- **WHEN** the owner opens the Theme tab
- **THEN** the preview draws the picture behind its content, as the respondent page does
