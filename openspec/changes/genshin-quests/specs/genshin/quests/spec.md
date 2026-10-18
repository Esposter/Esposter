## ADDED Requirements

### Requirement: A go-to step completes when the player reaches its place

A go-to step SHALL complete when the player reaches its place within its radius.

#### Scenario: Reaching a go-to place completes the step

- **GIVEN** a carried quest has a go-to step with a place
- **WHEN** the player reaches the place within its radius
- **THEN** the go-to step completes

#### Scenario: Standing outside the radius leaves the step open

- **GIVEN** a carried quest has a go-to step with a place
- **WHEN** the player stands outside the radius
- **THEN** the step stays open

### Requirement: Navigation points to a go-to place

Tracking a go-to step SHALL point the navigation beam at the step's place.

#### Scenario: Tracking a go-to step points the beam at its place

- **GIVEN** the player tracks a quest whose current step is a go-to
- **WHEN** the player looks at the world
- **THEN** the navigation beam leads to the go-to's place

### Requirement: A world quest's series is listed under its chapter

The quest screen SHALL list a world quest under its series' chapter, with the chapter's title and number.

#### Scenario: A chapter lists its title and number

- **GIVEN** the player holds a world quest in a series
- **WHEN** the player opens the quest screen
- **THEN** the series is listed with its title and number

#### Scenario: A chapter with no words shows an empty journal

- **GIVEN** a series has no title words in the game's text
- **WHEN** the player opens its journal
- **THEN** the journal shows empty without an error

### Requirement: A series' quests unlock one after another

A series' quest SHALL be offered only once the quest before it in the series is finished.

#### Scenario: The next quest is offered once the one before is finished

- **GIVEN** the first quest of a series is finished
- **WHEN** the player talks to the quest's giver
- **THEN** the next quest is offered

#### Scenario: A later quest is not offered early

- **GIVEN** the first quest of a series is not finished
- **WHEN** the player talks to the second quest's giver
- **THEN** the second quest is not offered
