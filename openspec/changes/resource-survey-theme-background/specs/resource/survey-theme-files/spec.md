## ADDED Requirements

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
