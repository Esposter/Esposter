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

### Requirement: A river is drawn in the water's material, beside the still water

A river's ribbon SHALL be drawn in the water's material, mounted with the region's still water and carrying the foam its bends gather on their outer banks, in each region whose game export does not stand in.

#### Scenario: A river's ribbon is drawn along its course

- **GIVEN** the player is in a region with a river the game places, and the game's export of the region is not in the scene
- **WHEN** the player views the river
- **THEN** its ribbon lies along the course at the game's level, with the water's shore and bend foam on its banks

#### Scenario: A region the game's export stands in draws no river or fall of its own

- **GIVEN** the player is in a region whose game export is in the scene
- **WHEN** the player views the region
- **THEN** its rivers and falls are left out, the export drawing them

## REMOVED Requirements

### Requirement: Rivers and recorded waterfalls are not drawn in the open world yet

**Reason**: The open world now draws the rivers and the recorded waterfalls, through the requirements added above.
**Migration**: None; the scenarios of the removed requirement no longer hold and are not carried over.
