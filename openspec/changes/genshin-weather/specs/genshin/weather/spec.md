## ADDED Requirements

### Requirement: A regular area's weather turns through the game's standard chain

A regular area's weather SHALL turn at each change through the game's standard chain of weathers, with each weather's next turn drawn from the chain's weights for it.

#### Scenario: Rain always turns to clear or cloudy at the next change

- **GIVEN** an area in rain
- **WHEN** the area's weather changes
- **THEN** the weather becomes sunny or cloudy

#### Scenario: Snow and mist do not turn at a change

- **GIVEN** an area in snow or in mist
- **WHEN** the area's weather changes
- **THEN** the weather stays snow or mist

#### Scenario: An area turns only among its own weathers

- **GIVEN** an area whose catalogue holds a set of weathers
- **WHEN** the area's weather changes
- **THEN** the new weather is one of that set

### Requirement: A city keeps clear skies

A city SHALL keep sunny weather in every climate, and its weather SHALL NOT turn to rain.

#### Scenario: A city's weather never turns to rain

- **GIVEN** a city in clear weather
- **WHEN** the weather changes over time
- **THEN** the weather stays sunny

### Requirement: An area with its own template turns by its own rows

An area whose game template is not the standard one SHALL turn by its own weather rows once its weather area is read.

#### Scenario: An area with its own template turns by its own rows

- **GIVEN** an area whose weather area the game gives a template other than the standard one
- **WHEN** the area's weather changes
- **THEN** the new weather is drawn from that template's rows

### Requirement: An area's weather changes on the provisional interval until the schedule is measured

An area's weather SHALL change once each change interval, which stays provisional until the game's schedule is measured.

#### Scenario: An area's weather changes once each change interval

- **GIVEN** an area whose weather is not held by a special climate
- **WHEN** one change interval passes
- **THEN** the area's weather changes
