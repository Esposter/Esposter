## Purpose

Dashboard visuals bound to datasets — reference + query per visual, client-side aggregation, per-visual refresh, and publish-time snapshots. A visual with no binding keeps its static data, so binding is an addition rather than a change to existing dashboards.

## Requirements

### Requirement: A visual can be bound to a dataset

The dashboard editor SHALL let the owner bind a visual to a dataset by choosing a source, an x column and one or more series, each with an aggregation.

#### Scenario: Binding a visual to a sheet's columns

- **GIVEN** the owner has a sheet with a category column and a number column
- **WHEN** they bind a bar visual to it with that category as the x column and a sum of the number column as the series
- **THEN** the visual draws one bar per category with the summed value

#### Scenario: Adding a second series

- **GIVEN** a bound visual has one series
- **WHEN** the owner adds a second series with a different aggregation
- **THEN** the visual draws both series

#### Scenario: An unbound visual keeps its static data

- **GIVEN** a visual was never bound to a dataset
- **WHEN** the dashboard loads
- **THEN** the visual draws its static data unchanged

### Requirement: A bound visual's aggregation is computed per category

The dashboard SHALL compute each bound series as count, sum, average, minimum or maximum per x-column category.

#### Scenario: Each aggregation gives its own value

- **GIVEN** a series over a category with several values
- **WHEN** the visual draws it under each aggregation
- **THEN** count, sum, average, minimum and maximum each show their own value for that category

### Requirement: Only visual types that can show a query result accept a binding

The dashboard SHALL offer the binding form only for visual types that can draw a query's result, and SHALL explain in place of it for types that cannot.

#### Scenario: A candlestick visual explains that it cannot be bound

- **GIVEN** the owner selects a candlestick visual
- **WHEN** they open its data settings
- **THEN** the binding form is replaced with an explanation
- **AND** demo data is shown for the visual

#### Scenario: Switching to a type that cannot bind clears its binding

- **GIVEN** a bar visual is bound to a dataset
- **WHEN** the owner changes it to a candlestick visual
- **THEN** the visual's binding is cleared

### Requirement: A bound visual fails on its own when its source is gone

The dashboard SHALL show an error on a bound visual whose source is deleted or unreadable, and SHALL keep the rest of the dashboard working.

#### Scenario: A deleted source shows an error on that visual only

- **GIVEN** a bound visual's source resource has been deleted
- **WHEN** the dashboard loads
- **THEN** that visual shows an error asking the owner to pick another source or restore the deleted one
- **AND** the other visuals on the dashboard still render

#### Scenario: An unreadable source shows its own error state

- **GIVEN** a bound visual's source cannot be read
- **WHEN** the dashboard loads
- **THEN** that visual shows its error state while the others render

### Requirement: Bound data refreshes when asked, not live

The dashboard SHALL load bound data when the dashboard opens and when the owner asks for a refresh, and SHALL NOT update it live.

#### Scenario: A manual refresh reloads one visual

- **GIVEN** a bound visual shows data from a moment ago
- **WHEN** the owner refreshes that visual
- **THEN** the visual loads its data again

#### Scenario: New rows appear only on refresh

- **GIVEN** a bound visual is on screen
- **WHEN** new rows are added to its source
- **THEN** the visual does not change until it is refreshed

### Requirement: A published dashboard shows bound data without reading live

The publish step SHALL freeze each bound visual's data into the published dashboard, and the public view SHALL NOT read the source again.

#### Scenario: A viewer of a published dashboard sees the frozen data

- **GIVEN** a dashboard is published with a bound visual
- **WHEN** the source gains rows and a viewer opens the public dashboard
- **THEN** the viewer sees the data as it was at publish

#### Scenario: A published visual publishes only the columns it uses

- **GIVEN** a bound visual reads one question's answers from a survey
- **WHEN** the dashboard is published
- **THEN** the published data includes every row but only the columns that visual reads
