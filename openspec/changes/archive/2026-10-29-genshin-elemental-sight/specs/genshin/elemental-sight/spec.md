## ADDED Requirements

### Requirement: A trail is drawn only for an end that is placed

A trail to a bounty target or a quest clue SHALL be drawn only once its end has been placed in the world.

#### Scenario: A bounty with no placed target draws no trail

- **GIVEN** a bounty's target is not placed in the world
- **WHEN** Elemental Sight is on
- **THEN** no trail is drawn toward the bounty

#### Scenario: A quest clue draws a trail once its place is set

- **GIVEN** a quest names a go-to place that is placed in the world
- **WHEN** Elemental Sight is on
- **THEN** a trail runs toward that place
