## ADDED Requirements

### Requirement: The design canvas stacks columns below the mobile breakpoint

The design canvas SHALL draw a section's columns side by side at desktop width and SHALL stack them below 480 pixels.

#### Scenario: Columns stack below the mobile breakpoint

- **GIVEN** a section with two columns in an email
- **WHEN** the owner views the design canvas at desktop width and then at mobile width
- **THEN** the columns are side by side at desktop width
- **AND** the columns are stacked at mobile width

### Requirement: The design canvas shows the email engine's default look

Each element on the design canvas SHALL show what its attributes resolve to: its own value, else the email's default for its kind or for all elements, else the email engine's default look.

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

### Requirement: An email node's style fields are its email attributes

An email node SHALL offer no breakpoints or states, and its style fields SHALL be the attributes its email output takes.

#### Scenario: An email text has no breakpoint or state choice

- **GIVEN** a text node in an email
- **WHEN** the owner opens its style fields
- **THEN** no breakpoint or state choice is shown
- **AND** the fields include its padding, colours and font

#### Scenario: Clearing a field restores the root's default

- **GIVEN** an email whose default font size for texts is 16 pixels, and a text whose own font size is 20 pixels
- **WHEN** the owner clears the text's font size
- **THEN** the text is shown at 16 pixels

### Requirement: MJML source imports as an email

The email editor SHALL replace the open email with imported MJML source as one undoable edit, and SHALL leave the email unchanged and name what did not fit when the source holds anything the email types do not take.

#### Scenario: Importing MJML replaces the email

- **GIVEN** an email open in the editor
- **WHEN** the owner imports MJML source of a section holding a column with a button
- **THEN** the email holds that section, column and button
- **AND** one undo restores the email as it was

#### Scenario: An import that does not fit leaves the email as it was

- **GIVEN** an email open in the editor
- **WHEN** the owner imports MJML source that includes a file
- **THEN** the email is unchanged
- **AND** the refusal names the included tag
