## Purpose

Client-side image thumbnails, the media viewer, per-room attachment limits, and browsing a room's attachments, all riding the shared SAS upload.

## Requirements

### Requirement: Image attachments show a preview that opens to the full image

An image attachment SHALL show a small preview in its message, and opening it SHALL show the full-resolution image.

#### Scenario: Preview shown inline

- **GIVEN** a message contains an image attachment with a preview
- **WHEN** the message is shown
- **THEN** the preview is shown inline in the message

#### Scenario: Opening the preview shows the full image

- **GIVEN** a message shows an image preview
- **WHEN** the reader opens it
- **THEN** the media viewer shows the full-resolution image

#### Scenario: Older attachment without a preview

- **GIVEN** an image attachment was uploaded before previews existed
- **WHEN** the message is shown
- **THEN** the full image is shown in place of a preview

#### Scenario: Browser cannot make a preview

- **GIVEN** the uploader's browser could not produce a preview
- **WHEN** the message is shown
- **THEN** the full image is shown in place of a preview

### Requirement: A preview whose link has expired recovers on its own

A preview that fails to load because its link has expired SHALL recover without the reader doing anything.

#### Scenario: Expired preview link is refreshed

- **GIVEN** a message's preview fails to load because its link has expired
- **WHEN** the links are refreshed
- **THEN** the preview loads
- **AND** other previews in the room keep showing as previews

### Requirement: The media viewer moves through the room's media and stops at the ends

The media viewer SHALL move through the room's images and videos with the arrow controls and arrow keys, and SHALL stop at the first and last item rather than wrapping.

#### Scenario: Moving between items with arrow keys

- **GIVEN** the media viewer is open on an image in a room
- **WHEN** the reader presses the right arrow key
- **THEN** the viewer shows the next image or video in the room

#### Scenario: Stopping at the last item

- **GIVEN** the viewer is showing the last image or video in the room
- **WHEN** the reader moves forward
- **THEN** the viewer stays on that item

#### Scenario: Thread replies are included while the thread is open

- **GIVEN** a thread pane is open on a room's messages
- **WHEN** the reader moves through the media viewer
- **THEN** images and videos in the thread's replies are included

#### Scenario: PDFs and audio are not part of the gallery

- **GIVEN** a room has PDF and audio attachments alongside images
- **WHEN** the reader moves through the media viewer
- **THEN** the PDFs and audio files are skipped

### Requirement: Images zoom and pan in the viewer and videos do not

The media viewer SHALL let the reader zoom and pan images and SHALL NOT zoom or pan videos.

#### Scenario: Zooming an image

- **GIVEN** an image is open in the viewer
- **WHEN** the reader scrolls the mouse wheel
- **THEN** the image zooms

#### Scenario: Panning a zoomed image

- **GIVEN** an image is zoomed beyond its fitted size
- **WHEN** the reader drags it
- **THEN** the image pans

#### Scenario: Zoom resets when moving to another file

- **GIVEN** an image is zoomed in the viewer
- **WHEN** the reader moves to another file
- **THEN** the zoom and pan are reset

#### Scenario: Video uses its own controls

- **GIVEN** a video is open in the viewer
- **WHEN** the reader scrolls the mouse wheel or drags over it
- **THEN** the video does not zoom or pan

### Requirement: A file shown in the viewer can be downloaded from it

The media viewer SHALL offer to download the file it is showing.

#### Scenario: Downloading from the viewer

- **GIVEN** a file is open in the viewer
- **WHEN** the reader chooses download
- **THEN** the file is downloaded

### Requirement: A room sets its own attachment size and file categories

A room SHALL be able to set a maximum attachment size and the file categories it allows, and attachments outside those limits SHALL be refused before upload.

#### Scenario: Room manager sets limits

- **GIVEN** a member with permission to manage the room
- **WHEN** they set the room's maximum attachment size and allowed categories
- **THEN** members are held to those limits from then on

#### Scenario: Room without its own size limit uses the global maximum

- **GIVEN** a room has no size limit of its own
- **WHEN** a member attaches a file
- **THEN** the global maximum size applies

#### Scenario: Oversized drop is refused as a whole

- **GIVEN** a member drops several files into the composer and one exceeds the room's size limit
- **WHEN** the drop is handled
- **THEN** none of the files is uploaded
- **AND** an alert names the file that was too large

#### Scenario: Disallowed category is refused

- **GIVEN** the room does not allow video attachments
- **WHEN** a member attaches a video
- **THEN** the attachment is refused before upload

### Requirement: The size limit is checked against the size the uploader declares

The room's size limit SHALL be checked against the size the uploader declares, so a file whose stored size is larger than declared can pass the check.

#### Scenario: Declared size under the limit with a larger stored file

- **GIVEN** an uploader declares a file size under the room's limit
- **WHEN** the stored file is larger than declared
- **THEN** the attachment is accepted

### Requirement: The allowed file categories are enforced on the type a file is stored as

The room's allowed file categories SHALL be enforced on the type the file is stored as.

#### Scenario: Stored type matches the declared category

- **GIVEN** a member uploads an image declared as an image
- **WHEN** the file is stored
- **THEN** it is stored as an image

#### Scenario: Disallowed type is refused

- **GIVEN** the room does not allow documents
- **WHEN** a member tries to upload a file declared as a document
- **THEN** the upload is refused

### Requirement: Deleted files are removed from storage shortly after

Deleting an attachment, a message with attachments or a room SHALL remove its files from storage shortly after, not necessarily immediately.

#### Scenario: Deleting an attachment removes its files

- **GIVEN** a message has an attachment with a preview
- **WHEN** the attachment is deleted
- **THEN** the file and its preview are removed from storage shortly after
- **AND** the removal is retried until it succeeds

#### Scenario: Removal request cannot be sent

- **GIVEN** a file's removal request cannot be sent when its attachment is deleted
- **WHEN** the file's link has not yet expired
- **THEN** the file stays reachable through that link until the link expires

#### Scenario: Deleting a room removes its files

- **GIVEN** a room with attachments is deleted
- **WHEN** the deletion completes
- **THEN** the room's files are removed from storage shortly after

### Requirement: A room's attachments can be browsed through search

Browsing a room's attachments SHALL be a search of its messages filtered to files.

#### Scenario: Filtering search to files

- **GIVEN** a room has messages with attachments
- **WHEN** the reader filters the room's search to files
- **THEN** the messages with attachments are listed
