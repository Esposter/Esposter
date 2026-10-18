## ADDED Requirements

### Requirement: A formula keeps the value mathjs gave it

The evaluator SHALL give every formula mathjs evaluated to a finite number, over numeric variables, the value mathjs gave it, except where mathjs's answer is a recorded defect.

#### Scenario: The parity corpus matches mathjs's recorded answers

- **GIVEN** the corpus of formulas and the answers mathjs gave them, recorded before it was removed
- **WHEN** the evaluator evaluates the corpus
- **THEN** each formula's value equals the recorded answer
- **AND** each formula listed as a fix has the corrected value instead

#### Scenario: Power binds tighter than a sign

- **WHEN** the evaluator evaluates `-2 ^ 2`
- **THEN** the value is `-4`

#### Scenario: Modulo takes the sign of the divisor

- **WHEN** the evaluator evaluates `-7 % 3`
- **THEN** the value is `2`

#### Scenario: A trailing percent sign is a percentage of the left side

- **WHEN** the evaluator evaluates `100 + 3%`
- **THEN** the value is `103`

#### Scenario: A name beside a number multiplies it

- **GIVEN** the variable `col0` is `3`
- **WHEN** the evaluator evaluates `2 col0`
- **THEN** the value is `6`

#### Scenario: Rounding goes half away from zero

- **WHEN** the evaluator evaluates `round(-2.5)`
- **THEN** the value is `-3`

### Requirement: A comparison yields one or zero

A comparison or a logical operator SHALL yield `1` when it holds and `0` when it does not.

#### Scenario: A bare comparison has a value

- **GIVEN** the variable `col0` is `5`
- **WHEN** the evaluator evaluates `col0 > 3`
- **THEN** the value is `1`

#### Scenario: A chained comparison holds only when each pair does

- **WHEN** the evaluator evaluates `1 < 3 < 2`
- **THEN** the value is `0`

### Requirement: A function takes flat lists where mathjs does

A function SHALL accept a flat list of numbers in square brackets wherever mathjs reads one to a number, and a list inside a list SHALL be refused.

#### Scenario: A function reads two lists

- **WHEN** the evaluator evaluates `dot([1, 2], [3, 4])`
- **THEN** the value is `11`

#### Scenario: A list inside a list is refused

- **WHEN** a caller parses `det([[1, 2], [3, 4]])`
- **THEN** the parse fails with an error naming the inner list's position

### Requirement: A parse error names where it happened

A formula that cannot be parsed SHALL be refused with an error naming the character it starts at, and the function or the arity at fault.

#### Scenario: An unclosed parenthesis

- **WHEN** a caller parses `(1 + 2`
- **THEN** the parse fails with an error naming the end of the expression

#### Scenario: An unknown function

- **WHEN** a caller parses `foo(1)`
- **THEN** the parse fails with an error naming `foo` and its position

#### Scenario: Nesting beyond the limit

- **GIVEN** a formula whose parentheses nest deeper than the parser's depth limit
- **WHEN** a caller parses it
- **THEN** the parse fails with an error instead of exhausting the stack

### Requirement: A name never reaches an object's prototype

A name SHALL resolve only to an assigned name, a variable in the scope or a named constant.

#### Scenario: A prototype member's name is unknown

- **WHEN** the evaluator evaluates `constructor`
- **THEN** the value is not a number

### Requirement: A formula's free names follow its evaluation order

The names a formula reads before anything binds them SHALL be its free names, where a name is bound by a constant, or by an assignment that every path to the read has run.

#### Scenario: A name read before its assignment is free

- **WHEN** a caller lists the free names of `x * (x = 2)`
- **THEN** the list is `x`

#### Scenario: A name every branch assigns is bound

- **WHEN** a caller lists the free names of `(c ? (y = 1) : (y = 2)) + y`
- **THEN** the list is `c`
