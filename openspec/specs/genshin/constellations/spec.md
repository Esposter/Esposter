## Purpose

Each playable character's six constellations read per skill set from the game's table, the third and fifth raising a combat talent by three, and a character holding its own Stella Fortuna, which a duplicate draw brings and activates the next constellation with, and a five-star past six copies brings a Masterless one. The constellations' effects, the Traveler's element sets' sources and the Constellation tab wait on their pages.

## Requirements

### Requirement: A character's constellations are activated one at a time in order

A character's constellations SHALL be activated one at a time in order, each activation spending one Stella Fortuna of that character.

#### Scenario: The next constellation is activated and one Stella Fortuna is spent

- **GIVEN** a character with two constellations active and one of its Stella Fortuna held
- **WHEN** the character's next constellation is activated
- **THEN** the third constellation is active
- **AND** one of its Stella Fortuna is spent

### Requirement: A refused activation leaves the character unchanged

A constellation activation SHALL be refused when the set has no constellation left or none to activate, or when the character holds no Stella Fortuna, and a refused activation SHALL leave the character as it was.

#### Scenario: An activation is refused for a set with every constellation active

- **GIVEN** a set whose six constellations are all active
- **WHEN** an activation is asked for
- **THEN** the activation is refused
- **AND** the character is unchanged

#### Scenario: An activation is refused with no Stella Fortuna held

- **GIVEN** a character with a constellation left to activate and no Stella Fortuna held
- **WHEN** an activation is asked for
- **THEN** the activation is refused
- **AND** the character is unchanged

#### Scenario: An activation is refused for a set with no constellations

- **GIVEN** a set that holds no constellations, as the Traveler's does
- **WHEN** an activation is asked for
- **THEN** the activation is refused
- **AND** the character is unchanged

### Requirement: The third and fifth constellations raise a combat talent by three levels

A character's third and fifth constellations SHALL each raise one combat talent by three levels, and its other four constellations SHALL raise no talent.

#### Scenario: An active third constellation raises its talent

- **GIVEN** a character with its third constellation active
- **WHEN** a kit reads the talent that constellation raises
- **THEN** the talent is raised by three levels
- **AND** the raise is not paid for with materials

#### Scenario: A switch constellation raises no talent

- **GIVEN** a character with its second constellation active
- **WHEN** the talents a kit reads are summed
- **THEN** no talent is raised by the second constellation

### Requirement: The constellation table refuses a raise that disagrees with its description

The constellation table SHALL refuse any raise whose named skill disagrees with the constellation's description, rather than raise the wrong talent.

#### Scenario: A raise that names the wrong skill refuses the table

- **GIVEN** a constellation whose action names a skill its description does not name
- **WHEN** the table is built
- **THEN** the build is refused

### Requirement: A skill set whose constellations the game data cannot name is left out with a note

A skill set with a constellation the game data gives no config for SHALL be left out of the table, with a note.

#### Scenario: A set with an unnamed constellation is left out

- **GIVEN** a skill set with a constellation the game data gives no config for
- **WHEN** the table is built
- **THEN** that set is left out of the table
- **AND** a note names the set

### Requirement: A skill set's six constellations spend one item of its own character

The six constellations of a skill set SHALL all spend one Stella Fortuna of the set's own character.

#### Scenario: A set whose six constellations spend different items is refused

- **GIVEN** a skill set whose six constellations do not all spend one item of its character
- **WHEN** the table is built
- **THEN** the build refuses that set

### Requirement: A duplicate draw brings its character's Stella Fortuna up to the sixth duplicate

A wish's duplicate of a character SHALL bring one Stella Fortuna of that character, up to and including the sixth duplicate, and no duplicate after it.

#### Scenario: A duplicate draw brings a Stella Fortuna

- **GIVEN** a character with one copy held
- **WHEN** a wish draws it again
- **THEN** one of its Stella Fortuna is handed over to the caller

#### Scenario: The sixth duplicate is the last to bring a Stella Fortuna

- **GIVEN** a character with six duplicates already drawn
- **WHEN** a wish draws the sixth duplicate
- **THEN** one of its Stella Fortuna is handed over
- **AND** the next duplicate brings none

#### Scenario: A new character brings no Stella Fortuna

- **GIVEN** a character not yet held
- **WHEN** a wish draws it
- **THEN** no Stella Fortuna is handed over

### Requirement: A five-star drawn past six copies brings a Masterless Stella Fortuna

A five-star drawn past its sixth copy SHALL bring a Masterless Stella Fortuna to the wallet, once for each copy.

#### Scenario: A five-star past six copies adds a Masterless Stella Fortuna to the wallet

- **GIVEN** a five-star character with six copies held
- **WHEN** a wish draws another copy
- **THEN** one Masterless Stella Fortuna is added to the wallet

### Requirement: A new character starts with no constellation active and no Stella Fortuna

A newly created character SHALL start with no constellation active and no Stella Fortuna held.

#### Scenario: A character is created

- **GIVEN** no character of that kind exists yet
- **WHEN** the character is created
- **THEN** none of its constellations is active
- **AND** it holds no Stella Fortuna
