## Purpose

A Preview text field in the email's Editor blade writes the line an inbox shows under the subject into the MJML as its mj-preview, so the compiled HTML, the exported files and the published web view all carry it. The field only sets preview text; it does not add a subject line or a title.

## Requirements

### Requirement: The Editor blade sets the inbox preview line

The email author SHALL be able to set a preview text in the Editor blade, and the email SHALL carry that text as its hidden preheader.

#### Scenario: Typing preview text sets the preheader

- **GIVEN** the author opens an email in the Editor blade
- **WHEN** they type "Your ticket is confirmed" into Preview text
- **THEN** the compiled email carries that text as its preheader
- **AND** it is shown in the inbox beside the subject rather than in the message body

#### Scenario: Emptying the field removes the preview text

- **GIVEN** the email has preview text
- **WHEN** the author clears the Preview text field
- **THEN** the email no longer carries a preheader

#### Scenario: A second entry replaces the first

- **GIVEN** the email already has preview text
- **WHEN** the author enters new preview text
- **THEN** the new text replaces the old one rather than adding a second preheader

#### Scenario: Other head content is kept

- **GIVEN** the email has other head content
- **WHEN** the author sets or changes the preview text
- **THEN** that other head content is unchanged

### Requirement: The field follows the editor's undo

The Preview text field SHALL show the preview text as it is in the email after each change, including after an undo.

#### Scenario: Undo updates the field

- **GIVEN** the author has changed the preview text
- **WHEN** they undo that change
- **THEN** the Preview text field shows the earlier text

### Requirement: Merge fields work in the preview text

The system SHALL fill merge fields in the preview text per row on personalized export, the same way it fills them in the body.

#### Scenario: A merge field in preview text is filled per recipient

- **GIVEN** the preview text contains a merge field for a dataset column
- **WHEN** the author exports personalized HTML
- **THEN** each row's file shows that row's value in the preview text

### Requirement: Long preview text is advised on, not blocked

The system SHALL show when the preview text is longer than an inbox typically displays, and SHALL still accept the longer text.

#### Scenario: Text past the inbox length shows advice

- **GIVEN** the author types preview text longer than the typical inbox length
- **WHEN** the field updates
- **THEN** the field warns that most inboxes cut the line off there
- **AND** the text is kept

### Requirement: The preview text is not a subject line

The Editor blade SHALL NOT offer a subject line or a page title through this field.

#### Scenario: The field sets no subject

- **GIVEN** the author sets preview text
- **WHEN** the email is compiled
- **THEN** no subject line is set from it
