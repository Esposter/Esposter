## Purpose

The official Teyvat Interactive Map's statues and waypoints read into the references folder and fitted to the scene's transport points by one similarity over the whole map, with its residual, and each region's Oculi counted against the wiki's, Mondstadt checked first.

## Requirements

### Requirement: Official map points are kept as references

The official map's label tree and point list SHALL be read into the references folder as the map gives them, and no part of the point list SHALL be committed to the repository.

#### Scenario: Reading the official map

- **GIVEN** the official map's public points are available
- **WHEN** the points are read
- **THEN** the label tree and the point list are kept in the references folder
- **AND** no part of the point list is committed to the repository

### Requirement: Fit matches only the ground statues and waypoints

The fit of the official map to the scene SHALL match only the statues and waypoints on the ground, leaving the points below ground out of the match.

#### Scenario: Underground points left out of the fit

- **GIVEN** the official map holds statues and waypoints on a floor below the ground
- **WHEN** the map is fitted to the scene
- **THEN** only the statues and waypoints on the ground take part in the match
- **AND** the underground points are kept for their own floors

### Requirement: Fit refused above the residual bar

A fit whose residual is over twenty game units SHALL be refused, and SHALL write nothing.

#### Scenario: Residual over the bar

- **GIVEN** the best match leaves a residual over twenty game units
- **WHEN** the fit is run
- **THEN** the run stops with an error that names the residual
- **AND** no fit result is written

#### Scenario: Clean match written

- **GIVEN** the best match leaves a residual under twenty game units
- **WHEN** the fit is run
- **THEN** the result records the transform, the residual and each region's share of the points

### Requirement: One map unit is one game unit

The fitted scale SHALL stay within a few hundredths of one, so that one unit of the official map is one game unit.

#### Scenario: Solved fit is a mirrored quarter turn

- **GIVEN** the fit has converged on the matched points
- **WHEN** its turn and scale are read
- **THEN** the turn is a quarter turn mirrored, minus ninety degrees
- **AND** the scale is within a few hundredths of one

### Requirement: Report checks each region's Oculi against the wiki

The fit report SHALL list each region in turn, Mondstadt first, with its matched points, its residual and its Oculi counted against the wiki's count, and SHALL print any shortfall or surplus as it stands.

#### Scenario: Mondstadt reported first

- **GIVEN** the fit has run
- **WHEN** the report is printed
- **THEN** Mondstadt is listed first with about fifty matched statues and waypoints
- **AND** its Anemoculi count is compared with the wiki's sixty-six

#### Scenario: Shortfall kept as it stands

- **GIVEN** a region's official count of Oculi is below the wiki's count
- **WHEN** the report is printed
- **THEN** the shortfall is printed as the official map gives it
- **AND** no Oculus is added to fill it

#### Scenario: Snezhnaya with no matched points

- **GIVEN** Snezhnaya holds no transport points in the scene
- **WHEN** the report is printed
- **THEN** Snezhnaya matches no points
- **AND** its residual is reported as none

### Requirement: Published Oculi are the ground ones, with no height

The published Oculi SHALL be those the official map marks on the ground, each with its map id, its kind and its position in game coordinates, and no height SHALL be published for any of them.

#### Scenario: Underground Oculi left out

- **GIVEN** an Oculus is marked on a floor below the ground
- **WHEN** the Oculi are published
- **THEN** that Oculus is counted but not published

#### Scenario: Oculus stands on the ground at its point

- **GIVEN** an Oculus is published on the ground
- **WHEN** it is placed in the world
- **THEN** it stands on the ground at its point
- **AND** no height is published for it
