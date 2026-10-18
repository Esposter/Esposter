## Purpose

The dedent tag in @esposter/shared — indentation stripped from a template, escapes consumed on static text only, and the upstream dedent 1.7.2 issues each given a verdict.

## Requirements

### Requirement: Common indentation is stripped

The template tag SHALL remove the indentation that every line holding text shares from a multi-line template.

#### Scenario: Indented template loses its shared indentation

- **GIVEN** a template whose text lines are all indented by the same amount
- **WHEN** a caller tags the template
- **THEN** each line starts at the shallowest indentation of the template
- **AND** the text of each line is unchanged

#### Scenario: Blank lines do not set the indentation

- **GIVEN** a template whose first line is blank and whose text lines are indented
- **WHEN** a caller tags the template
- **THEN** the blank lines are ignored when the indentation is measured

#### Scenario: Tab indentation is stripped the same way

- **GIVEN** a template whose text lines are indented with tabs
- **WHEN** a caller tags the template
- **THEN** the shared tab indentation is removed from every line

### Requirement: Escapes are cooked only in the template's own text

The template tag SHALL cook escape sequences only in the static text of a template and SHALL keep every interpolated value exactly as given.

#### Scenario: An interpolated value keeps its backslash sequences

- **GIVEN** a value containing a backslash followed by the letter n
- **WHEN** a caller interpolates the value into a template
- **THEN** the backslash and the letter n appear in the result as typed

#### Scenario: An escaped backslash before an n stays a backslash and an n

- **GIVEN** a template holding an escaped backslash followed by the letter n
- **WHEN** a caller tags the template
- **THEN** the result holds a single backslash followed by the letter n

#### Scenario: An escaped backslash does not escape the escape after it

- **GIVEN** a template holding an escaped backslash followed by an escaped newline
- **WHEN** a caller tags the template
- **THEN** the result holds a backslash followed by a line break

#### Scenario: A Windows-style path in a value is kept as typed

- **GIVEN** a value holding a Windows-style path with backslash separators
- **WHEN** a caller interpolates the value into a template
- **THEN** the path appears in the result with its backslashes unchanged

### Requirement: Escapes are cooked in the forms a template author writes on purpose

The template tag SHALL cook the single-letter, numeric and Unicode escapes of a template's static text and SHALL keep any other escape as typed.

#### Scenario: Single-letter and numeric escapes are cooked

- **GIVEN** a template holding an escaped tab and a hexadecimal escape
- **WHEN** a caller tags the template
- **THEN** the escaped tab becomes a tab character
- **AND** the hexadecimal escape becomes the character it names

#### Scenario: An escape the template author does not write on purpose is kept as typed

- **GIVEN** a template holding an escaped closing brace
- **WHEN** a caller tags the template
- **THEN** the backslash and the brace appear in the result as typed

#### Scenario: A Unicode escape past the last code point is kept rather than thrown

- **GIVEN** a template holding a Unicode escape whose code point is past the last valid code point
- **WHEN** a caller tags the template
- **THEN** the escape appears in the result as typed
- **AND** no error is thrown

### Requirement: A string argument keeps its escapes unless asked to cook them

The template tag SHALL take a string argument as raw text and SHALL cook its escapes only when the escape option is set.

#### Scenario: A string keeps its backslash sequences by default

- **GIVEN** a string argument holding a backslash followed by the letter n
- **WHEN** a caller calls the tag with the string as a function argument
- **THEN** the backslash and the letter n remain in the result

#### Scenario: Cooking a string is opt-in

- **GIVEN** a string argument holding a backslash followed by the letter n
- **WHEN** a caller calls the tag with the escape option set
- **THEN** the sequence is cooked into a line break

### Requirement: A line continuation joins its line to the next

The template tag SHALL join a line ending in a backslash to the line after it.

#### Scenario: A backslash at the end of a line continues it

- **GIVEN** a template whose line ends in a backslash
- **WHEN** a caller tags the template
- **THEN** the following line continues on the same line of the result

### Requirement: The result is trimmed of its surrounding whitespace by default

The template tag SHALL trim the leading and trailing whitespace of its result unless the trim option is turned off.

#### Scenario: Surrounding whitespace is removed by default

- **GIVEN** a template with blank lines before and after its text
- **WHEN** a caller tags the template
- **THEN** the result begins and ends with its text

#### Scenario: Turning the trim off keeps the surrounding whitespace

- **GIVEN** a template with blank lines before and after its text
- **WHEN** a caller tags the template with the trim option turned off
- **THEN** the surrounding whitespace remains in the result

#### Scenario: An escaped newline at the end survives the trim

- **GIVEN** a template that ends in an escaped newline
- **WHEN** a caller tags the template
- **THEN** the result ends in a line break

### Requirement: Interpolated multi-line values align only when asked to

The template tag SHALL indent each line of a multi-line interpolated value to the indentation of the line it is inserted on, and SHALL do so only when the align option is set.

#### Scenario: A multi-line value takes the indentation of its insertion line

- **GIVEN** the align option set
- **WHEN** a caller interpolates a multi-line value on an indented line
- **THEN** each following line of the value is indented to match that line

#### Scenario: Values are inserted as given by default

- **GIVEN** the default options
- **WHEN** a caller interpolates a multi-line value on an indented line
- **THEN** the lines of the value keep their own indentation

### Requirement: Options derive a new tag without changing the original

The template tag SHALL return a new tag with the given options merged over the current ones and SHALL leave the original tag's options unchanged.

#### Scenario: Options applied to a derived tag

- **GIVEN** a tag with its default options
- **WHEN** a caller derives a new tag with one option changed
- **THEN** the new tag applies the changed option
- **AND** the original tag keeps its default options

### Requirement: Every upstream issue carries exactly one verdict

The audit of the upstream package SHALL record exactly one verdict for every issue and pull request it reads.

#### Scenario: A reviewer finds the outcome of an upstream issue

- **GIVEN** an issue on the upstream repository
- **WHEN** a reviewer looks the issue up on the audit page
- **THEN** exactly one verdict is recorded for it
