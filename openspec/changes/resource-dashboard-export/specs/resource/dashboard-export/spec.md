## ADDED Requirements

### Requirement: An owner exports a dashboard page as a PNG

The Dashboard's resource menu SHALL offer Export PNG, which downloads the dashboard page as it is drawn, named after the dashboard.

#### Scenario: Page exported with its bound and static visuals

- **GIVEN** a dashboard with a bound chart, a bound card and a static chart
- **WHEN** the owner chooses Export PNG
- **THEN** a PNG downloads named after the dashboard
- **AND** the image shows all three visuals as the page draws them

#### Scenario: A failed capture writes no file

- **GIVEN** a dashboard whose page cannot be captured
- **WHEN** the owner chooses Export PNG
- **THEN** an alert says the export failed
- **AND** no file is downloaded and the dashboard is unchanged

### Requirement: A bound visual exports the rows it draws as CSV

A bound visual's tile menu SHALL offer Export CSV, which downloads the rows the visual draws from its query, named after the visual.

#### Scenario: A bound chart exports a row per category

- **GIVEN** a bound chart whose query has a category column and two series
- **WHEN** the owner chooses Export CSV on the visual
- **THEN** the file's header is the category column and the two series
- **AND** the file holds one row per category with each series' aggregated value

#### Scenario: A bound card exports its one value

- **GIVEN** a bound card over a dataset
- **WHEN** the owner chooses Export CSV on the card
- **THEN** the file holds one row with the card's aggregated value

#### Scenario: A static visual offers no CSV

- **GIVEN** a visual with no dataset binding
- **WHEN** the owner opens the visual's tile menu
- **THEN** no Export CSV command is offered

#### Scenario: A category typed as a formula is neutralised

- **GIVEN** a bound visual whose category holds text beginning with an equals sign
- **WHEN** the owner exports the visual's CSV
- **THEN** that cell is written so a spreadsheet opens it as text

#### Scenario: A capped source is said to be partial

- **GIVEN** a bound visual whose source read reached the row cap
- **WHEN** the owner exports the visual's CSV
- **THEN** an alert says the file holds the rows read, not every row in the source
- **AND** the file is still downloaded

### Requirement: A published dashboard exports from its published data

A viewer of a published dashboard SHALL export its page and its visuals' rows from the published data. An export on a published dashboard never reads the source live.

#### Scenario: A viewer's CSV holds the published values

- **GIVEN** a published dashboard whose source has changed since publication
- **WHEN** a viewer exports a visual's CSV
- **THEN** the file holds the values the published dashboard shows
- **AND** no live read of the source is made

#### Scenario: A viewer's CSV holds only the published columns

- **GIVEN** a published visual whose query reads one column of its source
- **WHEN** a viewer exports the visual's CSV
- **THEN** the file holds no column the query does not read
