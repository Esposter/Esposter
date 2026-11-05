# Flowing water

## Why

The water's shapes and flow are built, and the capitals' waterfalls and Liyue's rivers are drawn where the game places them. What remains is the rivers outside Liyue, the rivers' flow and bend foam, the mist and foam at a fall's foot, and the turn's sign of the falls (group 4 of the tasks).

## What Changes

The capitals' waterfalls are drawn where the game places them, and the rivers follow the courses the game places.

- Each capital's waterfall stands at the lip the game places, with its drop and width, and shows streaks that scroll down its face.
- Each river's ribbon follows the course, width and level the game places, once its water is exported.

## Capabilities

- **genshin/flowing-water** (modified)

## Waiting on

- The rivers outside Liyue: no other region's witness holds a water surface, so there is no course to fit.
- The rivers' flow, the bend foam, the mist and foam at a fall's foot, and the turn's sign wait on recordings or a reference frame (tasks 4.1 and 4.4 to 4.6; `x-waiting` names each).
- Swimming waits for the phase-three character controller, and is not part of this change.

## Impact

The world gains a waterfall component, mounted where the water is, and each region's data gains its waterfall sheets and river courses. The fit reads the game's witness exports for the capitals' falls. The mist and foam pools at the foot of a fall are particles judged by a recording, built by task 4.6.
