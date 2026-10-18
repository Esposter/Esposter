## ADDED Requirements

### Requirement: A city's blacksmith stands at its recorded forge place

A city's blacksmith SHALL stand in the world at the forge place its scene group record gives.

#### Scenario: Mondstadt's blacksmith stands at its recorded place

- **GIVEN** the player is in Mondstadt
- **WHEN** the player looks for the blacksmith
- **THEN** the forge stands at the place its scene group record gives

### Requirement: The forge screen lists its recipes and queues from the forge state

The forge screen SHALL list each forge recipe and each queue with its orders as the forge state holds them.

#### Scenario: A queue shows its orders

- **GIVEN** the forge state holds queues with orders in them
- **WHEN** the player opens the forge screen
- **THEN** each queue shows its orders as the forge state holds them

### Requirement: Obtaining a finished order gives its item and Adventure EXP

Obtaining a finished forge order SHALL give its item to the bag and the Adventure EXP its Adventure Rank sets.

#### Scenario: Obtaining a finished order gives its item and Adventure EXP

- **GIVEN** a forge order has finished in its queue
- **WHEN** the player obtains it
- **THEN** its item is added to the bag and the Adventure EXP for the player's Adventure Rank is gained

### Requirement: The forge screen labels its actions in the game's words

The forge screen SHALL label its actions with the game's own words, looked up by their text ids.

#### Scenario: The forge screen labels its actions in the game's words

- **GIVEN** the player has chosen the game's language
- **WHEN** the player opens the forge screen
- **THEN** its start, materials and obtained labels read in that language as the game gives them

### Requirement: An order the daily cap refuses shows the refusal words

An order the daily cap refuses SHALL show the game's refusal words in place of starting.

#### Scenario: An order past the daily cap shows the refusal words

- **GIVEN** the day's forge points are near the daily cap
- **WHEN** the player orders an item the cap refuses
- **THEN** the game's refusal words are shown and the order does not start
