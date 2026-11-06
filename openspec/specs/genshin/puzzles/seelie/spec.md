## Purpose

A Seelie as a state machine, led along its route while followed and settled at its court or sent back to rest. Built in the world package and placed in the world, each Seelie paired with its court.

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

A Seelie left unfollowed for its return time SHALL go back to where it was found (`SEELIE_RETURN_SECONDS`).

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

## Sources

- [Seelie](https://genshin-impact.fandom.com/wiki/Seelie), Genshin Impact Wiki, cached at `{data-root}/cache/genshin-wiki/Page_Seelie.json`, line 10: a Seelie's chests appear once it has settled back into its court, and a Seelie not led back to its court within a set time goes to its starting location.

## Open

- [ ] **A Seelie rests until followed, as the game does** — NEEDS-RECORDING: no line of `{data-root}/cache/genshin-wiki/Page_Seelie.json` gives the rest before the first follow, and the led-home capture's sheet (`{data-root}/genshin-parity/frames/yt-sN0MlNE-ByM-seelie-led-home@0/sheet.png`) does not isolate that moment; a recording of a Seelie before any follow would settle it.
- [ ] **A settled Seelie stays settled at its court** — NEEDS-RECORDING: line 10 of `{data-root}/cache/genshin-wiki/Page_Seelie.json` gives the return only for a Seelie not led back to its court, which a settled one already is, and no line says a settled one stays; a recording of a settled Seelie left unfollowed would settle it.
