## Purpose

A code attachment opens read-only in CodeMirror, its grammar picked by filename and its colours taken from the app's own theme.

## Requirements

### Requirement: A code attachment opens in a read-only view

A code attachment SHALL open in a view the reader can read and scroll but cannot edit.

#### Scenario: Opening a code attachment

- **GIVEN** a message contains a code file attachment
- **WHEN** the reader opens the attachment
- **THEN** its text is shown
- **AND** the text cannot be edited

### Requirement: Syntax highlighting follows the filename

The code view SHALL highlight the attachment according to the language its filename indicates, and SHALL show plain text when the filename indicates no known language.

#### Scenario: Known language is highlighted

- **GIVEN** a code attachment named with a known language's extension
- **WHEN** the attachment is opened
- **THEN** its text is highlighted in that language

#### Scenario: Unknown filename shows plain text

- **GIVEN** a code attachment whose filename matches no known language
- **WHEN** the attachment is opened
- **THEN** its text is shown without highlighting

### Requirement: The code view uses the app's current theme colours

The code view SHALL take its background, text, selection, cursor and highlight colours from the app's current theme.

#### Scenario: Switching theme recolours the code view

- **GIVEN** a code attachment is open
- **WHEN** the reader switches the app's theme
- **THEN** the code view's colours follow the new theme

### Requirement: A code attachment that fails to load never blocks its message

A code attachment that fails to load SHALL show an empty file and SHALL NOT stop the message around it from rendering.

#### Scenario: Failed fetch of the file's text

- **GIVEN** a code attachment whose text cannot be fetched
- **WHEN** the message is shown
- **THEN** the attachment shows as an empty file
- **AND** the rest of the message renders normally

### Requirement: A code attachment in a message preview has a capped height

A code attachment shown as a message preview SHALL be limited to a fixed maximum height and SHALL remain responsive to pointer input.

#### Scenario: Previewed code attachment is capped

- **GIVEN** a message preview contains a long code attachment
- **WHEN** the preview is shown
- **THEN** the code view is no taller than the preview's maximum height
- **AND** the code view responds to pointer input
