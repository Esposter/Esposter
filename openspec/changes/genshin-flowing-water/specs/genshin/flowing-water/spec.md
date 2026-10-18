## ADDED Requirements

### Requirement: A capital's waterfall stands at the game's lip

A capital's waterfall SHALL stand where the game places its sheet, with the lip, drop and width the game gives it.

#### Scenario: A fall stands at the game's lip

- **GIVEN** the player is at a capital's waterfall the game places
- **WHEN** the player views the fall
- **THEN** its lip, drop and width match the game's placement

### Requirement: A waterfall shows streaks that scroll

A waterfall SHALL show streaks that scroll down its face, fitted to the game's own.

#### Scenario: Streaks move across the fall

- **GIVEN** the player is viewing a waterfall
- **WHEN** time passes
- **THEN** the streaks on the fall move

### Requirement: A river follows the game's course

A river's ribbon SHALL follow the centreline, width and level the game places for it.

#### Scenario: A river's ribbon follows the game's centreline

- **GIVEN** the player is in a region with a river the game places
- **WHEN** the player views the river
- **THEN** the ribbon follows the game's centreline at the game's level

## REMOVED Requirements

### Requirement: Rivers and recorded waterfalls are not drawn in the open world yet

**Reason**: The open world now draws the rivers and the recorded waterfalls, through the requirements added above.
**Migration**: None; the scenarios of the removed requirement no longer hold and are not carried over.
