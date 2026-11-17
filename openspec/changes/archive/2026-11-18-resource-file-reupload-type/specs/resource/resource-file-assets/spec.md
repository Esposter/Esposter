## ADDED Requirements

### Requirement: A re-uploaded file takes the type its latest upload declared

When an owner uploads bytes a resource already holds, the file SHALL list the type that the latest upload declared, not the type the first upload stored.

#### Scenario: Held bytes re-uploaded as a video are listed as a video

- **GIVEN** a resource holds a file whose bytes were first stored as a generic binary
- **WHEN** the owner uploads the same bytes declaring a video type
- **THEN** the file is listed with the video type
- **AND** the video picker shows the file

#### Scenario: Held bytes re-uploaded with the same type keep it

- **GIVEN** a resource holds a file stored as an image
- **WHEN** the owner uploads the same bytes declaring an image type
- **THEN** the file is still listed as an image
