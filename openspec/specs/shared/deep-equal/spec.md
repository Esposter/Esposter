## Purpose

checkIsDeepEqual in @esposter/shared — the structural comparison the app and azure-mock use, and the absorption of fast-deep-equal it replaced, with every upstream issue's verdict.

## Requirements

### Requirement: Two values are equal when they hold the same data

The comparison SHALL report true when two values hold the same data, comparing each property and element by its contents rather than by identity.

#### Scenario: Two objects with the same nested data are equal

- **GIVEN** two objects with the same keys and the same nested arrays and objects
- **WHEN** a caller compares them
- **THEN** the result is true

#### Scenario: Two objects with different keys are unequal

- **GIVEN** two objects where one has a key the other lacks
- **WHEN** a caller compares them
- **THEN** the result is false

#### Scenario: An object with a data field named valueOf is compared by its keys

- **GIVEN** two objects that each hold a data field named valueOf and no other difference
- **WHEN** a caller compares them
- **THEN** the result is true when the fields hold the same data

### Requirement: NaN and invalid dates compare equal to themselves

The comparison SHALL treat NaN as equal to NaN and SHALL treat two invalid dates as equal.

#### Scenario: NaN is equal to NaN

- **GIVEN** two values that are each NaN
- **WHEN** a caller compares them
- **THEN** the result is true

#### Scenario: Two invalid dates are equal

- **GIVEN** two dates that are both invalid
- **WHEN** a caller compares them
- **THEN** the result is true

### Requirement: Values of different kinds are unequal

The comparison SHALL report false when two objects have different constructors, even if their keys match.

#### Scenario: An array and a plain object with the same indices are unequal

- **GIVEN** an array and a plain object with matching index keys
- **WHEN** a caller compares them
- **THEN** the result is false

### Requirement: Maps and Sets compare their contents

The comparison SHALL compare two Maps by their entries and two Sets by their members, and SHALL hold a Set's members by identity.

#### Scenario: Two Maps with the same entries are equal

- **GIVEN** two Maps holding the same keys with equal values
- **WHEN** a caller compares them
- **THEN** the result is true

#### Scenario: Two Sets of equal but distinct objects are unequal

- **GIVEN** two Sets whose members are separate objects with equal contents
- **WHEN** a caller compares them
- **THEN** the result is false

### Requirement: Regular expressions compare their source and flags

The comparison SHALL report two regular expressions equal only when their source and flags match.

#### Scenario: Regular expressions with different flags are unequal

- **GIVEN** two regular expressions with the same source and different flags
- **WHEN** a caller compares them
- **THEN** the result is false

### Requirement: Binary data compares its bytes

The comparison SHALL compare typed arrays and buffers byte by byte over each view's own range.

#### Scenario: Positive and negative zero differ in a typed array

- **GIVEN** two typed arrays of floats holding positive zero and negative zero
- **WHEN** a caller compares them
- **THEN** the result is false

#### Scenario: A view compares only its own range of bytes

- **GIVEN** two views over the same kind of buffer that expose the same bytes in their own ranges
- **WHEN** a caller compares them
- **THEN** the result is true

### Requirement: Promises and weak collections are equal only to themselves

The comparison SHALL report two distinct Promises or two distinct weak collections as unequal.

#### Scenario: Two distinct Promises are unequal

- **GIVEN** two separate Promise objects
- **WHEN** a caller compares them
- **THEN** the result is false

### Requirement: Cyclic structures are not detected

The comparison SHALL NOT detect a cycle, so comparing data that refers to itself fails with a stack overflow.

#### Scenario: A self-referencing object overflows the comparison

- **GIVEN** two objects that each refer to themselves
- **WHEN** a caller compares them
- **THEN** the call fails with a stack overflow error

### Requirement: Every upstream issue and pull request carries exactly one verdict

The audit of the upstream package SHALL record exactly one verdict for every issue and pull request it reads.

#### Scenario: A reviewer finds the outcome of an upstream issue

- **GIVEN** an issue or pull request on the upstream repository
- **WHEN** a reviewer looks it up on the audit page
- **THEN** exactly one verdict is recorded for it
