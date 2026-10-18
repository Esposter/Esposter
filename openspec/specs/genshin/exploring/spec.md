# genshin/exploring Specification

## Purpose

Teleport Waypoints as jump targets: each ground waypoint on the official map, paired with the scene's transport point it stands at, is listed on the map, the minimap and the jump list once the player has unlocked it, named by its area. A jump to a statue or a waypoint lands the character at the game's own arrival place, facing its turn.

## Requirements

### Requirement: A Teleport Waypoint is a jump target

A Teleport Waypoint SHALL be listed as a jump target on the map, the minimap and the jump list once the player has unlocked it, named by its area.

#### Scenario: A waypoint is listed as a jump target

- **GIVEN** the player has unlocked a Teleport Waypoint in a region
- **WHEN** the player opens the map
- **THEN** the waypoint is listed as a jump target named by its area

#### Scenario: A transport point with no paired map waypoint is not a waypoint

- **GIVEN** a transport point of the scene has no ground waypoint on the official map that pairs with it
- **WHEN** the player opens the map
- **THEN** that point is not listed as a waypoint

### Requirement: A jump lands at the game's arrival point

A jump SHALL land the character at the landmark's arrival place, facing the arrival's turn.

#### Scenario: A jump lands at the game's arrival point

- **GIVEN** the player has jumped to a statue or a waypoint
- **WHEN** the jump completes
- **THEN** the character stands at the landmark's arrival place, facing its turn
