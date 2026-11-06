## ADDED Requirements

### Requirement: Preview removes the editing regions

In Preview the email editor SHALL draw the compiled message at the device width and SHALL NOT draw the blocks region or the inspector.

#### Scenario: Preview removes the editing regions

- **GIVEN** an email open in Design with both regions drawn
- **WHEN** the author switches to Preview
- **THEN** the compiled message is drawn
- **AND** neither the blocks region nor the inspector is drawn

### Requirement: The device toggle applies to both modes

The device toggle in the bar SHALL set the width of the design canvas and of the preview alike.

#### Scenario: The device toggle applies to both modes

- **GIVEN** an email with the mobile width chosen in Design
- **WHEN** the author switches to Preview
- **THEN** the preview is drawn at the mobile width

### Requirement: The inspector's tabs follow the selection

The inspector SHALL show the email's own settings with nothing selected, and the Content and Style tabs with a node selected, and SHALL NOT offer a Theme tab.

#### Scenario: Nothing selected shows the email's settings

- **GIVEN** an email with nothing selected
- **WHEN** the inspector is drawn
- **THEN** it shows the email's settings

#### Scenario: A node selection offers Content and Style only

- **GIVEN** a text block selected
- **WHEN** the inspector is drawn
- **THEN** its tabs are Content and Style

### Requirement: The compile's messages are findings

The email editor SHALL list the compile's validation messages as findings in the problems surface in Design and in Preview, and SHALL keep the last good message when a compile is refused.

#### Scenario: A validation message is a finding in Design

- **GIVEN** an email edited in Design so that the compile reports a validation message
- **WHEN** the edit settles
- **THEN** the message is listed in the problems surface

#### Scenario: A refused compile keeps the last good message

- **GIVEN** an email with a compiled preview
- **WHEN** an edit makes the compile refuse
- **THEN** the preview still draws the last good message
- **AND** the refusal is listed as an error finding

### Requirement: A message that names a node selects it

Choosing a finding that names a node SHALL select that node.

#### Scenario: A message that names a node selects it

- **GIVEN** a validation message that names a column
- **WHEN** the author chooses it
- **THEN** that column is selected

### Requirement: Import MJML is in the overflow menu

The bar SHALL hold Import MJML in its overflow menu at every width.

#### Scenario: Import MJML is in the overflow menu

- **GIVEN** an email in Design on an expanded window
- **WHEN** the bar is drawn
- **THEN** Import MJML is not in the bar
- **AND** it is in the overflow menu

### Requirement: A compact window opens the panes as sheets

On a compact window the email editor SHALL keep the canvas in view and open the blocks region and the inspector as sheets from their buttons.

#### Scenario: A compact window opens the inspector as a sheet

- **GIVEN** a compact window with a block selected
- **WHEN** the author presses the inspector's button
- **THEN** the inspector opens as a sheet
- **AND** the canvas is still drawn beneath it
