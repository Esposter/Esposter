## Purpose

The Spiral Abyss's rules as built, read from the game's tower tables into genshin-world. Each chamber is cleared on one clock its halves share, its stars are the conditions the clear meets and the best is kept, a floor opens on the one below's three cleared chambers and its unlock stars, rewards are given once a cycle, and the Moon Spire runs the period that began latest. The chambers' enemies, scenes, screen, wormhole and blessings are not built yet.

## Requirements

### Requirement: Abyss open from Adventure Rank 20

The Spiral Abyss SHALL be open only to a player whose Adventure Rank is twenty or higher.

#### Scenario: Closed below rank 20

- **GIVEN** a player whose Adventure Rank is below twenty
- **WHEN** the Abyss is checked against the player's rank
- **THEN** the Abyss reads as closed

#### Scenario: Open at rank 20

- **GIVEN** a player whose Adventure Rank is twenty
- **WHEN** the Abyss is checked against the player's rank
- **THEN** the Abyss reads as open

### Requirement: Floors open in turn

The first floor SHALL always be open, and a floor above it SHALL open only when the floor below has all three of its chambers cleared and holds at least six stars.

#### Scenario: First floor always open

- **GIVEN** no chamber has been cleared
- **WHEN** the first floor is checked
- **THEN** the first floor is open

#### Scenario: Floor locked until the floor below is cleared

- **GIVEN** the floor below has two of its three chambers cleared
- **WHEN** the floor above is checked
- **THEN** the floor above is locked

#### Scenario: Floor opens once the floor below meets its unlock

- **GIVEN** the floor below has all three chambers cleared and six stars
- **WHEN** the floor above is checked
- **THEN** the floor above is open

#### Scenario: Moon Spire opens on the Corridor's last floor

- **GIVEN** the Corridor's floor eight has all three chambers cleared and six stars
- **WHEN** the Moon Spire's first floor is checked
- **THEN** the Moon Spire's first floor is open

### Requirement: Chamber clock set by its floor

A chamber's clock SHALL run for its floor's time, five minutes on the Corridor's first four floors and ten minutes on every floor above, and both halves of a chamber SHALL share that one clock.

#### Scenario: Clock on the Corridor's early floors

- **GIVEN** a chamber on the Corridor's floor one is about to start
- **WHEN** its clock starts
- **THEN** the clock runs for five minutes

#### Scenario: Second half starts on the time the first left

- **GIVEN** the first half of a chamber ends with two minutes left on the clock
- **WHEN** the second half begins
- **THEN** the clock reads two minutes

### Requirement: Chamber lost at zero clock or zero monolith

A chamber SHALL be lost when its clock reaches zero or its monolith reaches zero health before it is cleared, and a cleared chamber SHALL never be lost.

#### Scenario: Clock runs out

- **GIVEN** a chamber is being fought and has not been cleared
- **WHEN** its clock reaches zero
- **THEN** the chamber is failed
- **AND** nothing from that attempt is kept

#### Scenario: Monolith destroyed

- **GIVEN** a chamber is being fought with a monolith and has not been cleared
- **WHEN** the monolith reaches zero health
- **THEN** the chamber is failed

#### Scenario: Cleared chamber stays cleared

- **GIVEN** a chamber has been cleared
- **WHEN** its clock or its monolith is checked afterwards
- **THEN** the chamber stays cleared

### Requirement: Stars count the conditions a clear meets

A clear SHALL earn one star for each star condition it meets at the moment it clears, and a chamber SHALL keep the most stars any of its clears has earned.

#### Scenario: Stars from the conditions met

- **GIVEN** a chamber has a time condition and a monolith condition
- **WHEN** it is cleared with the clock above the time mark and the monolith above its health mark
- **THEN** the clear earns two stars

#### Scenario: Cleared with no condition met

- **GIVEN** a chamber whose conditions are all missed
- **WHEN** it is cleared
- **THEN** the chamber counts as cleared with no stars

#### Scenario: Best stars kept

- **GIVEN** an earlier clear of a chamber earned two stars
- **WHEN** a later clear earns one star
- **THEN** the chamber keeps two stars

### Requirement: Each reward given once per cycle

Each reward SHALL be given only the first time it is earned within its cycle, while the Corridor SHALL be one cycle that never resets and each Moon Spire period SHALL be a cycle of its own.

#### Scenario: First clear gives its reward

- **GIVEN** a chamber has not been cleared in this cycle
- **WHEN** it is cleared
- **THEN** its first-clear reward is returned to be handed out

#### Scenario: Star milestone gives its reward

- **GIVEN** a floor's stars reach six for the first time in this cycle
- **WHEN** the stars are recorded
- **THEN** the six-star reward is returned to be handed out

#### Scenario: Repeat clear gives nothing

- **GIVEN** a chamber's first-clear reward was already given in this cycle
- **WHEN** the chamber is cleared again
- **THEN** that reward is not returned again

#### Scenario: New period starts its rewards afresh

- **GIVEN** a Moon Spire period's rewards were given in the period before
- **WHEN** the next period begins
- **THEN** its rewards can be given again

### Requirement: Moon Spire runs the latest period begun

The Moon Spire SHALL run the period that began most recently before now in UTC+8, and SHALL keep its last period when no later one is known.

#### Scenario: Latest begun period runs

- **GIVEN** several Moon Spire periods have begun
- **WHEN** the Moon Spire is checked
- **THEN** the period that began most recently runs

#### Scenario: Last period kept when no later one is known

- **GIVEN** the schedule ends with a period that began in June
- **WHEN** the Moon Spire is checked months later
- **THEN** that last period still runs
