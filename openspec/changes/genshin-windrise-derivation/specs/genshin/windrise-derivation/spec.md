## ADDED Requirements

### Requirement: Every streamed object in Windrise stands at its exact place

Every object the game streams in Windrise SHALL stand at its exact place and turn, including the dais and the pedestals.

#### Scenario: A streamed object stands where the game places it

- **GIVEN** an object the game streams in Windrise at a recorded place and turn
- **WHEN** the player walks to the object
- **THEN** the object stands at that place and turn

#### Scenario: The dais in Windrise stands at its place

- **GIVEN** the dais of Windrise
- **WHEN** the player views the square
- **THEN** the dais stands at its place in the square

### Requirement: A rebuilt Windrise object is held to the same gate as the frame

A rebuilt Windrise object SHALL be judged against its game counterpart by the same gate as the rest of the frame, and the lowest-scoring stand-ins SHALL be rebuilt first.

#### Scenario: A rebuilt object is held to the same gate as the frame

- **GIVEN** a stand-in that has been rebuilt
- **WHEN** the frame is checked
- **THEN** the rebuilt object is scored by the same gate as every other object in the frame

#### Scenario: The lowest-scoring stand-in is rebuilt first

- **GIVEN** stand-ins scored against their game objects
- **WHEN** the rebuild order is chosen
- **THEN** the stand-in with the lowest score comes first

### Requirement: Each hour's light and haze match the game after the objects are rebuilt

Each hour's light and haze SHALL match the game at that hour, calibrated after the objects they fall on are rebuilt.

#### Scenario: Light at each hour matches the game after the objects are rebuilt

- **GIVEN** Windrise with its objects rebuilt
- **WHEN** the player views the area at an hour of the day
- **THEN** the light and haze match the game's reference at that hour
