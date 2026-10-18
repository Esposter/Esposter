## Purpose

An Elemental Monument as a state machine, lit by its element or a reaction of its own and, when timed, going out after its time. Built in the world package; not yet placed, struck or solved in the world.

## Requirements

### Requirement: A monument lights when struck by its own element or a reaction of it

A monument SHALL light when struck by its own element or by a reaction whose element is its own.

#### Scenario: Reaction spreads the monument's element

- **GIVEN** a Pyro monument
- **WHEN** a Swirl spreads Pyro onto it
- **THEN** the monument is lit

#### Scenario: Another element strikes it

- **GIVEN** a Pyro monument that is not lit
- **WHEN** a Hydro strike lands on it
- **THEN** the monument stays as it was

### Requirement: A lit monument's clock restarts from each strike that lights it

A lit monument's clock SHALL restart from the strike that lights it.

#### Scenario: Timed monument struck again

- **GIVEN** a lit timed monument
- **WHEN** its element strikes it again
- **THEN** its clock restarts from that strike

### Requirement: A timed monument goes out after its time, and an untimed one stays lit

A timed monument that is not lit again SHALL go out once its lit time has passed since it was lit, and an untimed monument SHALL stay lit.

#### Scenario: Timed monument times out

- **GIVEN** a lit timed monument
- **WHEN** its lit time has passed without it being lit again
- **THEN** the monument goes out

#### Scenario: Untimed monument

- **GIVEN** a lit untimed monument
- **WHEN** any amount of time passes
- **THEN** the monument stays lit

### Requirement: A monument's elemental state moves on each fixed step

A monument's elemental state SHALL move on each fixed step, so its auras decay and its Burning ticks Pyro, lighting it from any reaction of its own.

#### Scenario: Burning ticks on the fixed step

- **GIVEN** a monument whose elemental state holds Burning
- **WHEN** a fixed step passes
- **THEN** the Burning ticks its Pyro
- **AND** its auras decay by the step

### Requirement: A puzzle is solved only when all its monuments are lit together

A puzzle of monuments SHALL count as solved only when every monument of it is lit together, and never when none is lit.

#### Scenario: Every monument lit together

- **GIVEN** every monument of a puzzle is lit
- **WHEN** the puzzle is checked
- **THEN** the puzzle is solved

#### Scenario: Some monuments unlit

- **GIVEN** some monuments of a puzzle are not lit
- **WHEN** the puzzle is checked
- **THEN** the puzzle is not solved

#### Scenario: No monument lit

- **GIVEN** no monument of a puzzle is lit
- **WHEN** the puzzle is checked
- **THEN** the puzzle is not solved
