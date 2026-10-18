# Flowing water

## Why

The water's shapes and flow are built, but the capitals' waterfalls are fitted into their region data and not yet drawn, and the rivers' courses and the falls outside the capitals are not placed at all. A player sees no waterfall in Mondstadt or Liyue and no river following the game's course.

## What Changes

The capitals' waterfalls are drawn where the game places them, and the rivers follow the courses the game places.

- Each capital's waterfall stands at the lip the game places, with its drop and width, and shows streaks that scroll down its face.
- Each river's ribbon follows the course, width and level the game places, once its water is exported.

## Capabilities

- **genshin/flowing-water** (modified)

## Waiting on

- The rivers outside Liyue: no other region's witness holds a water surface, so there is no course to fit.
- Swimming waits for the phase-three character controller, and is not part of this change.

## Impact

The world gains a waterfall component, mounted where the water is, and each region's data gains its waterfall sheets and river courses. The fit reads the game's witness exports for the capitals' falls. The mist and foam pools at the foot of a fall are particles judged by a recording, and are not part of this change.
