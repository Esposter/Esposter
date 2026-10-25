## ADDED Requirements

### Requirement: An agent's Sheet column edit gives the rows the editor gives

An agent's column edit that computes values across rows SHALL produce the same rows as the same edit made in the sheet editor.

#### Scenario: Column rename re-keys every row

- **GIVEN** a Sheet has a column with a value in every row
- **WHEN** an agent renames the column
- **THEN** every row's value sits under the new name

#### Scenario: Column type change converts every cell

- **GIVEN** a Sheet column holds values of one type
- **WHEN** an agent changes the column's type
- **THEN** every cell holds the value the editor gives it for the new type

#### Scenario: Date format change rewrites every date

- **GIVEN** a Sheet column holds dates
- **WHEN** an agent changes the column's date format
- **THEN** every date in the column is shown in the new format

### Requirement: A command naming a row by id lands on that row

A command an agent sends naming a row by its id SHALL change that row, and SHALL apply to newer content when the owner has edited since the agent read it.

#### Scenario: A command lands on its row after a row is inserted above it

- **GIVEN** an owner inserts a row above a row an agent names by id
- **WHEN** the agent's command sets a cell on the named row
- **THEN** the cell on the named row changes
- **AND** the row inserted above is unchanged

#### Scenario: A command based on older content applies to the newer content

- **GIVEN** an agent read a Sheet and the owner has edited it since
- **WHEN** the agent's command names a row by id and sets a cell
- **THEN** the command applies to the newer content

### Requirement: Ticking a repeating todo rolls it to its next date

Ticking a repeating todo SHALL roll its due date to the next occurrence in its time zone, and SHALL NOT mark it completed.

#### Scenario: An agent ticks a repeating todo

- **GIVEN** a repeating todo is due in its time zone
- **WHEN** an agent ticks it
- **THEN** its due date moves to the next occurrence
- **AND** the todo is not marked completed

### Requirement: A follow-ups key cannot tick a todo the owner wrote

A key holding only the follow-ups scope SHALL NOT tick a todo the owner wrote.

#### Scenario: A follow-ups key cannot tick a todo the owner wrote

- **GIVEN** a key holds only the follow-ups scope
- **WHEN** the key ticks a repeating todo the owner wrote
- **THEN** the request is refused
- **AND** the todo's due date is unchanged

### Requirement: An agent writes a Note's content from Markdown

An agent SHALL be able to write a Note's content from Markdown, either replacing the Note's content or appending to it.

#### Scenario: A Note written from Markdown replaces its content

- **GIVEN** a Note has existing content
- **WHEN** an agent writes Markdown with a heading and a link, replacing the content
- **THEN** the Note holds that heading and that link
- **AND** the earlier content is gone

#### Scenario: A Note written from Markdown appends to its content

- **GIVEN** a Note has existing content
- **WHEN** an agent writes Markdown, appending it
- **THEN** the existing content is kept
- **AND** the Markdown follows it
