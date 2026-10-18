## Purpose

Preset and uploaded call backgrounds — fixed per-user blob slots, a persisted selection, and a resolution that degrades to no background.

## Requirements

### Requirement: A reader chooses a background from presets or their own uploads

A reader SHALL be able to choose a background from the built-in presets or from their own uploaded images, up to a fixed number of uploads per reader.

#### Scenario: Uploading an image fills a saved background

- **GIVEN** the reader opens the background grid
- **WHEN** they upload an image into a saved background position
- **THEN** the image appears in the grid as a choice

#### Scenario: Re-uploading replaces the image in that position

- **GIVEN** a saved background position already holds an image
- **WHEN** the reader uploads a new image into that position
- **THEN** the new image replaces the old one

#### Scenario: Oversized image is refused

- **GIVEN** the reader selects an image larger than the allowed size
- **WHEN** the upload is attempted
- **THEN** the upload is refused before anything is stored

#### Scenario: Stored image over the size limit is dropped

- **GIVEN** a saved background image is over the allowed size
- **WHEN** the reader opens the background grid
- **THEN** that image is not offered as a choice
- **AND** its stored copy is removed

### Requirement: Uploaded backgrounds are visible only to their uploader

An uploaded background SHALL be fetched only by the reader who uploaded it, and other participants SHALL see only the result of applying it.

#### Scenario: Other participants see the composited result only

- **GIVEN** a reader applies one of their uploaded backgrounds to their camera
- **WHEN** another participant views the call
- **THEN** that participant sees the reader's camera with the background applied
- **AND** the uploaded image itself is never shown to them

### Requirement: The reader's chosen background is remembered

The background a reader chooses SHALL be remembered across calls and sessions.

#### Scenario: Choice applies in a later call

- **GIVEN** the reader has chosen a background
- **WHEN** they start a later call
- **THEN** the same background is applied to their camera

#### Scenario: Camera starting mid-call applies the saved choice without changing it

- **GIVEN** the reader has a saved background choice
- **WHEN** their camera starts during a call
- **THEN** the saved background is applied
- **AND** the saved choice is unchanged

### Requirement: Only the most recent background choice is remembered

When the reader makes several choices in quick succession, only the choice still in force SHALL be remembered.

#### Scenario: A slow earlier choice does not overwrite a later one

- **GIVEN** the reader picks one background and then another before the first has loaded
- **WHEN** the first background finishes loading after the second is applied
- **THEN** the call shows the second background
- **AND** the saved choice is the second background

### Requirement: A background whose image is gone falls back to no background

A saved background whose image no longer exists SHALL fall back to no background without interrupting the reader's video.

#### Scenario: Image deleted on another device

- **GIVEN** the reader's saved background was deleted on another device
- **WHEN** the reader starts a call
- **THEN** the call shows no background
- **AND** the reader's video keeps working

### Requirement: Replacing a background is not undone by a delete still in progress

Deleting a saved background SHALL NOT remove an image uploaded into the same position after that delete was requested.

#### Scenario: Re-upload before the delete completes

- **GIVEN** the reader has deleted the background in one position
- **WHEN** they upload a new image into that position before the deletion completes
- **THEN** the new image is kept

### Requirement: Browsers without background support still accept uploads

A browser without background support SHALL still store uploads and SHALL warn rather than fail when a background is applied.

#### Scenario: Applying a background in an unsupported browser

- **GIVEN** the browser does not support call backgrounds
- **WHEN** the reader applies an uploaded background
- **THEN** the upload remains stored
- **AND** the reader is warned that the background cannot be applied
