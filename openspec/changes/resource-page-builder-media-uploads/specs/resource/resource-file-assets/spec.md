## ADDED Requirements

### Requirement: The owner lists the files a resource holds, filtered to a kind

The owner SHALL list the files a resource holds, filtered to the kind a field takes, to choose one from.

#### Scenario: The picker lists the files the resource holds

- **GIVEN** a webpage holding two uploaded images
- **WHEN** the owner opens the image picker of the page
- **THEN** the picker lists both images

#### Scenario: A video picker lists videos alone

- **GIVEN** a webpage holding an uploaded image and an uploaded video
- **WHEN** the owner opens the video picker of the page
- **THEN** the picker lists the video
- **AND** it does not list the image

#### Scenario: A resource the owner does not hold lists no files

- **GIVEN** a webpage that belongs to another owner
- **WHEN** the owner asks for the files that webpage holds
- **THEN** the request is refused as if the resource did not exist
