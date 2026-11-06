# resource/dashboard-layout Specification

## Purpose

The dashboard editor's layout: selecting a visual shows its edit form in an inspector beside the grid, with nothing selected the inspector shows the dashboard's settings, and the visuals palette is a region the reader opens. The published dashboard draws none of these regions.

## Requirements

### Requirement: Pressing a visual selects it

A press or Enter on a visual in the editor SHALL select it, and a press on the empty canvas SHALL clear the selection.

#### Scenario: Pressing a visual selects it

- **GIVEN** a dashboard with a bar chart and nothing selected
- **WHEN** the owner presses the chart
- **THEN** the chart is selected

#### Scenario: Deleting the selected visual clears the selection

- **GIVEN** a selected visual
- **WHEN** the owner deletes it
- **THEN** nothing is selected

### Requirement: The inspector shows the selected visual's form

With a visual selected the inspector SHALL show its edit form and dataset binding beside the grid, and SHALL redraw the visual as the form changes, with the canvas in view.

#### Scenario: Selecting a visual shows its edit form in the inspector

- **GIVEN** a dashboard with a bar chart
- **WHEN** the chart is selected
- **THEN** the inspector shows the chart's edit form
- **AND** the grid is still drawn

#### Scenario: A form change redraws the visual

- **GIVEN** a selected bar chart and its form in the inspector
- **WHEN** its type is changed to a line chart
- **THEN** the tile draws a line chart

### Requirement: A group's title is edited in the inspector

With a group selected the inspector SHALL show the group's title field.

#### Scenario: A group selected shows its title

- **GIVEN** a group selected
- **WHEN** the inspector is drawn
- **THEN** it shows the group's title field

### Requirement: Nothing selected shows the dashboard's settings

With nothing selected the inspector SHALL show the dashboard's layout settings, how visuals pack and what a drop does.

#### Scenario: Nothing selected shows the dashboard's layout settings

- **GIVEN** a dashboard with nothing selected
- **WHEN** the inspector is drawn
- **THEN** it shows how visuals pack and what a drop does

### Requirement: The palette is a region the reader opens

The visuals palette SHALL be a region the reader opens and closes, docked beside the grid on a wide window and a sheet on a compact one.

#### Scenario: The palette is a region the reader opens

- **GIVEN** a dashboard on a compact window
- **WHEN** the reader presses the palette's button
- **THEN** the palette opens as a sheet

### Requirement: The published page draws no editor regions

The published dashboard SHALL draw no palette, inspector or bar.

#### Scenario: The published page draws no editor regions

- **GIVEN** a published dashboard
- **WHEN** a viewer opens it
- **THEN** no palette, inspector or editor bar is drawn
