## ADDED Requirements

### Requirement: The inspector's tabs follow the selection

The inspector SHALL offer the Page and Theme tabs with nothing selected and the Content and Style tabs with a node selected, and SHALL NOT offer a Check tab.

#### Scenario: Nothing selected offers Page and Theme

- **GIVEN** a webpage with nothing selected
- **WHEN** the inspector is drawn
- **THEN** its tabs are Page and Theme

#### Scenario: A node selection offers Content and Style only

- **GIVEN** a paragraph selected
- **WHEN** the inspector is drawn
- **THEN** its tabs are Content and Style

#### Scenario: The Check tab is gone

- **GIVEN** a webpage with nothing selected, or a paragraph selected
- **WHEN** the inspector is drawn
- **THEN** no tab is named Check

### Requirement: The device toggle is in the bar

The device toggle SHALL be in the bar and SHALL set both the frame's width and the breakpoint the Style tab edits.

#### Scenario: The device toggle sets the frame and the style tab's breakpoint

- **GIVEN** a paragraph selected with the desktop width chosen
- **WHEN** the author chooses the mobile width
- **THEN** the frame is drawn at the mobile width
- **AND** the Style tab edits the paragraph's mobile values

### Requirement: The critique's findings are warnings in the problems surface

The critique's findings SHALL be listed in the problems surface as warnings, each naming its node, and a warning SHALL NOT refuse a save.

#### Scenario: A critique finding is a warning in the problems surface

- **GIVEN** a paragraph with low contrast
- **WHEN** the problems surface is opened
- **THEN** it lists a contrast warning against the paragraph

#### Scenario: A warning does not refuse a save

- **GIVEN** a webpage with only a contrast warning
- **WHEN** a save is attempted
- **THEN** the save lands

### Requirement: A compact or medium window opens the panes as sheets

On a compact or medium window the webpage editor SHALL keep the canvas in view and open the blocks region and the inspector as sheets from their buttons. Two columns of the default width leave the canvas too little width to edit in at the medium class, so the side regions are sheets there too.

#### Scenario: A compact window opens the inspector as a sheet

- **GIVEN** a compact window with a node selected
- **WHEN** the author presses the inspector's button
- **THEN** the inspector opens as a sheet
- **AND** the canvas is still drawn beneath it

#### Scenario: A medium window opens the inspector as a sheet

- **GIVEN** a medium window with a node selected
- **WHEN** the author presses the inspector's button
- **THEN** the inspector opens as a sheet
- **AND** the canvas is still drawn beneath it
