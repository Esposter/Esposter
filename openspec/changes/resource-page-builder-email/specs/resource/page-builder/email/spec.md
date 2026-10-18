## ADDED Requirements

### Requirement: An email is built from its email node types

An email SHALL be built from email node types, and a section SHALL hold only columns.

#### Scenario: A section accepts only columns

- **GIVEN** a section in an email
- **WHEN** the owner tries to place a text block directly in the section
- **THEN** the text block is not placed there

### Requirement: An email image requires alternative text

An image in an email SHALL carry alternative text before the email can be saved.

#### Scenario: An image without alternative text is refused

- **GIVEN** an image in an email with no alternative text
- **WHEN** the owner saves the email
- **THEN** the save is refused

### Requirement: The design canvas stacks columns below the mobile breakpoint

The design canvas SHALL draw a section's columns side by side at desktop width and SHALL stack them below 480 pixels.

#### Scenario: Columns stack below the mobile breakpoint

- **GIVEN** a section with two columns in an email
- **WHEN** the owner views the design canvas at desktop width and then at mobile width
- **THEN** the columns are side by side at desktop width
- **AND** the columns are stacked at mobile width

### Requirement: The design canvas shows the email engine's default look

Each element on the design canvas SHALL show the email engine's default look until the owner sets a field that overrides it.

#### Scenario: A new text shows the default font and padding

- **GIVEN** a new text element in an email
- **WHEN** the owner views the design canvas
- **THEN** the text is set in Ubuntu, Helvetica or Arial at 13 pixels
- **AND** the text has 10 pixels of vertical padding and 25 pixels of horizontal padding

### Requirement: Preview shows the email as a client receives it

Preview SHALL show the compiled email at the width the owner chooses, and SHALL show the validator's messages above it.

#### Scenario: Preview shows the compiled email at mobile width

- **GIVEN** an email open in the editor
- **WHEN** the owner switches Preview to mobile width
- **THEN** the compiled email is shown at 375 pixels wide

#### Scenario: Validator messages show above the preview

- **GIVEN** an email whose markup fails strict validation
- **WHEN** the owner views Preview
- **THEN** an alert lists each validator message above the preview

### Requirement: The preview text is shown as the email's inbox preview

The preview text set on an email SHALL be the text the email shows as its inbox preview.

#### Scenario: Editing the preview text updates the compiled email

- **GIVEN** an email open in the editor
- **WHEN** the owner types a preview text
- **THEN** the compiled email carries that text as its inbox preview

### Requirement: A merge field is inserted by typing braces or dragging a column

A merge field SHALL be inserted into a text by typing two braces or by dragging a column from the dataset, and SHALL show as the column's token.

#### Scenario: Typing two braces offers the dataset's columns

- **GIVEN** an email bound to a dataset with the columns Name and Email
- **WHEN** the owner types two braces in a text
- **THEN** the list offers Name and Email
- **AND** choosing Name inserts a merge field shown as its token

#### Scenario: Dragging a column into a text inserts a merge field

- **GIVEN** an email bound to a dataset with a column named Name
- **WHEN** the owner drags Name from the Merge fields group into a text
- **THEN** a merge field for Name is inserted in the text

### Requirement: The personalised export works with the editor closed

A personalised export SHALL compile from the saved email and SHALL download one HTML file per dataset row in a zip, with each row's merge fields filled in.

#### Scenario: A personalised export runs with the editor closed

- **GIVEN** a saved email bound to a dataset of two rows
- **WHEN** the owner exports from the command bar with the editor closed
- **THEN** a zip downloads holding two HTML files
- **AND** each file has its row's values in place of the merge fields
- **AND** the export includes the latest saved edit
