## Purpose

Genshin's achievements as built. Each is a counter of one doing the game's table names, a quest or a parent quest finished, counted to its count and paid in Primogems once finished, its tier before it chained by the table. The Achievements screen lists the categories with how many of each are finished and opens from the Paimon menu. The reader publishes the table and every title in fifteen languages from the community's data dump to the game data, and the other trigger types wait on the pages that record their doings.

## Requirements

### Requirement: Achievements list under their categories

The achievement list SHALL show every kept achievement under its category in the game's order, each with its count and the Primogems it pays.

#### Scenario: Category lists its achievements in order

- **GIVEN** the Achievements screen is open
- **WHEN** a category is selected
- **THEN** its achievements are listed in the game's order
- **AND** each shows its title, its description, its count when that is more than one, and its Primogems

#### Scenario: Hidden achievement reads as a question mark

- **GIVEN** a hidden achievement is not yet finished
- **WHEN** its category is listed
- **THEN** the achievement reads "?" in place of its title and description
- **AND** it shows its real title and description once it is finished

### Requirement: Titles and descriptions follow the chosen language

Each achievement and category name SHALL be shown in the language the player has chosen, with English where that language lacks a text.

#### Scenario: Words show in the chosen language

- **GIVEN** the player has chosen a language
- **WHEN** the Achievements screen opens
- **THEN** every title, description and category name is shown in that language
- **AND** only that language's words are fetched

#### Scenario: Missing text falls back to English

- **GIVEN** the chosen language has no text for an achievement
- **WHEN** the achievement is shown
- **THEN** its English text is shown instead

### Requirement: A finished quest counts toward matching achievements

A finished quest or parent quest SHALL count once toward each watched achievement that names it, up to that achievement's count.

#### Scenario: Finished quest raises a matching achievement

- **GIVEN** an achievement that watches a quest and is not yet at its count
- **WHEN** that quest is finished
- **THEN** the achievement's progress rises by one

#### Scenario: Finished achievement is not counted again

- **GIVEN** an achievement that is already finished
- **WHEN** the doing it watches happens again
- **THEN** its progress does not move

#### Scenario: Tier waits for the tier before it

- **GIVEN** an achievement whose tier before it is not yet finished
- **WHEN** a doing names it
- **THEN** its progress does not move yet

#### Scenario: Achievement naming a missing quest stays at zero

- **GIVEN** an achievement names a sub-quest that the game data does not carry
- **WHEN** the doing happens
- **THEN** its progress stays at zero

#### Scenario: Unwatched trigger type does not move

- **GIVEN** an achievement whose trigger type is not watched yet
- **WHEN** any doing happens
- **THEN** that achievement does not move

### Requirement: Finishing an achievement pays its Primogems once

An achievement SHALL be finished when its progress reaches its count, and SHALL pay its Primogems once at that moment.

#### Scenario: Reaching the count finishes and pays

- **GIVEN** an achievement one count short of finished
- **WHEN** a doing counts it
- **THEN** it is finished
- **AND** its finish moment is recorded
- **AND** its Primogems are paid

#### Scenario: Further doings pay nothing more

- **GIVEN** an achievement that is already finished
- **WHEN** further doings occur
- **THEN** no Primogems are paid again

### Requirement: A completed category lists its namecard as earned

A category SHALL list its namecard as earned once every achievement of it is finished, and a category with no end SHALL list none.

#### Scenario: Completed category earns its namecard

- **GIVEN** every achievement of a category is finished
- **WHEN** the category is checked
- **THEN** its namecard is listed as earned

#### Scenario: Category with no end earns no namecard

- **GIVEN** a category with no end
- **WHEN** all of its achievements are finished
- **THEN** no namecard is listed

#### Scenario: Earned namecard is not yet on the profile

- **GIVEN** a namecard is listed as earned
- **WHEN** the player's profile is shown
- **THEN** the namecard is not yet among the profile's namecards

### Requirement: The Achievements screen lists category progress

The Achievements screen SHALL list every category with how many of its achievements are finished, and SHALL step between categories with Q and E.

#### Scenario: Screen opens from the Paimon menu

- **GIVEN** the Paimon menu is open
- **WHEN** Achievements is chosen
- **THEN** the screen opens with its categories listed down the left
- **AND** each category shows how many of its achievements are finished over how many it has

#### Scenario: Q and E step between categories

- **GIVEN** the Achievements screen is open with a category selected
- **WHEN** E is pressed
- **THEN** the next category is selected
- **AND** pressing Q selects the previous category
