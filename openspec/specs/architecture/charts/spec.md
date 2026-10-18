## Purpose

The app's one chart component over ApexCharts, the replacement for vue3-apexcharts — when the chart is drawn, rebuilt and removed, what it does to the options it is handed, and the upstream audit, with every issue given a verdict.

## Requirements

### Requirement: A chart is drawn in the browser and never on the server

A page holding a chart SHALL render on the server with the chart's place kept and empty, and SHALL draw the chart once it reaches the browser.

#### Scenario: A server-rendered page with a chart

- **GIVEN** a page that holds a chart
- **WHEN** the page is rendered on the server
- **THEN** the page renders without error
- **AND** the chart is drawn once the page reaches the browser

### Requirement: A chart announces when it has drawn

A chart SHALL announce that it has drawn, and from then on SHALL hand its caller the drawn chart.

#### Scenario: A caller restores a saved view

- **GIVEN** a caller that restores a saved zoom and selection onto a chart
- **WHEN** the chart announces it has drawn
- **THEN** the caller can apply the view to the drawn chart

### Requirement: A change of chart type rebuilds the chart

A chart SHALL be rebuilt when its type changes, whether the type is passed on its own or inside the options, and SHALL be updated in place for any other change.

#### Scenario: The options change the type

- **GIVEN** a bar chart whose type is set inside its options
- **WHEN** the options change the type to a line
- **THEN** the chart is rebuilt as a line chart

#### Scenario: The options change something else

- **GIVEN** a drawn chart
- **WHEN** its series or any option other than its type changes
- **THEN** the chart updates in place without being rebuilt

### Requirement: A chart keeps every option its caller passes

A chart SHALL hand the engine the caller's options as given, its size and its callbacks included, and SHALL leave the caller's own copy of the options unchanged however the engine writes into what it was handed.

#### Scenario: A height in the options

- **GIVEN** options that set the chart's height and an empty series
- **WHEN** the chart is drawn
- **THEN** the chart takes that height

#### Scenario: The engine writes into its options

- **GIVEN** a chart whose legend hides a series
- **WHEN** the engine empties the hidden series in the options it was handed
- **THEN** the caller's options still hold that series

### Requirement: A legend entry is shown as text

A legend entry SHALL be shown as the text it holds, after any formatter the caller passes.

#### Scenario: A legend entry holding markup

- **GIVEN** a series named with markup
- **WHEN** the chart draws its legend
- **THEN** the legend shows the markup as text

### Requirement: A chart follows the app's theme

A chart SHALL take the app's light or dark mode, and SHALL redraw in the new mode when the reader switches it.

#### Scenario: The reader switches the theme

- **GIVEN** a drawn chart
- **WHEN** the reader switches the app's theme
- **THEN** the chart redraws in the new mode

### Requirement: A chart is removed with its component

A chart SHALL release the engine when its component is removed.

#### Scenario: Leaving the page

- **GIVEN** a drawn chart
- **WHEN** its component is removed
- **THEN** the engine is destroyed
