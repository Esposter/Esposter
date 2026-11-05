## 1. Plants and rocks

- [ ] 1.1 [phase 0] Fit each region's plant placements from its witness the way `fitWindrisePlants` fits Windrise's, publishing each region's plants as a record of its own. Verify: `pnpm -C scripts genshin:assets fit windrise --only plants --dry-run` reproduces the committed Windrise counts, and a test named after 'A region's grass stands where its plant record places it', written first and seen failing.
- [ ] 1.2 [phase 4] Mount Mondstadt's grass and plants from its plant record, the way the Windrise component mounts Windrise's. Verify: a test named after 'A region's grass stands where its plant record places it', written first and seen failing, over Mondstadt's scene.
- [ ] 1.3 [phase 0] Add a rock kind to the landmark kinds and a rock fit, with a rock kit of ours built from a visual hull or from boxes, for the rock objects other than the karst and stone forests that the Liyue change builds. Verify: `pnpm -C scripts genshin:assets fit inazuma --only rocks --dry-run` names the rock placements it would publish and carries no game vertex, and a test named after 'A rock stands at its placed position', written first and seen failing.

## 2. Ruins and statues

- [ ] 2.1 [phase 0] Fit Sumeru's stilt-hut and desert-ruin placements from its witness, as a `huts` record and a `ruins` record, so that `createStiltHutGeometry` and `createDesertRuinGeometry` each gain a caller. Verify: `pnpm -C scripts genshin:assets fit sumeru --only ruins --dry-run` names the ruin placements it would publish, and tests named after 'A desert ruin stands at its placed position' and 'A stilt hut stands at its placed position', written first and seen failing.
- [ ] 2.2 [phase 0] Fit each nation's Statue of the Seven from its own extract, with Windrise's statue fit as the pattern, so each region's statue stands in its landmarks. Verify: `pnpm -C scripts genshin:assets fit liyue --only statue --dry-run` names the statue it would publish, or the mesh it cannot find, and a test named after 'A nation's statue stands in its region', written first and seen failing.

## 3. Air and ground

- [ ] 3.1 [phase 0] Add a measure that reads each cloud band's spread from its reference frame, beside the parity measure, and write each measured spread into the band's record. Verify: a test named after 'A cloud band spreads across the sky at its measured width', written first and seen failing, then `pnpm -C scripts genshin:parity measure <a login cloud reference>` prints the spread of each band.
- [ ] 3.2 [phase 4] Give each sub-area with a catalogued extent a derivation root of its own, as a member of the component map, derived the way a capital is, so that `extract <sub-area>` runs. Verify: a test in `scripts/src/services/genshinAssets/shared/DerivedAssetComponentMap.test.ts` named after 'A sub-area stands on its own ground', written first and seen failing, then `pnpm -C scripts genshin:assets extract <dragonspine>` writes its exports.

## 4. Art

- [ ] 4.1 [phase 7] Write each row of the not-shippable table that no open item names into the roadmap as an Asset line under the item it blocks, with its stand-in named. Verify: `pnpm -C scripts exec vitest run src/workspace/openspecLinks.test.ts` passes, and each row whose last column names this task has an Asset line in `openspec/changes/genshin-roadmap/tasks.md`.

## 5. Still water

- [ ] 5.1 [phase 4] Fit each region's still-water level from its tile placements the way Windrise's level is read, beginning with Mondstadt, and mount a water surface at each fitted level in the regions in reach. Blocked on the water prefab exports the flowing-water change waits on, so the task starts once they are placed. Verify: a test named after the scenario 'A region's still water sits at the level its tiles give', written first and seen failing, then `pnpm -C scripts genshin:assets fit <component> --only water --dry-run` prints the level.
