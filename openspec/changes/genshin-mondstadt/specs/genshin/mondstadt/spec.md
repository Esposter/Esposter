## ADDED Requirements

### Requirement: Mondstadt's meadows bend under the region's strongest wind

The Mondstadt meadows SHALL show gusts rolling across the grass under a base wind stronger than any other region's.

#### Scenario: Gusts roll across the meadows

- **GIVEN** the player stands in Starfell Valley
- **WHEN** a gust passes over the meadow
- **THEN** the grass bends in a wave that rolls across the meadow

#### Scenario: Stormterror's Lair blows at gale strength

- **GIVEN** the player stands at the approach to Stormterror's Lair
- **WHEN** the player enters Stormterror's Lair
- **THEN** the wind blows at gale strength

### Requirement: Windmills turn their sails in the wind

Each windmill SHALL turn its sails with the region's wind.

#### Scenario: A windmill's sails turn in a gust

- **GIVEN** the player stands by a windmill in Mondstadt
- **WHEN** a gust reaches the windmill
- **THEN** its sails turn with the gust

### Requirement: Mondstadt City's landmarks match the game's references

The city's gate bridge, walls, cathedral and Anemo Archon statue plaza SHALL be drawn to match the game's references landmark by landmark, at the same camera.

#### Scenario: The cathedral front matches its reference

- **GIVEN** the player stands at the cathedral front
- **WHEN** the view is taken from the reference's camera
- **THEN** the cathedral's outline matches the reference's outline

#### Scenario: The Anemo Archon statue plaza matches its reference

- **GIVEN** the player stands in the plaza of the Anemo Archon's statue
- **WHEN** the view is taken from the reference's camera
- **THEN** the plaza's outline matches the reference's outline

### Requirement: Dragonspine snows under its own weather

Dragonspine SHALL show snow ground, ice, frozen falls and snowstorms.

#### Scenario: A snowstorm falls on Dragonspine

- **GIVEN** the player stands on Dragonspine
- **WHEN** the weather turns to a snowstorm
- **THEN** snow falls over the mountain
- **AND** the ground is covered in snow and ice
- **AND** the falls stand frozen

### Requirement: Mondstadt's areas keep the game's names

The world SHALL name each place of Mondstadt as the game names its area, and SHALL place Windrise in Galesong Hill.

#### Scenario: Entering an area shows its game name

- **GIVEN** the player walks into Dawn Winery
- **WHEN** the area changes
- **THEN** the area's name shown is Dawn Winery

#### Scenario: Windrise belongs to Galesong Hill

- **GIVEN** the player stands at Windrise's great oak
- **WHEN** the area's name is shown
- **THEN** the name shown is Galesong Hill

### Requirement: Mondstadt's trees grow in their areas

Mondstadt's trees SHALL stand in their species' areas: pines on the slopes, grape rows at Dawn Winery, and dense old forest in Wolvendom and Whispering Woods.

#### Scenario: Dawn Winery's fields hold grape rows

- **GIVEN** the player stands at Dawn Winery
- **WHEN** the player looks over the fields
- **THEN** grape rows stand in rows across them

#### Scenario: Whispering Woods is dense old forest

- **GIVEN** the player walks into Whispering Woods
- **WHEN** the view fills with trees
- **THEN** the trees are dense and old
