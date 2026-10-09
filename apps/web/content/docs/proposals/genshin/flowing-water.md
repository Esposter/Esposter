---
title: Flowing water
description: Proposal — what is still unbuilt of Genshin's rivers and waterfalls. The river ribbon and waterfall sheet, and the flow they move with, are built; what remains is where the game places each river's course and each fall, fitted to the game's own water, and the mist and foam pool at a fall's foot, judged by their statistics.
model: claude-opus-5-5
needs: [game-exports]
touches:
  [
    "scripts/src/services/genshinAssets/fit/fitWaterfallSheets.ts",
    "scripts/src/services/genshinAssets/fit/fitWaterfallSheets.test.ts",
    "packages/genshin-world/src/components/World/Waterfalls/**",
    "packages/genshin-world/src/models/world/RegionData.ts",
  ]
---

# Flowing water

The shapes and the flow are built: see [flowing water](/docs/genshin/flowing-water). This page keeps what the game must still supply.

## Decisions

- **A river's course is the game's.** The water surfaces the game places along a river are read in the region's layout pass, and a river's ribbon is fitted to them: its course, width and level. Its shape is gated as any shape is, by its outline and depth against the exports drawn at each reference's camera.
- **Its flow is read before it is measured.** The direction and speed its ripples and foam move at come from the game's own water material and its texture coordinates where the export holds them; what it holds without fields is measured off a recording of the river in the motion pass. Foam collects at rocks and bends ([flowing water](/docs/genshin/flowing-water)).
- **Waterfalls are objects the game places.** Each sheet stands where its record sets it, a mesh with scrolling streaks fitted to the game's own in an object pass. The mist and foam pool at its foot are particles, so they are judged by their statistics against a recording, their spread, density and colour, never pixel for pixel.

- **A waterfall's sheet is read off its mesh in the witness.** The capitals' witness exports already place the game's falls, meshes named `Eff_Model_WaterFall_*` (about five in Mondstadt's, about thirty-five in Liyue's), in our scene's axes round the world's origin. A sheet's lip is the centre of its mesh's highest edge, `across` the direction of that edge on the ground, its width the edge's length and its drop the mesh's height, each read after the placement's own scale and turn. The `Eff_Stages_WaterFallSplash_*` and `WaterfallRipple` meshes at a fall's foot are the foam pool's references, not sheets.

## Still to build

1. **The capitals' waterfalls.** A new `scripts/src/services/genshinAssets/fit/fitWaterfallSheets.ts` reads a region's `witness.json` (`~/Esposter/genshin-parity/extracted/<region>/`), keeps the placements whose mesh matches `/^Eff_Model_WaterFall_/u`, reads each mesh's vertices from `assets/Mesh/<mesh>.obj` and turns each into a sheet as the Decisions read it. A `waterfalls` fit in `DerivedAssetFitMap` writes them for Mondstadt and Liyue as a `waterfalls` list in `packages/genshin-world/src/data/regions/<region>.json`, which `RegionData` and its schema gain, each sheet's points as plain `{ x, y, z }`. A new `packages/genshin-world/src/components/World/Waterfalls/Index.vue` draws each region's sheets with `createWaterfallGeometry` and `createWaterfallMaterial`, mounted where `World/Water` is. Its test, `fitWaterfallSheets.test.ts`, places a quad 2 metres wide and 10 tall turned a quarter about the vertical and reads back its lip at the top edge's centre, `across` along the turned edge, a width of 2 and a drop of 10.
2. **The rivers' courses**, from the water prefabs the streaming records place, named by their path hashes as `checkIsArchitectureName` names buildings, then each ribbon fitted to its mesh's centreline, width and level.

## Deferred compute

- The river courses, read from the region's layout pass, are not in the repo, and need their water prefabs' meshes exported before fitting. The falls outside the capitals' witnesses wait the same way.
- The mist and foam pool particles are not built: their emitter and their statistics are judged against a recording of the game's falls.
- How tight a bend gathers full foam on its outer bank is provisional, fitted to a recording of a bending river once its course is placed.

## Notes

- **Swimming is play.** Moving through the water, with its stamina, waits for the phase-three character controller.
