## ADDED Requirements

### Requirement: A sight trail leads from the character toward its end

While Elemental Sight is on, a sight trail SHALL run on the ground from the character toward its placed end.

#### Scenario: A Seelie's court draws a trail while the sight is on

- **GIVEN** a Seelie's court is placed in the world and Elemental Sight is on
- **WHEN** the player stands in the open world
- **THEN** a trail runs from the character toward the court

#### Scenario: No trail is drawn while the sight is off

- **GIVEN** a Seelie's court is placed in the world and Elemental Sight is off
- **WHEN** the player stands in the open world
- **THEN** no trail is drawn

### Requirement: A sight trail stops at the sight's reach

A sight trail SHALL stop at the sight's reach when its end lies beyond it, and SHALL draw nothing when its end is where the character stands.

#### Scenario: An end past the reach stops the trail at the reach

- **GIVEN** a trail's end lies beyond the sight's reach
- **WHEN** Elemental Sight is on
- **THEN** the trail ends at the reach

#### Scenario: A trail whose end is where the character stands draws nothing

- **GIVEN** a trail's end is at the character's own position
- **WHEN** Elemental Sight is on
- **THEN** no trail is drawn

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

### Requirement: A sight trail stays bright when the sight mutes the scene

A sight trail SHALL stay white and bright while the sight mutes the rest of the scene, since white is the colour of what no element affects.

#### Scenario: A trail stays bright while the sight mutes the scene

- **GIVEN** Elemental Sight is on and the scene is muted
- **WHEN** a trail is on screen
- **THEN** the trail is drawn white and bright
