## MODIFIED Requirements

### Requirement: A formula keeps the value mathjs gave it

The evaluator SHALL give every formula mathjs evaluated to a finite number, over numeric variables, the value mathjs gave it, except where mathjs's answer is a recorded defect.

#### Scenario: The parity corpus matches mathjs's recorded answers

- **GIVEN** the corpus of formulas and the answers mathjs gave them, as the parity record holds them
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

#### Scenario: A modulo of a large dividend keeps its exact residue

- **WHEN** the evaluator evaluates `mod(1e18, 7)`
- **THEN** the value is `1`, where mathjs gives `0`

#### Scenario: A negative zeta past the gamma's overflow is finite

- **WHEN** the evaluator evaluates `zeta(-200.5)`
- **THEN** the value is finite and negative, where mathjs gives negative infinity

#### Scenario: A name beside a number multiplies it

- **GIVEN** the variable `col0` is `3`
- **WHEN** the evaluator evaluates `2 col0`
- **THEN** the value is `6`

#### Scenario: Rounding goes half away from zero

- **WHEN** the evaluator evaluates `round(-2.5)`
- **THEN** the value is `-3`
