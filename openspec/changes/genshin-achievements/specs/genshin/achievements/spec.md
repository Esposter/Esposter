## ADDED Requirements

### Requirement: Exploring Trigger Counting

The achievement system SHALL count an exploring trigger only once its page's rule is called from the world.

#### Scenario: an exploring trigger counts a doing once its rule is called

- **WHEN** the world calls the rule for a doing that an exploring trigger counts
- **THEN** each achievement counting that trigger advances by one

#### Scenario: an unwatched trigger leaves its achievements at zero

- **GIVEN** an exploring trigger whose page's rule has no caller in the world
- **WHEN** the doing that trigger counts happens
- **THEN** each achievement counting that trigger stays at zero progress

### Requirement: Quest Trigger Matching

The achievement system SHALL count a quest trigger by the named sub-quest and a parent-quest trigger by the named main quest finishing.

#### Scenario: a parent-quest trigger counts when its main quest finishes

- **GIVEN** a parent-quest trigger naming a main quest
- **WHEN** the last sub-quest of that main quest finishes
- **THEN** the trigger counts the main quest as finished

#### Scenario: an OR trigger counts each named quest once

- **GIVEN** an OR trigger with a count of five naming a list of quests
- **WHEN** the same named quest finishes twice
- **THEN** the trigger's count rises by one, not two

### Requirement: Server-Fired Achievement Counting

The achievement system SHALL count each server-fired achievement only through its own check over the world's doings, written when the page building its subject lands.

#### Scenario: a server-fired achievement advances when its own doing happens

- **GIVEN** a server-fired achievement whose subject's page has landed
- **WHEN** the doing its check names happens in the world
- **THEN** the achievement advances by that doing

#### Scenario: a server-fired achievement does not advance on another doing

- **GIVEN** a server-fired achievement whose subject's page has landed
- **WHEN** a different doing happens in the world
- **THEN** the achievement's progress does not change

### Requirement: Namecard Grant

The player's profile SHALL list the namecard of each achievement category that is finished, read from the progress each time.

#### Scenario: a finished category adds its namecard to the profile

- **WHEN** the last achievement of a category finishes
- **THEN** the category's namecard appears among the profile's held namecards

#### Scenario: an unfinished category adds no namecard

- **GIVEN** an achievement category with at least one achievement not finished
- **WHEN** the profile's namecards are listed
- **THEN** that category's namecard does not appear
