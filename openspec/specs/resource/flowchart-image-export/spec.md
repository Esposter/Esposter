## Purpose

Export a whole Flowchart as PNG or SVG from any resource blade, with the canvas fitted to every node and the page's fonts embedded. The export is a one-way download; the diagram cannot be imported back from it.

## Requirements

### Requirement: A flowchart exports as PNG or SVG named after the resource

The owner SHALL be able to export a flowchart as a PNG or an SVG file from the resource menu, named after the resource.

#### Scenario: Exporting as SVG

- **GIVEN** the owner has a flowchart
- **WHEN** they choose Export SVG from the resource menu
- **THEN** a file named after the resource downloads as an SVG

#### Scenario: Exporting as PNG

- **GIVEN** the owner has a flowchart
- **WHEN** they choose Export PNG from the resource menu
- **THEN** a file named after the resource downloads as a PNG

### Requirement: The export contains the whole diagram

The export SHALL include every node and edge in the diagram, including those outside the editor's current view.

#### Scenario: Nodes outside the visible area are included

- **GIVEN** part of the diagram is scrolled out of view in the editor
- **WHEN** the owner exports it
- **THEN** the exported image includes the nodes that were out of view

#### Scenario: Exporting with the editor closed

- **GIVEN** the owner is on the resource's Overview blade rather than the editor
- **WHEN** they export the diagram
- **THEN** the whole diagram is exported

### Requirement: Exporting leaves the editor's view unchanged

The export SHALL NOT move the editor's pan or zoom.

#### Scenario: The editor view is unchanged after export

- **GIVEN** the editor is zoomed into one corner of the diagram
- **WHEN** the owner exports the diagram
- **THEN** the editor stays in the same pan and zoom

### Requirement: Exported text keeps its fonts

The export SHALL embed the page's fonts so that the text in the file is drawn in the same typeface as on screen.

#### Scenario: Text in an SVG export uses the page's font

- **GIVEN** the diagram uses the app's typeface
- **WHEN** the owner exports it as SVG
- **THEN** the text in the file is drawn in that typeface without the app loaded

### Requirement: The export uses the current theme's background

The export SHALL draw on the current theme's background and SHALL omit the editor's dot grid.

#### Scenario: A dark theme export has a dark background

- **GIVEN** the owner is using a dark theme
- **WHEN** they export the diagram
- **THEN** the exported background matches the dark theme
- **AND** no dot grid appears in it

### Requirement: Exported files cannot be imported back

The system SHALL NOT offer importing a PNG or SVG export back into a flowchart.

#### Scenario: No import is offered for an image

- **GIVEN** the owner has an exported PNG or SVG file
- **WHEN** they look for a way to import it into a flowchart
- **THEN** no import action is offered
