# resource/dashboard-live-canvas Specification

## Purpose

Show each dashboard visual in the editor as the same live chart the published page draws, so an owner sees what they built without publishing it.

## Requirements

### Requirement: An editor tile draws its visual's chart over live data

An editor tile SHALL draw its visual's chart over the live data its binding reads, in place of a stock icon.

#### Scenario: A bar chart bound to responses shows its bars in the editor

- **GIVEN** a dashboard whose bar chart is bound to a dataset of responses
- **WHEN** the owner opens the dashboard editor
- **THEN** the tile shows the bars for those responses
- **AND** the tile shows no icon in their place

### Requirement: An editor tile shows a retry when its read fails

An editor tile whose dataset read fails SHALL show the error state with a Retry action.

#### Scenario: An editor tile offers a retry when its read fails

- **GIVEN** an editor tile whose dataset read fails
- **WHEN** the owner views the dashboard editor
- **THEN** the tile shows the error state with a Retry action
- **AND** activating Retry reads the dataset again

### Requirement: The chart body takes no pointer input in the editor

The chart inside an editor tile SHALL NOT respond to pointer input, so that a drag moves the tile and a click opens its edit form.

#### Scenario: A drag across a chart moves its tile

- **GIVEN** an editor tile showing a chart
- **WHEN** the owner drags across the chart
- **THEN** the tile moves
- **AND** the chart does not zoom or select anything

#### Scenario: A click on a chart opens its edit form

- **GIVEN** an editor tile showing a chart
- **WHEN** the owner clicks the chart without dragging
- **THEN** the tile's edit form opens

### Requirement: Saving an edit redraws its tile

An editor tile SHALL show the saved visual once an edit to it is saved.

#### Scenario: Changing a chart's type redraws it on save

- **GIVEN** an editor tile showing a bar chart
- **WHEN** the owner changes the chart's type to a line chart and saves the edit
- **THEN** the tile shows a line chart

### Requirement: Resizing a tile redraws its chart at the new height

An editor tile SHALL redraw its chart to fill the tile's new height when the tile is resized.

#### Scenario: Resizing a tile redraws its chart to fill it

- **GIVEN** an editor tile showing a chart
- **WHEN** the owner resizes the tile taller
- **THEN** the chart fills the new height of the tile

### Requirement: The tile corner stays usable above the chart

The corner of an editor tile SHALL keep its Edit, Delete, Refresh and Copy link actions usable above the chart.

#### Scenario: The corner buttons work over a chart

- **GIVEN** an editor tile showing a chart
- **WHEN** the owner activates Refresh in the tile's corner
- **THEN** the visual reads its dataset again
- **AND** Copy link remains available in the same corner

### Requirement: Visuals over one source share one read

Editor tiles whose visuals are bound to the same source SHALL share one read of that source.

#### Scenario: Six charts over one sheet read the sheet once

- **GIVEN** a dashboard of six charts bound to one sheet
- **WHEN** the owner opens the dashboard editor
- **THEN** the sheet is read once for all six charts
