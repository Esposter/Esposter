# Map unlocking

## Why

The statues' unlocking, the filled areas and the jumps are built. The rest of the game's places are not: Teleport Waypoints and domain entrances do not unlock, pay their first-unlock rewards, or point the player toward a locked waypoint nearby. Without them the map offers the statues' jumps and nothing else.

## What Changes

Teleport Waypoints and domain entrances unlock by reaching them, pay their first-unlock rewards once, and a locked waypoint near the player is pointed to.

- A Teleport Waypoint or domain entrance unlocks when the player interacts with it, and a few unlock with a quest's step instead.
- An unlocked waypoint is offered as a jump and as a place to revive.
- Each waypoint's first unlock pays its Adventure EXP and Primogems, given once.
- A waypoint the game hides stays hidden until the step that reveals it.
- Within 30 metres of a locked jump landmark the HUD points toward it; past 40 metres, or once it is unlocked, the pointer goes.
- The pointer is the game's navigation mark, held at the screen's edge with its arrow turned toward a landmark that is out of view.

## Capabilities

- **genshin/map-unlocking** (modified)

## Waiting on

- Exploring places Teleport Waypoints in region data, makes them a landmark kind and lands jumps at the game's arrival point: `openspec/changes/genshin-exploring/`. The prompt list offers waypoints and domains once it does.
- Adventure Rank pays a statue's Adventure EXP as its first step: `openspec/changes/genshin-adventure-rank/`.
- The unlock's animation, and the length of its hold on the player, are measured off a published clip, and that clip is not yet held.

## Impact

The HUD's navigation pointer and its screen, the map's jump landmarks, the waypoints and domain entrances in the open world, and the first-unlock rewards paid to the player.

Size kept as the source page's own: splitting it is a later decision.
