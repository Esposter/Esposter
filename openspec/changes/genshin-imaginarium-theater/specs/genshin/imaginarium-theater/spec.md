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

### Requirement: An opening character's trial version is read from its season

A season's opening characters SHALL each have the trial version the season names, at the level that trial version holds, and a season whose trial versions are not its openers' SHALL fail its data run.

#### Scenario: An opening character's trial version is read at its level

- **GIVEN** a season names a trial version of each opening character
- **WHEN** the data run reads the season
- **THEN** each trial version gives its opening character at the level the trial version holds

#### Scenario: A season whose trial versions are not its openers' fails its data run

- **GIVEN** a season's trial versions are not the characters of its opening characters
- **WHEN** the data run writes the season
- **THEN** the run fails
- **AND** no season is written

### Requirement: A stage's enemy name resolves to its codex entry's canonical monster

A wiki enemy name of a stage SHALL resolve to a codex entry only when every monster whose English name is that name shares one describe id. The entry's enemy SHALL be the monster its codex row names, filed under that entry.

#### Scenario: A name whose monsters share one describe entry resolves to that entry's canonical monster

- **GIVEN** every monster whose name is the wiki's enemy name shares one describe id, and its codex row names a monster filed under that entry
- **WHEN** the stage is joined to the game's monsters
- **THEN** the name resolves to that monster, with its health, attack and defense at the stage's level

### Requirement: A stage enemy's stats at the stage's level are its bases times its grow curves

A stage enemy's health, attack and defense SHALL be their bases at the stage's Easy level, each times its grow curve's multiplier at that level.

#### Scenario: A stage enemy's health at a level equals its base times the health curve at that level

- **GIVEN** a monster whose health base and health grow curve are given
- **WHEN** its stats are read at a level
- **THEN** its health is the base times the curve's multiplier at that level

### Requirement: A stage's enemy name that cannot resolve is refused and listed on its stage

A name whose monsters span several describe entries or that no monster holds, and an entry whose codex names no such monster, SHALL be refused and listed on its stage.

#### Scenario: A name whose monsters span several describe entries is refused with their count

- **GIVEN** the monsters whose name is the wiki's enemy name span several describe ids
- **WHEN** the stage is joined to the game's monsters
- **THEN** the name is listed on the stage as refused with reason `entries`, with the count of describe entries
- **AND** no entry is guessed for it

#### Scenario: A name held by no monster is refused with a count of zero

- **GIVEN** no monster's name is the wiki's enemy name
- **WHEN** the stage is joined to the game's monsters
- **THEN** the name is listed on the stage as refused with reason `entries` and a count of zero

#### Scenario: A codex entry that names no fightable monster refuses its name

- **GIVEN** a wiki enemy name resolves to one describe entry whose codex names no monster filed under it, or names a monster with no base curve
- **WHEN** the stage is joined
- **THEN** the name is listed on the stage as refused with reason `codex` and that describe id

### Requirement: A Companion event offers characters of its pool's element, drawn from the eligible characters

A Companion event SHALL offer the characters the season admits at the difficulty of its pool's element, or of any element when its pool names none, drawn from the world's seeded random source, and it SHALL cost the Fantasia Flowers its price.

#### Scenario: A Companion event offers characters of its pool's element

- **GIVEN** a Companion event whose pool names an element
- **WHEN** its offers are drawn
- **THEN** every offer is a character of that element

#### Scenario: A Companion event offers only characters the season admits at the difficulty

- **GIVEN** a character of the pool's element below the difficulty's level floor
- **WHEN** the offers are drawn
- **THEN** that character is not offered

#### Scenario: A Companion event costs Fantasia Flowers

- **GIVEN** a run holding the Companion's price in Fantasia Flowers
- **WHEN** the event is paid
- **THEN** the price is spent

#### Scenario: A paid event is refused without enough Fantasia Flowers

- **GIVEN** a run holding fewer Fantasia Flowers than the price
- **WHEN** the event is paid
- **THEN** the event is refused and no flower is spent
