## ADDED Requirements

### Requirement: A card shows one aggregated number

The Card visual SHALL show the first series of its binding aggregated over every row of the query, ignoring the category column.

#### Scenario: A card counts every response in its dataset

- **GIVEN** a dataset of 412 response rows
- **AND** a card bound to a count of the response column
- **WHEN** the dashboard is viewed
- **THEN** the card shows 412
- **AND** the card's label defaults to the aggregation of the column

#### Scenario: A card with no binding shows the demo value

- **GIVEN** a card with no dataset binding
- **WHEN** the dashboard is viewed
- **THEN** the card shows the demo value, as an unbound chart shows demo data

### Requirement: A card writes large numbers in compact form

The Card visual SHALL write a value of a thousand or more in the compact form the dashboard's number display uses.

#### Scenario: A card abbreviates a large number

- **GIVEN** a card whose aggregated value is 12000
- **WHEN** the dashboard is viewed
- **THEN** the card shows 12K

### Requirement: A table lists the grouped result as sortable rows

The Table visual SHALL show the grouped query result with one row per category and one column per series, and SHALL sort its rows when a column header is activated.

#### Scenario: A table lists each category as a row

- **GIVEN** a binding grouped by a category column with two series
- **WHEN** the dashboard is viewed
- **THEN** the table shows one row for each category and one column for each series
- **AND** activating a column header sorts the rows by that column

### Requirement: A table's totals row sums only additive series

The Table visual's totals row SHALL sum each series aggregated by count or sum, and SHALL leave every other series blank.

#### Scenario: A totals row leaves averages blank

- **GIVEN** a table with a count series and an average series
- **WHEN** the dashboard is viewed
- **THEN** the totals row shows the sum of the count series
- **AND** the totals row leaves the average series blank

### Requirement: A table shows the same values as a chart over its binding

A Table visual SHALL show, for each category, the same value a chart over the same binding shows for that category.

#### Scenario: A table beside a bar chart shows the bars' exact values

- **GIVEN** a bar chart and a table bound to the same dataset
- **WHEN** the dashboard is viewed
- **THEN** the value in the table for each category equals the height of that category's bar

### Requirement: The edit dialog offers no chart settings for a card or a table

The visual edit dialog SHALL offer no chart type and no chart settings when the visual is a card or a table.

#### Scenario: Editing a card offers only its label

- **GIVEN** an owner editing a card
- **WHEN** the edit dialog opens
- **THEN** the dialog shows the card's label field
- **AND** the dialog shows no chart type and no chart settings

#### Scenario: Editing a table offers no extra settings

- **GIVEN** an owner editing a table
- **WHEN** the edit dialog opens
- **THEN** the dialog shows no chart type and no chart settings
- **AND** the dialog shows no label field

### Requirement: A card and a table show the error state of any visual

A card or a table whose dataset read fails SHALL show the error state that every visual shows.

#### Scenario: A table whose read fails shows the error state

- **GIVEN** a table bound to a dataset whose read fails
- **WHEN** the dashboard is viewed
- **THEN** the table shows the error state in place of its rows
