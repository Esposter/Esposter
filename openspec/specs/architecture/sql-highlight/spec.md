## Purpose

highlightSql in apps/web, the replacement for the sql-highlight package in the dev query log — its token kinds, its colour map and the upstream audit, with every issue given a verdict.

## Requirements

### Requirement: The query log colours a query without changing its text

The query log SHALL colour parts of a query and SHALL leave every other character unchanged, so that removing the colour returns the query exactly as written.

#### Scenario: A logged query with colour removed

- **GIVEN** a query written to the query log
- **WHEN** the colour is removed from the logged line
- **THEN** the text is identical to the query as written

#### Scenario: A word beside a bracket or an operator

- **GIVEN** a query containing brackets, operators and spaces
- **WHEN** the query is logged
- **THEN** those characters are shown as plain text, unchanged

### Requirement: Colour appears only on a terminal that allows it

The query log SHALL show colour only when it is written to a terminal and the environment does not ask for no colour.

#### Scenario: The log is written to a file

- **GIVEN** the query log is written to a file
- **WHEN** a query is logged
- **THEN** the line is plain text with no colour

#### Scenario: The environment asks for no colour

- **GIVEN** a terminal with the environment's no-colour setting on
- **WHEN** a query is logged
- **THEN** the line is plain text with no colour

### Requirement: Each token kind has its own style

The query log SHALL paint keywords, strings, quoted names, numbers, parameters, function calls and comments each in its own style.

#### Scenario: A keyword and a string in one query

- **GIVEN** a query containing a keyword and a string literal
- **WHEN** the query is logged on a colour terminal
- **THEN** the keyword and the string each show their own style

#### Scenario: A word that begins with a keyword

- **GIVEN** a query containing a word that starts with a keyword's letters, such as a column named index
- **WHEN** the query is logged
- **THEN** that word is not painted as a keyword

#### Scenario: A keyword inside a string

- **GIVEN** a query containing a keyword inside a string literal
- **WHEN** the query is logged
- **THEN** the keyword is painted as part of the string, not as a keyword

#### Scenario: A word before an opening bracket

- **GIVEN** a query containing a word that is not a keyword followed by an opening bracket
- **WHEN** the query is logged
- **THEN** the word is painted as a function call

### Requirement: Quoted text follows the database's own quoting rules

Quoted text SHALL end at its closing quote, where a doubled quote is the only escape, and a backslash SHALL be an ordinary character.

#### Scenario: A string ending in a backslash

- **GIVEN** a query containing a string whose last character is a backslash before its closing quote
- **WHEN** the query is logged
- **THEN** the string ends at its closing quote
- **AND** the text after it is not treated as part of the string

### Requirement: Token colours are read from one map

Token colours SHALL be defined in one map, so that tests check the kind of each token rather than its colour.

#### Scenario: A colour is changed in the map

- **GIVEN** the colour map for token kinds
- **WHEN** a colour is changed in that map
- **THEN** no test needs to change for a colour that is only a style choice
