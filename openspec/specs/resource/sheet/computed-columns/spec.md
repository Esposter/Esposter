## Purpose

Read-only derived columns — lazy per-cell evaluation of math, string, conversion, date, regex, and aggregation transformations with chaining and cycle protection.

## Requirements

### Requirement: Computed columns are read-only

A computed column SHALL NOT accept typed values, and its cells SHALL show only what its transformation derives.

#### Scenario: Owner types into a computed cell

- **GIVEN** a sheet has a computed column
- **WHEN** the owner tries to type a value into one of its cells
- **THEN** the cell's value does not change

### Requirement: Computed values follow their source values

A computed column SHALL show a value that reflects the current values of its sources.

#### Scenario: Source value changes

- **GIVEN** a computed column doubles a column of numbers
- **WHEN** the owner changes a number in the source column
- **THEN** the computed cell shows the doubled new value

### Requirement: Math columns evaluate an expression over their source columns

A math computed column SHALL evaluate its expression over the values of the source columns the owner chose.

#### Scenario: Expression over two columns

- **GIVEN** a math column computes the price times one minus the discount
- **WHEN** the price is 100 and the discount is 0.2
- **THEN** the cell shows 80

#### Scenario: Expression that cannot be parsed

- **GIVEN** the owner enters an expression that cannot be parsed
- **WHEN** the owner saves the column
- **THEN** the column is not saved
- **AND** the form shows the parser's error

#### Scenario: Expression naming an unbound column

- **GIVEN** the owner enters an expression using a column variable no binding declares
- **WHEN** the owner saves the column
- **THEN** the column is not saved
- **AND** the form names the unbound variable

#### Scenario: A comparison shows one or zero

- **GIVEN** a math column checks whether the price is over 50
- **WHEN** the price is 80
- **THEN** the cell shows 1

### Requirement: Empty source values count as zero in math

Empty source values SHALL count as zero in a math expression.

#### Scenario: Empty source cell

- **GIVEN** a math column adds two source columns
- **WHEN** one source cell is empty
- **THEN** the result treats that cell as zero

### Requirement: A math result that is not a finite number shows empty

A math result that is not a finite number SHALL show as an empty cell.

#### Scenario: Division by zero

- **GIVEN** a math column divides one column by another
- **WHEN** the divisor is zero
- **THEN** the cell is empty

### Requirement: String transformations change the text of their source

A string computed column SHALL produce its source text in lower case, title case, trimmed or upper case, as the owner chose.

#### Scenario: Title case

- **GIVEN** a string column is set to title case
- **WHEN** its source holds the text hello world
- **THEN** the cell shows Hello World

### Requirement: A split column returns one segment of its source text

A split column SHALL return the segment at the chosen index of its source text, and SHALL show an empty cell when that segment does not exist.

#### Scenario: Index beyond the segments

- **GIVEN** a split column returns segment two of a comma-separated source
- **WHEN** the source holds a single value
- **THEN** the cell is empty

### Requirement: A pattern column fills placeholders from its source columns

A pattern column SHALL fill each positional placeholder with the value of the source column at that position, and SHALL be refused when a placeholder names no source column.

#### Scenario: First name and last name

- **GIVEN** a pattern column uses the placeholders for first name then last name
- **WHEN** the first name is Ada and the last name is Lovelace
- **THEN** the cell shows Ada Lovelace

#### Scenario: Placeholder with no source

- **GIVEN** the owner's pattern uses a placeholder beyond the chosen source columns
- **WHEN** the owner saves the column
- **THEN** the column is not saved

### Requirement: A conversion column coerces its source to the chosen type

A conversion column SHALL coerce its source value to the type the owner chose, using the same rules as changing a column's type.

#### Scenario: Text converted to a number

- **GIVEN** a conversion column converts to number
- **WHEN** its source holds the text 42
- **THEN** the cell shows 42

### Requirement: A date part column returns one calendar field of a date

