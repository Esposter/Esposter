## 1. Fitted places into region data

- [x] 1.1 Write each kind's fitted places into its region's data, with only fitted places kept. Verify: a test named after the scenario 'Only fitted places are written', written first and seen failing.
- [ ] 1.2 Stand each place on its ground, its landmark's top or its layer's floor, and report a place with no ground. Ground built, unticked for the two open parts: `getPlaceGroundHeight` stands a place on the ground its region's catalogue outlines hold and returns none for one outside every outline, tested by 'A fitted place stands on the ground beneath it' and 'A place whose ground cannot be found is reported'. Open, as the design's Stood on what is beneath and Enemies stand on the ground say: the landmark top waits on a collision top on the landmark model, and the layer floor on the underground layers' ground data, which neither the catalogue nor the dump holds. Its two open parts are to be tested by "A place on a landmark stands on its top" and "An underground place stands on its layer's floor" (the spec's scenarios), each to be written first and seen failing when the part is built; no test holds either yet. Nothing reads it yet, since no fitted place reaches the world.

## 2. Enemy camps

- [x] 2.1 Cluster each family's enemy marks into camps and write them into each region. Verify: a test named after the scenario 'Nearby enemy marks form one camp', and the test in `scripts/src/services/genshinAssets/camps/clusterEnemyMarks.test.ts` that holds "Marks farther apart than the clustering distance form separate camps".
- [x] 2.2 Give each camp's enemies their family's kind and an estimated level, replacing the Mondstadt stand-in. Verify: tests named after 'A camp's enemies take their family's kind and an estimated level' and 'The stand-in camp in Mondstadt is replaced'. The first of those tests checks each level is the estimate; the provisional clause of "A camp's level is a provisional estimate from the world level band" has no test, since the build writes each level as a constant and records it as provisional only in a comment that no test can read.
- [ ] 2.3 Publish the enemy kinds the camps place to the enemies dataset, by running `genshin:assets enemies` over the new region data. Verify: a test named after the scenario 'Every kind a camp places is published to the enemies dataset', written first and seen failing.

## 3. Counts

- [x] 3.1 Check each region's Oculi and chests against the wiki's count and report the difference per kind
      (`reportKindCount`, called by `buildOculusPlaces.ts` and `buildChestPlaces.ts`). Enemy kinds are not checked, since
      the wiki gives no per-region count for them. Verify: tests named after 'A kind short of the wiki's count is reported'
      and 'A kind matching the wiki's count reports nothing'.
- [ ] 3.2 Hold the built fit report's three scenarios with a test each: 'Mondstadt reported first', 'Shortfall kept as it stands' and 'Snezhnaya with no matched points'. Verify: a test named after each scenario passes as first written, since the report is built.
