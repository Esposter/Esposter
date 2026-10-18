## 1. Waypoints

- [ ] 1.1 Add the waypoint landmark kind as a jump target, and pair each ground waypoint on the official map with a transport point within the fit bar. Verify: toWaypointLandmarks.test.ts written first and seen failing, named after the scenarios 'A waypoint is listed as a jump target' and 'A transport point with no paired map waypoint is not a waypoint'.
- [ ] 1.2 Fit Mondstadt's waypoints into its region data, replacing the waypoints written before, and list them on the map, minimap and jump list. Verify: a test named after the scenario 'A waypoint is listed as a jump target' against Mondstadt's region data, written first and seen failing.

## 2. Arrival

- [ ] 2.1 Read each landmark's arrival place and turn from the scene's transport points, naming the fields against the fitted statues. Verify: a test named after the scenario 'A jump lands at the game's arrival point' written first and seen failing.
- [ ] 2.2 Replace the provisional stand-off in the jump's pose with each landmark's arrival. Verify: the same test, seen passing against the arrival and failing against the stand-off.
