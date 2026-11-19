# Flowing water

## Why

The water's shapes and flow are built, and the capitals' waterfalls and Liyue's rivers are drawn where the game places them. What remains is the rivers outside Liyue, the rivers' flow and bend foam, Liyue's ribbon values and the turn's sign of the falls (group 4 of the tasks).

## What Changes

The capitals' waterfalls are drawn where the game places them, and the rivers follow the courses the game places.

- Each capital's waterfall stands at the lip the game places, with its drop and width, and shows streaks that scroll down its face.
- Each river's ribbon follows the course, width and level the game places, once its water is exported.

## Capabilities

- **genshin/flowing-water** (modified)

## Waiting on

- The rivers outside Liyue (task 4.2): no other region's witness holds a water surface, so there is no course to fit.
- The turn's sign waits on a reference frame of a fall or the game's own fall direction (task 4.1). Liyue's four ribbon values wait on a recording of a river (task 4.3). The rivers' flow waits on a recording of a river, or on the river surfaces' materials, which the export does not hold (its one water material is a still pond's), and the bend foam waits on a recording of a bending river (tasks 4.4 and 4.5). `x-waiting` names each.
- Swimming waits for the phase-three character controller, and is not part of this change.

## Impact

The world gains a waterfall component, mounted where the water is, and each region's data gains its waterfall sheets and river courses. The fit reads the game's witness exports for the capitals' falls.
