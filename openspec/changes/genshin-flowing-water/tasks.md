## 1. Capitals' waterfalls

- [x] 1.1 Decide whether a waterfall sheet with a flat mesh or no width is drawn. Options: draw each kept degenerate record as the game places it, or skip the records that have no drop or no width. Decides nothing here; the choice is recorded before 1.2 is built.
- [x] 1.2 Draw each region's sheets with the waterfall geometry and material, mounted where the water is. Verify: a test named after the scenario 'Streaks move across the fall' written first and seen failing; the placement is checked by eye against the game's record.
- [x] 1.3 Make each capital's fall stand at the game's lip, drop and width. Verify: a test named after the scenario 'A fall stands at the game's lip' written first and seen failing.

## 2. Rivers

- [x] 2.1 Fit each river's ribbon to the centreline, width and level of its water mesh once the water prefabs are exported. Verify: a test named after the scenario 'A river's ribbon follows the game's centreline' written first and seen failing.
- [ ] 2.2 Fit the falls outside the capitals the same way, each region from its own witness: Inazuma (58 placements), Sumeru (49) and Natlan (2) have their fit entries, and `fit <region> --only waterfalls` writes their `waterfalls` when run. Waits on that run, not on an export. Verify: the frame checked against each region's capital, its waypoint median standing on the fit's centre and its falls near it, as Liyue's was; the scenario 'A fall stands at the game's lip' is pinned by the lip test in `fitWaterfallSheets.test.ts`.
- [x] 2.3 Draw each fitted river's ribbon in the water's material, beside the still water, in each region its game export does not stand in. Verify: a test named after the scenario 'A region the game's export stands in draws no river or fall of its own' written first and seen failing; the ribbon is checked by eye at integration against Liyue's river, the scenario 'A river's ribbon is drawn along its course'.
