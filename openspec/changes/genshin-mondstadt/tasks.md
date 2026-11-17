## 1. Wind and windmills

- [x] 1.1 Set the meadows' base wind and its gusts so they roll across the grass. Verify: a test named after the scenario 'Gusts roll across the meadows', written first and seen failing.
- [ ] 1.2 Build the windmill with sails that turn in the wind. Verify: a test named after the scenario 'A windmill's sails turn in a gust'.
      Blocked: its tower and blade meshes are not on disk (the queue's `windrise-windmill-meshes` item exports them), and its places are not in the Windrise streams, so they wait on the queue's `mondstadt-world-lod` item, and its reference is not yet found (see the design's Decisions). The sail angle (`computeWindmillSailAngle`) exists, its rate unfitted.
- [ ] 1.3 Raise the wind at Stormterror's Lair to gale strength. Verify: a test named after the scenario 'Stormterror's Lair blows at gale strength'.
      Blocked until the Lair's approach reference gives the gale's strength, and the Lair's weather area outline comes from the PC's export so the wind switches on entry.

## 2. City landmarks

- [ ] 2.1 Build the wall generator and the city's gate bridge, walls, cathedral and statue plaza, each matched to its reference. Verify: tests named after the scenarios 'The cathedral front matches its reference' and 'The Anemo Archon statue plaza matches its reference'.
      Blocked: `packages/genshin-world/parity/references/` holds 36 reference images, of which only `mondstadt-city-location.webp` is a Mondstadt city reference, with no cathedral front or statue plaza reference, so nothing is built.

## 3. Areas

- [ ] 3.1 Build Starfell Valley beside Windrise, growing out of the rendering-style scene, then Windwail Highland, Springvale, Dawn Winery and Galesong Hill. Verify: tests named after the scenarios 'Entering an area shows its game name', 'Windrise belongs to Galesong Hill' and 'Dawn Winery's fields hold grape rows' pass.
      Blocked: the two name tests pass in `findAreaNameAt.test.ts` (2 of 2, under the repo's lowercase titles), since the catalogue already holds the six areas and their subareas. The areas' scenes and Dawn Winery's grape rows are not built: the rows wait on a fitted record of the Mondstadt world's `Area_ManorProps_Grape02_Vo` placements, named in its streams, with its reader and rows component, none yet written.
- [ ] 3.2 Build Whispering Woods and Wolvendom's dense forest, then Stormterror's Lair and Brightcrown Mountains. Verify: tests named after the scenarios 'Whispering Woods is dense old forest' and 'Stormterror's Lair blows at gale strength' pass.
      Blocked: waits on 3.1's areas being built, so the forest's and the Lair's scenes have nothing to stand in.
- [ ] 3.3 Build the remaining areas in the catalogue's order. Verify: the scenario 'Entering an area shows its game name' passes for each area added.
      Blocked: waits on 3.1 and 3.2, which open the catalogue's order of areas to build.

## 4. Dragonspine

- [ ] 4.1 Build Dragonspine's snow ground, ice, frozen falls and Skyfrost Nail once snow weather exists. Verify: a test named after the scenario 'A snowstorm falls on Dragonspine'.
      Blocked: snow weather does not exist; `openspec/changes/genshin-weather/` is designed and waiting.
