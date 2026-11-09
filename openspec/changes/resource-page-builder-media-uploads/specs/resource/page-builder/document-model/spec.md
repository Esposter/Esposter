## ADDED Requirements

### Requirement: A webpage image takes an uploaded file before its address

A webpage image SHALL take a file the owner uploads, offered before its address field, and the uploaded file's address SHALL be the image's source.

#### Scenario: Uploading an image sets the image source

- **GIVEN** a webpage image with no source
- **WHEN** the owner uploads an image file to it
- **THEN** the image shows the uploaded file
- **AND** the image's source is the uploaded file's address

#### Scenario: A failed upload leaves the image unchanged

- **GIVEN** a webpage image with a source
- **WHEN** the owner uploads a file and the upload is refused for storage
- **THEN** the image keeps its source
- **AND** the refusal is shown

#### Scenario: A file that is not an image is refused before upload

- **GIVEN** a webpage image
- **WHEN** the owner chooses a file that is not an image
- **THEN** no upload starts
- **AND** the image keeps its source

#### Scenario: Choosing a listed image sets the image source

- **GIVEN** a webpage image and an uploaded image the page already holds
- **WHEN** the owner chooses that image from the picker
- **THEN** the image's source is that image's address

### Requirement: A webpage video takes an uploaded file within the upload limit

A webpage video SHALL take a file the owner uploads, and the uploaded file's address SHALL be the video's source, within the size limit an upload takes.

#### Scenario: Uploading a video sets the video source

- **GIVEN** a webpage video with no source
- **WHEN** the owner uploads a video file to it
- **THEN** the video's source is the uploaded file's address

#### Scenario: A video over the upload size limit is refused

- **GIVEN** a webpage video with a source
- **WHEN** the owner uploads a video file larger than the upload size limit
- **THEN** the upload is refused with the size limit shown
- **AND** the video keeps its source

#### Scenario: Choosing a listed video sets the video source

- **GIVEN** a webpage video and an uploaded video the page already holds
- **WHEN** the owner chooses that video from the picker
- **THEN** the video's source is that video's address
