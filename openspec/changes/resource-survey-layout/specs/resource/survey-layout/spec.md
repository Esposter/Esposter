## ADDED Requirements

### Requirement: Preview removes the editing regions

In Preview the creator SHALL draw the runner over the whole width and SHALL NOT draw the structure region or the inspector.

#### Scenario: Preview removes the editing regions

- **GIVEN** a survey open in Design with both regions drawn
- **WHEN** the reader switches to Preview
- **THEN** the runner is drawn
- **AND** neither the structure region nor the inspector is drawn

### Requirement: The inspector's tabs follow the selection

The inspector SHALL offer the Survey, Logic and Theme tabs with nothing selected, and the Properties and Logic tabs with a page or an element selected, and SHALL NOT offer the Theme tab with a node selected.

#### Scenario: Nothing selected offers the Theme tab

- **GIVEN** a survey with nothing selected
- **WHEN** the inspector is drawn
- **THEN** its tabs are Survey, Logic and Theme

#### Scenario: A node selection offers no Theme tab

- **GIVEN** a question selected
- **WHEN** the inspector is drawn
- **THEN** its tabs are Properties and Logic

### Requirement: The structure region holds the outline and the palette

The structure region SHALL hold an Outline tab with the layers tree and an Add tab with the palette.

#### Scenario: The structure region has two tabs

- **GIVEN** a survey in Design
- **WHEN** the structure region is drawn
- **THEN** its tabs are Outline and Add

### Requirement: Occasional commands fold into the overflow menu

The bar SHALL show undo, redo, Add page, the mode switch and the problems surface, and SHALL hold Import, Export and Clear in its overflow menu at every width.

#### Scenario: Import, Export and Clear are in the overflow menu

- **GIVEN** a survey in Design on an expanded window
- **WHEN** the bar is drawn
- **THEN** Import, Export and Clear are not in the bar
- **AND** they are in its overflow menu

### Requirement: A compact window opens the panes as sheets

On a compact window the creator SHALL keep the canvas in view and open the structure region and the inspector as sheets from their buttons, so a selection never swaps the canvas away.

#### Scenario: A compact window opens the inspector as a sheet

- **GIVEN** a compact window with a question selected
- **WHEN** the reader presses the inspector's button
- **THEN** the inspector opens as a sheet
- **AND** the canvas is still drawn beneath it
