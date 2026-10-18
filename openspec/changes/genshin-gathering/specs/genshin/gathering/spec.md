## ADDED Requirements

### Requirement: Mining outcrops come daily from Adventure Rank 30

From Adventure Rank 30 a region's mining outcrops SHALL stand at the places drawn for the day, arriving at 04:00 in UTC+8.

#### Scenario: Outcrops appear at 04:00 with the day's draw

- **GIVEN** the player's Adventure Rank is 30 or higher
- **WHEN** the day's draw arrives at 04:00 in UTC+8
- **THEN** the region's mining outcrops stand at the places drawn for the day

#### Scenario: No outcrops appear below Adventure Rank 30

- **GIVEN** the player's Adventure Rank is below 30
- **WHEN** the day's draw arrives at 04:00 in UTC+8
- **THEN** no mining outcrop stands in the region

### Requirement: A mined outcrop stays gone until the next draw

A mined outcrop SHALL stay gone until the next day's draw.

#### Scenario: A mined outcrop is gone for the day

- **GIVEN** the player has mined an outcrop
- **WHEN** the player looks for it later that day
- **THEN** the outcrop is gone

#### Scenario: An unmined outcrop is gone at the next day's draw

- **GIVEN** an outcrop was not mined that day
- **WHEN** the next day's draw arrives
- **THEN** the outcrop is gone and the new day's outcrops take its place

### Requirement: Investigating a spot gives its rewards

Investigating a sparkling spot SHALL give its rewards once, and a Mora spot SHALL come back as its refresh says.

#### Scenario: An investigated spot gives its rewards

- **GIVEN** the player stands at a sparkling spot
- **WHEN** the player investigates it
- **THEN** its artifacts, ingredients, ores or Mora are given

#### Scenario: A Mora spot comes back as its refresh says

- **GIVEN** the player has investigated a Mora spot
- **WHEN** its refresh time passes
- **THEN** the spot is back to be investigated

### Requirement: Investigation stops at a hundred a game day

No investigation spot SHALL spawn once a hundred investigations are counted in the game day, and the count SHALL restart at the 04:00 reset in UTC+8.

#### Scenario: The hundredth investigation stops new spawns

- **GIVEN** the player has counted ninety-nine investigations in the game day
- **WHEN** the player investigates a hundredth spot
- **THEN** no new investigation spot spawns until the reset

#### Scenario: The day's count restarts at the 04:00 reset

- **GIVEN** the player has counted a hundred investigations in the game day
- **WHEN** the 04:00 reset arrives in UTC+8
- **THEN** the count restarts from zero and new spots spawn again
