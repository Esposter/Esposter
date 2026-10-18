# Exploring

## Why

The world is explored through its map on M, which fades the character to any Statue of The Seven. Only statues are jump targets, and a jump lands a provisional distance in front of its statue rather than where the game lands a player. As the world holds more places, the map has to read more of them, and the Teleport Waypoints the game places are not yet among its jumps.

## What Changes

Teleport Waypoints become jump targets, and each jump lands at the game's own arrival point, facing the way the game faces it.

- A Teleport Waypoint is listed as a jump target on the map, the minimap and the jump list, named by its area.
- A ground waypoint on the map counts as a waypoint only when it pairs with a transport point of the scene.
- A jump lands the character at the landmark's arrival place, facing its turn, in place of the provisional stand-off.

## Capabilities

- **genshin/exploring** (new)

## Waiting on

None.

## Impact

The world's map gains waypoints as a kind of jump, and the minimap and the jump list list them with no change of their own. The region data gains each waypoint, and the arrival of each landmark replaces the provisional stand-off in the jump's pose. The fit that pairs waypoints with transport points is read from the scene's transport points and the official map.
