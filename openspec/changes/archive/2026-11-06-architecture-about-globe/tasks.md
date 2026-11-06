## 1. The land mask

- [x] 1.1 Rasterise the world GeoJSON into a half-degree bit grid and write it under `generated/globeLandMask/`. Verify: a test over a hand-made polygon written first and seen failing.
- [x] 1.2 Build the land dots from the decoded mask. Verify: a test named after the scenario 'Dots stand on land only' written first and seen failing.

## 2. The scene

- [x] 2.1 Build an arc's curve from its altitude. Verify: a test named after the scenario 'An arc peaks at its altitude' written first and seen failing.
- [x] 2.2 Step the quality tier from the frame times. Verify: tests named after the scenarios 'A slow run lowers the tier' and 'A fast run keeps the tier' written first and seen failing.
- [x] 2.3 Start the globe at the reader's timezone. Verify: a test named after the scenario 'A reader in Greenwich starts at the base rotation' written first and seen failing.
- [x] 2.4 Mount the scene in `Visual/Globe.vue`, stopping it off screen and drawing one frame under reduced motion. Verify: driven in the browser once after the edits. Result: driven once in Chrome against the dev server, in motion and under reduced motion; it draws the dots, arcs and halo, a drag turns it, and no page error is raised. The tier step and the off-screen stop are not driven.

## 3. Removal

- [x] 3.1 Remove `three-globe` from the catalog, the manifest and the ledger, delete the GeoJSON and the country names, and sweep every mention. Verify: `grep` for `three-globe` and `globe.json` finds nothing outside the archive and the changelogs.
