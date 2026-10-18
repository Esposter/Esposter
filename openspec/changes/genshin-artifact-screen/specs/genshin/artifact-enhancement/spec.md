## ADDED Requirements

### Requirement: A character wears one piece of each slot

A character SHALL wear at most one artifact of each slot, and equipping a piece into a slot SHALL return the piece it replaces.

#### Scenario: equipping into an empty slot displaces nothing

- **GIVEN** a character wears no artifact in a slot
- **WHEN** a piece of that slot is equipped
- **THEN** the character wears the piece
- **AND** no piece is returned

#### Scenario: equipping into a worn slot returns the piece it replaces

- **GIVEN** a character wears a piece in a slot
- **WHEN** another piece of that slot is equipped
- **THEN** the character wears the new piece
- **AND** the piece it replaced is returned

### Requirement: Unequipping takes off a worn piece only

A character SHALL take off the piece worn in a slot, and a slot with no piece in it SHALL be refused.

#### Scenario: unequipping returns the worn artifact and leaves its slot empty

- **GIVEN** a character wears a piece in a slot
- **WHEN** the slot is unequipped
- **THEN** the piece is returned
- **AND** the slot is empty

#### Scenario: unequipping an empty slot is refused

- **GIVEN** a character wears no piece in a slot
- **WHEN** the slot is unequipped
- **THEN** the unequip is refused

### Requirement: A set's bonus is active from its piece count

A set's bonus SHALL be active on a character once the character wears the piece count the bonus names, and not before.

#### Scenario: a set's two-piece bonus is active from two pieces

- **GIVEN** a character wears two pieces of a set with a two-piece and a four-piece bonus
- **WHEN** its active set bonuses are read
- **THEN** the two-piece bonus is active
- **AND** the four-piece bonus is not

#### Scenario: a set's four-piece bonus is active from four pieces

- **GIVEN** a character wears four pieces of a set with a two-piece and a four-piece bonus
- **WHEN** its active set bonuses are read
- **THEN** both bonuses are active

#### Scenario: a single piece of a set activates none of its bonuses

- **GIVEN** a character wears one piece of a set
- **WHEN** its active set bonuses are read
- **THEN** no bonus of that set is active

#### Scenario: a set the table does not hold is refused

- **GIVEN** a character wears a piece of a set the set table does not hold
- **WHEN** its active set bonuses are read
- **THEN** the read is refused

### Requirement: A worn artifact is enhanced in place, and only with the Mora it costs

Enhancing a worn artifact SHALL gain it the EXP of the materials and fodders given, charge the Mora those cost, and refuse
the enhancement when the wallet holds less Mora than that.

#### Scenario: a worn artifact takes the materials' EXP and its fodder's, and the Mora they cost is charged

- **GIVEN** a character wears an artifact in a slot, and a wallet holds Mora
- **WHEN** the artifact is enhanced with materials and a fodder
- **THEN** the artifact gains the EXP the materials and the fodder give
- **AND** the wallet pays a Mora for each point of EXP the materials and the fodder's base give

#### Scenario: an enhancement the wallet cannot pay for is refused

- **GIVEN** the wallet holds less Mora than the enhancement costs
- **WHEN** the worn artifact is enhanced
- **THEN** the enhancement is refused

#### Scenario: an enhancement of an empty slot is refused

- **GIVEN** a character wears no piece in a slot
- **WHEN** an enhancement of that slot is made
- **THEN** the enhancement is refused
