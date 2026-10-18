## ADDED Requirements

### Requirement: An area's exploration percentage is its done share

An area's exploration percentage SHALL be the weight of its done doings over its total, rounded down.

#### Scenario: An area with nothing done reads zero

- **GIVEN** no doing in an area is done
- **WHEN** the player looks at the area's label on the map
- **THEN** the label reads 0 percent

#### Scenario: A near-complete area reads below 100

- **GIVEN** an area is 99.5 percent done
- **WHEN** the player looks at the area's label on the map
- **THEN** the label reads 99 percent

### Requirement: Each doing adds its kind's weight to its area once

A doing SHALL add its kind's weight to the area it stands in the first time it is done, and SHALL add nothing when it is done again.

#### Scenario: An opened chest adds its kind's weight to its area

- **GIVEN** a chest in an area is not yet opened
- **WHEN** the player opens the chest
- **THEN** the area's done weight rises by the chest's kind weight

#### Scenario: A doing repeated adds its weight only once

- **GIVEN** a waypoint in an area has been unlocked
- **WHEN** the player unlocks the same waypoint again
- **THEN** the area's percentage does not change

### Requirement: A nation's percentage weighs its areas

A nation's exploration percentage SHALL be the done weight of its areas over their totals, weighted by each area's ratio where the ratios are set and by their summed totals where every ratio is zero, rounded down.

#### Scenario: Mondstadt's percentage uses summed totals when every ratio is zero

- **GIVEN** two of Mondstadt's areas have totals of 100 and 300 with 40 done in total
- **WHEN** the player looks at Mondstadt's exploration
- **THEN** the nation reads 10 percent

#### Scenario: Liyue's percentage weighs each area by its ratio

- **GIVEN** Liyue's areas each carry a ratio that sums to one
- **WHEN** the player looks at Liyue's exploration
- **THEN** each area counts for its ratio of the nation's percentage

### Requirement: A nation's threshold pays its Reputation reward once

A nation's exploration reaching a threshold SHALL pay that threshold's Reputation reward once.

#### Scenario: Crossing a threshold pays its reward once

- **GIVEN** a nation's exploration is just below a threshold
- **WHEN** the player unlocks a statue that takes the nation past the threshold
- **THEN** the threshold's Reputation experience and item rewards are paid once

#### Scenario: Reaching a passed threshold again pays nothing

- **GIVEN** a nation's exploration has already passed a threshold and paid its reward
- **WHEN** the player does another doing that keeps the nation past that threshold
- **THEN** no reward is paid for it again
