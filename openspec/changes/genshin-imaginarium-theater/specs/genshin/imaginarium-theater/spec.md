## ADDED Requirements

### Requirement: The Alternate Cast is drawn from the season's elements and guests

A season's Alternate Cast SHALL hold the player's characters of the season's three elements and its four special guests, each at or above the difficulty's level floor.

#### Scenario: A character of a season element joins the Alternate Cast

- **GIVEN** the player holds a character of one of the season's three elements at or above the level floor
- **WHEN** the player builds the Alternate Cast for the difficulty
- **THEN** the character is offered in the Alternate Cast

#### Scenario: A special guest of any element joins the Alternate Cast

- **GIVEN** the player holds one of the season's special guests at or above the level floor
- **WHEN** the player builds the Alternate Cast for the difficulty
- **THEN** the guest is offered in the Alternate Cast whatever its element

#### Scenario: A character off the season's elements is refused

- **GIVEN** the player holds a character whose element is not one of the season's three and who is not a special guest
- **WHEN** the player builds the Alternate Cast for the difficulty
- **THEN** the character is not offered in the Alternate Cast

#### Scenario: A character below the level floor is refused

- **GIVEN** the player holds a character of a season element below the difficulty's level floor
- **WHEN** the player builds the Alternate Cast for the difficulty
- **THEN** the character is not offered in the Alternate Cast

### Requirement: A stage is fought by four performers with Vigor left

A stage SHALL be performed by four characters of the Principal Cast, each performing at the cost of one Vigor, and a stage with fewer than four performers holding Vigor SHALL lead to a rewind.

#### Scenario: A stage is fought by four performers with Vigor

- **GIVEN** four characters of the Principal Cast each hold Vigor
- **WHEN** the player starts a stage
- **THEN** the four characters perform the stage
- **AND** each performance costs one Vigor

#### Scenario: Fewer than four performers with Vigor leads to a rewind

- **GIVEN** fewer than four characters of the Principal Cast hold Vigor
- **WHEN** the player starts a stage
- **THEN** the run rewinds to its last boss stage

### Requirement: Vigor returns only from a Mystery Cache

Vigor SHALL return only from a Mystery Cache's option, and a character with no Vigor left SHALL NOT perform again in the run.

#### Scenario: A Mystery Cache's option restores a character's Vigor

- **GIVEN** a character holds no Vigor
- **WHEN** the player takes a Mystery Cache option that restores Vigor to that character
- **THEN** the character holds Vigor again

#### Scenario: A character with no Vigor cannot perform

- **GIVEN** a character holds no Vigor
- **WHEN** the player chooses that character to perform a stage
- **THEN** the character is not offered to perform

### Requirement: Events between battles are paid in Fantasia Flowers

Each event between battles SHALL either give its reward or cost its price in Fantasia Flowers, and a paid event SHALL be refused when the player holds too few Flowers.

#### Scenario: A Battle Event offers a choice of two Alternate Cast members

- **GIVEN** an act offers a Battle Event
- **WHEN** the player wins the battle
- **THEN** the player receives Fantasia Flowers
- **AND** the player is offered a choice of two Alternate Cast members to join the Principal Cast

#### Scenario: A Companion event costs Fantasia Flowers

- **GIVEN** the player holds enough Fantasia Flowers for a Companion event
- **WHEN** the player takes the Companion event
- **THEN** a character joins the run
- **AND** the price in Fantasia Flowers is taken

#### Scenario: A paid event is refused without enough Fantasia Flowers

- **GIVEN** the player holds fewer Fantasia Flowers than an event's price
- **WHEN** the player tries to take the paid event
- **THEN** the event is not taken
- **AND** the player's Fantasia Flowers are unchanged

### Requirement: Events can be rerolled and runs rewound a limited number of times

An act's events SHALL be rerollable, and a run SHALL rewind to its last boss stage only a limited number of times.

#### Scenario: An act's events are rerolled

- **GIVEN** an act is offering its events
- **WHEN** the player rerolls the events
- **THEN** the act offers a fresh set of events

#### Scenario: A Mystery Cache's reroll option gives two chances

- **GIVEN** the run holds some rerolls
- **WHEN** the player takes a Mystery Cache option that gives chances to reroll
- **THEN** the run holds two more rerolls

#### Scenario: A reroll is refused with no rerolls left

- **GIVEN** the run has no rerolls left
- **WHEN** the player rerolls the events
- **THEN** the act keeps its events

#### Scenario: A run rewinds to its last boss stage

- **GIVEN** the run has rewinds left
- **WHEN** the player rewinds the run
- **THEN** the run returns to the end of its last boss stage
- **AND** one rewind is used

#### Scenario: A rewind is refused once the run's rewinds are used

- **GIVEN** the run has no rewinds left
- **WHEN** the player tries to rewind the run
- **THEN** the rewind is refused

### Requirement: An act's star challenge gives one Stella

Meeting an act's star challenge SHALL give one Stella, and an unmet star challenge SHALL give none.

#### Scenario: Meeting an act's star challenge gives one Stella

- **GIVEN** an act's star challenge is met
- **WHEN** the act ends
- **THEN** the run gains one Stella

#### Scenario: An unmet star challenge gives no Stella

- **GIVEN** an act's star challenge is not met
- **WHEN** the act ends
- **THEN** the run gains no Stella

### Requirement: A run's cast keeps its stats once chosen

A run's cast SHALL keep the stats it was given when chosen, and every member SHALL start each stage at full health and energy.

#### Scenario: A stage starts every member at full health and energy

- **GIVEN** a cast has been chosen for the run
- **WHEN** a stage starts
- **THEN** every member starts the stage at full health and energy
- **AND** each member's stats are those fixed when the cast was chosen

### Requirement: A season whose openers do not match its elements fails its data run

The data run for a season SHALL fail when the season's opening characters do not hold the season's three elements.

#### Scenario: A season whose openers' elements differ fails the data run

- **GIVEN** a season's opening characters do not hold its three elements
- **WHEN** the data run writes the season's cast
- **THEN** the run fails
- **AND** no cast is written for that season

### Requirement: The Imaginarium Theater opens at Adventure Rank 35

The Imaginarium Theater SHALL open with its quest once the player reaches Adventure Rank 35.

#### Scenario: Reaching Adventure Rank 35 opens the Theater

- **GIVEN** the player's Adventure Rank is 35
- **WHEN** the player is in the world
- **THEN** the Theater and its quest are offered

#### Scenario: Below Adventure Rank 35 the Theater stays closed

- **GIVEN** the player's Adventure Rank is below 35
- **WHEN** the player is in the world
- **THEN** the Theater is not offered
