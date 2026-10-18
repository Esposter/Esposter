## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: A stored math expression never stops a sheet opening

A sheet SHALL open whatever its stored math expressions hold, and a stored expression that cannot be parsed SHALL leave its column's cells empty.

#### Scenario: A stored expression the parser refuses

- **GIVEN** a sheet whose stored math column holds an expression that cannot be parsed
- **WHEN** the owner opens the sheet
- **THEN** the sheet opens
- **AND** the math column's cells are empty
