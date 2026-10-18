## ADDED Requirements

### Requirement: A dashboard places each visual at its saved cell

A dashboard SHALL draw each visual at the column, row, width and height it was saved with.

#### Scenario: Opening a dashboard

- **GIVEN** a dashboard whose visuals were saved at their cells
- **WHEN** the dashboard is opened
- **THEN** each visual is drawn at its own cell and size

### Requirement: A narrower screen reflows a dashboard without overlap

A published dashboard SHALL reflow to fewer columns on a narrower screen, and SHALL NOT overlap two visuals or place one outside the grid.

#### Scenario: Opening a dashboard on a phone

- **GIVEN** a dashboard laid out over twelve columns
- **WHEN** it is opened on a screen too narrow for twelve
- **THEN** its visuals fill the fewer columns that screen takes
- **AND** no two visuals overlap
- **AND** none extends past the grid's last column

### Requirement: Moving a visual pushes the visuals it lands on

Moving a visual in the editor SHALL push every visual it lands on below it, and SHALL close the gaps the move leaves.

#### Scenario: Dropping a visual onto another

- **GIVEN** two visuals in the editor
- **WHEN** the owner drags one onto the other's cell
- **THEN** the dragged visual takes that cell
- **AND** the other is pushed below it

#### Scenario: A short drag is a click

- **GIVEN** a visual in the editor
- **WHEN** the owner presses it and releases it without moving
- **THEN** the visual opens as a click opens it
- **AND** nothing moves

### Requirement: A resized visual stays within its bounds

Resizing a visual SHALL keep it at least one cell wide and tall and within the grid's columns.

#### Scenario: Shrinking a visual to nothing

- **GIVEN** a visual in the editor
- **WHEN** the owner drags its resize handle past its top-left corner
- **THEN** the visual is one cell wide and one cell tall

### Requirement: A move is saved once, when it ends

A move or a resize SHALL change the saved dashboard once, when the owner releases the visual, and SHALL show where the visual will land while it is held.

#### Scenario: Dragging across several cells

- **GIVEN** a visual in the editor
- **WHEN** the owner drags it across several cells and releases it
- **THEN** a placeholder shows its landing cell while it is held
- **AND** the dashboard changes once, after the release

### Requirement: A published dashboard never holds the page's scroll

A dashboard that cannot be edited SHALL let the reader scroll the page with a touch over any visual.

#### Scenario: Scrolling a published dashboard on a phone

- **GIVEN** a published dashboard on a touch screen
- **WHEN** the reader swipes over a visual
- **THEN** the page scrolls