A date part column SHALL return the chosen calendar field of its source date, and SHALL accept only a date column as its source.

#### Scenario: Year of a date

- **GIVEN** a date part column extracts the year
- **WHEN** its source date is in 2026
- **THEN** the cell shows 2026

#### Scenario: Source is not a date column

- **GIVEN** the owner picks a text column as the source of a date part column
- **WHEN** the owner saves the column
- **THEN** the column is not saved

### Requirement: A regex column returns a capture group of its source

A regex column SHALL return the chosen capture group of the pattern's match in its source text, and SHALL show an empty cell when nothing matches.

#### Scenario: Domain of an email address

- **GIVEN** a regex column captures the part after the at sign
- **WHEN** its source holds a@example.com
- **THEN** the cell shows example.com

#### Scenario: No match

- **GIVEN** a regex column captures the part after the at sign
- **WHEN** its source holds text with no at sign
- **THEN** the cell is empty

### Requirement: Aggregations offer seven calculations over a column

Aggregation columns SHALL offer average, count, maximum, minimum, percent of total, rank and running total, ignoring empty and non-numeric source values.

#### Scenario: Rank of values

- **GIVEN** a rank column ranks a column of numbers
- **WHEN** the values are 5, 9 and 1
- **THEN** 9 has rank 1, 5 has rank 2 and 1 has rank 3

#### Scenario: All source cells empty

- **GIVEN** an average column ranks a column with no numeric values
- **WHEN** the sheet is shown
- **THEN** the cells are empty

### Requirement: An aggregation uses the rows the grid shows, or the whole sheet as a dataset

An aggregation SHALL be computed over the rows the grid's filters leave in view, and over every row of the sheet when the sheet is read as a dataset.

#### Scenario: Filtered grid and dataset disagree

- **GIVEN** a grid filter hides some rows of a sheet with a sum aggregation
- **WHEN** the owner views the grid
- **THEN** the aggregation uses only the visible rows
- **AND** when a dashboard reads the sheet's dataset the aggregation uses every row

### Requirement: A computed column may use another computed column as its source

A computed column SHALL be able to use another computed column as its source.

#### Scenario: Chained computed columns

- **GIVEN** one computed column doubles a source column
- **AND** a second computed column adds one to the first
- **WHEN** the sheet is shown
- **THEN** the second column shows the source value doubled and then increased by one

### Requirement: A cycle of computed columns shows empty cells

A computed column that depends on itself, directly or through other computed columns, SHALL show empty cells rather than an error.

#### Scenario: Two columns depend on each other

- **GIVEN** two computed columns each use the other as a source
- **WHEN** the sheet is shown
- **THEN** both columns show empty cells
- **AND** no error is shown

#### Scenario: Two math columns depend on each other

- **GIVEN** two math columns each add one to the other
- **WHEN** the sheet is shown
- **THEN** both columns show empty cells

### Requirement: A dashboard reading the sheet receives its computed columns

A dashboard reading a sheet's dataset SHALL receive the computed columns with their values.

#### Scenario: Dashboard charts a computed column

- **GIVEN** a dashboard charts a computed column of a sheet
- **WHEN** the dashboard loads
- **THEN** the chart shows the computed values

### Requirement: A computed column behaves as the type it produces

A computed column SHALL behave in filters, statistics and charts as the type its transformation produces.

#### Scenario: Number-producing column charted

- **GIVEN** a computed column produces numbers
- **WHEN** the owner charts it
- **THEN** it is charted as a number column

### Requirement: A stored math expression never stops a sheet opening

A sheet SHALL open whatever its stored math expressions hold, and a stored expression that cannot be parsed SHALL leave its column's cells empty.

#### Scenario: A stored expression the parser refuses

- **GIVEN** a sheet whose stored math column holds an expression that cannot be parsed
- **WHEN** the owner opens the sheet
- **THEN** the sheet opens
- **AND** the math column's cells are empty
