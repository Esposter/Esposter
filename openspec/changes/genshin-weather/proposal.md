# Weather

## Why

The weathers, their blends, particles, lightning and the turn through them are built, and the cities that hold clear skies are too. Every open-world area still turns by the standard chain of weathers, because the game's own weather areas are not read: which weather area covers a place is held only in the client's own scene. Reading it would give each area its own template and turn.

## What Changes

Each open-world area's weather turns through the game's own chain of weathers, and cities stay clear.

- A regular area's weather turns through the game's standard chain, where rain always clears at its next change and snow and mist hold.
- An area's weather turns only among the weathers its catalogue holds.
- A city's weather stays sunny in every climate, so a city never rains.
- An area whose game template is not the standard one turns by its own rows once its weather area is read.
- Until the game's schedule is measured, an area's weather changes on a provisional interval.

## Capabilities

- **genshin/weather** (modified)

## Waiting on

- Each weather area's outline, which only the client's scene holds. It is read on the PC from the install now that the user allows reading the scene's scripts, and the per-area template waits on it.
- Recordings the page marks as not yet found: the weather turn, the area's change schedule, the rain and the snow looks.

## Impact

The weather catalogue and the turn through each area's weathers are touched, and the provisional change interval stays until a recording measures it. The weather templates table joins the game text dump's fetched tables.
