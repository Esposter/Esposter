## ADDED Requirements

### Requirement: A note accepts an image from its menu, by paste or by drop

A note SHALL accept an image added from its menu, by paste, or by drop onto the note.

#### Scenario: Choosing an image from the menu adds it to the note

- **GIVEN** a note open in the editor
- **WHEN** the owner chooses Image from the menu and picks an image file
- **THEN** the image appears in the note

#### Scenario: Pasting an image adds it to the note

- **GIVEN** a note open in the editor
- **WHEN** the owner pastes an image
- **THEN** the image appears in the note

#### Scenario: Dropping an image file onto the note adds it

- **GIVEN** a note open in the editor
- **WHEN** the owner drops an image file onto the note
- **THEN** the image appears in the note

#### Scenario: An image over the storage quota is refused

- **GIVEN** an owner whose storage quota has no room for the image's size
- **WHEN** the owner adds an image to a note
- **THEN** the upload is refused
- **AND** the note gains no image

### Requirement: An image is stored at an address that outlives the editor

An image added to a note SHALL be stored at a stable resource address, so the note shows the image again after it is saved and reopened.

#### Scenario: An added image still shows after the note is saved and reopened

- **GIVEN** a note with an added image
- **WHEN** the owner saves the note and reopens it
- **THEN** the image is shown in the note

### Requirement: An image takes its alt text from a popover

An image in a note SHALL take its alt text from a popover opened on the selected image.

#### Scenario: Setting alt text from the image popover

- **GIVEN** an image selected in a note
- **WHEN** the owner opens Alt text from the image's menu and enters Quarterly chart
- **THEN** the image's alt text becomes Quarterly chart
- **AND** the published page's copy of the image carries that alt text

### Requirement: A published note shows only images from resource storage

A published note SHALL show an image only when its address is a resource asset address, and SHALL drop any other image.

#### Scenario: A published note shows its own image

- **GIVEN** a published note holding an image from resource storage
- **WHEN** a reader opens the published note
- **THEN** the image is shown

#### Scenario: A published note drops an image from another site

- **GIVEN** a published note holding an image whose address is on another site
- **WHEN** a reader opens the published note
- **THEN** the image is not shown

### Requirement: An image renders no wider than the column

An image in a note SHALL render at its natural size, capped at the width of the column.

#### Scenario: A wide image is capped at the column width

- **GIVEN** an image wider than the note's column
- **WHEN** the note is viewed
- **THEN** the image is shown at the column width
