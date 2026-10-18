## ADDED Requirements

### Requirement: Details Attribute List

The character screen SHALL open a Details list of every attribute, in three groups, from the Attributes tab.

#### Scenario: Details lists the advanced and elemental attributes beyond the summary

- **GIVEN** a character's Attributes tab open with its summary shown
- **WHEN** the player presses Details
- **THEN** the list shows the advanced and elemental attributes in three groups

#### Scenario: pressing Details again closes the list

- **GIVEN** the Details list is open
- **WHEN** the player presses Details again
- **THEN** the list closes and the summary is shown

### Requirement: Chosen Character Model In The Middle

The character screen SHALL show the chosen character's model in the middle of the screen over a background matching the character's element.

#### Scenario: the chosen character stands in the middle over its element's background

- **GIVEN** a player who chooses a Pyro character
- **WHEN** the character screen opens on that character
- **THEN** the character's model stands in the middle over the background for Pyro

### Requirement: Element Mark

The character screen SHALL show the element mark of the chosen character's region and element at the top left.

#### Scenario: the element mark shows the chosen character's element

- **GIVEN** a player who chooses a character of a given element
- **WHEN** the character screen opens on that character
- **THEN** the element mark for that element is shown at the top left

#### Scenario: the Traveler's mark shows its alignment

- **GIVEN** a player who chooses the Traveler
- **WHEN** the character screen opens on the Traveler
- **THEN** the mark shown is the Traveler's alignment's

### Requirement: Level Up Spends Materials

Level Up SHALL spend the Character EXP materials the player holds to raise the chosen character's level.

#### Scenario: Level Up spends Character EXP materials

- **GIVEN** a player holding enough Character EXP materials for the next level
- **WHEN** the player presses Level Up
- **THEN** the character's level rises and the materials are spent

#### Scenario: Level Up is refused without enough Character EXP materials

- **GIVEN** a player holding too few Character EXP materials for the next level
- **WHEN** the player presses Level Up
- **THEN** the level does not change and no materials are spent

### Requirement: Ascension Cap And Adventure Rank Gate

Ascend SHALL raise the chosen character past a phase's level cap only when the character is at that cap and the player's Adventure Rank allows it.

#### Scenario: Ascend spends the phase's materials and Mora at its cap

- **GIVEN** a character at its phase's level cap and a player whose Adventure Rank allows the next phase
- **WHEN** the player presses Ascend
- **THEN** the character ascends and the phase's materials and Mora are spent

#### Scenario: Ascend is refused below the phase's Adventure Rank

- **GIVEN** a character at its phase's level cap and a player whose Adventure Rank is below the phase's requirement
- **WHEN** the player presses Ascend
- **THEN** the character does not ascend and nothing is spent

#### Scenario: Ascend is refused below the phase's level cap

- **GIVEN** a character below its phase's level cap
- **WHEN** the player presses Ascend
- **THEN** the character does not ascend

### Requirement: Masterless Stella Fortuna Levels

Masterless Stella Fortuna SHALL lift a character past level 90 to the next level cap at once, with 95 and then 100 available.

#### Scenario: Masterless Stella Fortuna lifts a character from level 90 to 95

- **GIVEN** a character at level 90
- **WHEN** the player uses Masterless Stella Fortuna on that character
- **THEN** the character's level rises at once to 95

#### Scenario: Masterless Stella Fortuna lifts a character from level 95 to 100

- **GIVEN** a character at level 95
- **WHEN** the player uses Masterless Stella Fortuna on that character
- **THEN** the character's level rises at once to 100

### Requirement: Profile Voice-Over And Namecard

The Profile tab SHALL list the chosen character's voice-over lines and show its namecard.

#### Scenario: the Profile tab lists the character's voice-over lines

- **GIVEN** a player who chooses a character with voice-over lines
- **WHEN** the player opens the Profile tab
- **THEN** the voice-over lines are listed

### Requirement: Traveler Statue Element

Resonating with a Statue of The Seven SHALL give the Traveler that statue's element, and each element the Traveler has resonated with SHALL add a bonus to the Traveler.

#### Scenario: the Traveler takes the element of the statue it resonates with

- **GIVEN** the Traveler without a statue resonated with
- **WHEN** the Traveler resonates with a Statue of The Seven of a given element
- **THEN** the Traveler's element becomes that element

#### Scenario: each element resonated with adds a bonus

- **GIVEN** the Traveler has resonated with statues of two elements
- **WHEN** the character screen shows the Traveler's bonuses
- **THEN** the Traveler has a bonus for each of the two elements
