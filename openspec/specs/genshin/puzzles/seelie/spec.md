## Purpose

A Seelie as a state machine, led along its route while followed and settled at its court or sent back to rest. Built in the world package; not yet placed in the world with its court.

## Requirements

### Requirement: A Seelie rests where it was found until it is followed

A Seelie SHALL rest where it was found until the player follows it.

#### Scenario: Seelie found

- **GIVEN** a Seelie that the player has not followed
- **WHEN** the world steps
- **THEN** the Seelie stays resting where it was found

### Requirement: A followed Seelie is led along its route to its court

A Seelie that the player follows SHALL be led along its route, and SHALL settle at its court when the route reaches the court.

#### Scenario: Seelie followed to its court

- **GIVEN** a Seelie that the player is following
- **WHEN** its route reaches its court
- **THEN** the Seelie is settled at its court

### Requirement: A Seelie left unfollowed returns to rest

A Seelie left unfollowed for its return time SHALL go back to where it was found.

#### Scenario: Seelie left unfollowed

- **GIVEN** a Seelie being led that the player stops following
- **WHEN** it has been left unfollowed for its return time
- **THEN** the Seelie goes back to where it was found and rests

### Requirement: A settled Seelie stays settled

A Seelie that has settled at its court SHALL stay settled.

#### Scenario: Settled Seelie left unfollowed

- **GIVEN** a Seelie settled at its court
- **WHEN** it is left unfollowed
- **THEN** it stays settled at its court
