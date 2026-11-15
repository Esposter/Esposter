# Compute queue

Runs owed with every call already made: the exact command, what it reads, what it writes, and the measure that says it worked. A run that meets its measure commits what it wrote and leaves the queue; one that misses goes back as a call, never run again with a value guessed.

Each area's page holds its items under **Queue**, the runnable ones, and under **Waiting**, the items whose input does not exist yet, each naming what it waits on. The format of an item and how a runner takes one are in the `genshin-parity` skill's `references/compute-queue.md`. Within a region the passes run in the order its page lists them, and an item waits only on the earlier passes its measure reads, so it names on its line each of those and any blocker beyond the order, such as an extraction, a palette or a base ground. A region's frame score waits on every pass.

The fleet reads every page here except this one, and an id that two pages share is an error. A runner's release deletes its item's line from its area's page.

## Phases

| Covers                                                                                  | Page                                 | Kind    | Phase |
| :-------------------------------------------------------------------------------------- | :----------------------------------- | :------ | :---: |
| the four capitals laid out as the witness draws them, and the city areas' re-extraction | [Capitals](capitals/design.md)       | Region  |   5   |
| the character screen's Attributes tab, and the interface's character menu and its tabs  | [Character](character/design.md)     | Screen  |   2   |
| the crafting table over its whole frame, and the interface's crafting screen            | [Crafting](crafting/design.md)       | Screen  |   2   |
| the dialogue box's five states, scored over their backdrop                              | [Dialogue](dialogue/design.md)       | Pieces  |   2   |
| Fontaine's region, from its base ground to its frame score                              | [Fontaine](fontaine/design.md)       | Region  |   5   |
| the Genius Invokation duel board over its frame less the card art                       | [Gcg](gcg/design.md)                 | Screen  |   6   |
| the adventurer handbook's experience page over what the page draws                      | [Handbook](handbook/design.md)       | Screen  |   2   |
| Inazuma's region, from its base ground to its frame score                               | [Inazuma](inazuma/design.md)         | Region  |   5   |
| the interaction pill and the selection's move                                           | [Interaction](interaction/design.md) | Pieces  |   2   |
| the interface components with no parity-page screen yet                                 | [Interface](interface/design.md)     | Pieces  |   2   |
| the bag's whole frame, and the interface's inventory screen                             | [Inventory](inventory/design.md)     | Screen  |   2   |
| Liyue's region, from its base ground to its frame score                                 | [Liyue](liyue/design.md)             | Region  |   5   |
| the login screen's light and shadows, and the health notice                             | [Login](login/design.md)             | Scene   |   1   |
| the map's names over the terrain, and the Galesong Hill label                           | [Map](map/design.md)                 | Screen  |   2   |
| Mondstadt's region, from its base ground to its frame score                             | [Mondstadt](mondstadt/design.md)     | Region  |   4   |
| Natlan's region, from its base ground to its frame score                                | [Natlan](natlan/design.md)           | Region  |   5   |
| Nod-Krai's region, from its base ground to its frame score                              | [Nod-Krai](nod-krai/design.md)       | Region  |   5   |
| the quit prompt, the menu's open and close, and the reputation reward page              | [Paimon](paimon/design.md)           | Screen  |   2   |
| the quest screen over its whole frame                                                   | [Quest](quest/design.md)             | Screen  |   2   |
| the follow camera's defaults                                                            | [Settings](settings/design.md)       | Screen  |   2   |
| Snezhnaya's region, from its base ground to its frame score                             | [Snezhnaya](snezhnaya/design.md)     | Region  |   5   |
| Sumeru's region, from its base ground to its frame score                                | [Sumeru](sumeru/design.md)           | Region  |   5   |
| every language's text map, decoded from the install                                     | [Text](text/design.md)               | Dataset |   0   |
| the first scene: the oak, the surface and the sun                                       | [Windrise](windrise/design.md)       | Scene   |   1   |
| the single pull and the ten results, frame by frame                                     | [Wish](wish/design.md)               | Screen  |   2   |
| teleports, weather, thunderstorms, lightning, the ores and the scripted props           | [World](world/design.md)             | Pieces  |   3   |

## Bars

The bars the region passes and the area pages' pass items share, each gate named by its constant.

- **Approval**: `approve` writes every screen's image whatever its score. The score is reported against the default bar (`DEFAULT_APPROVAL`, `APPROVAL_MEAN_DIFFERENCE_BAR`), or the bar the reference's entry records, and a report is never a gate, so no item waits on approval.
- **Layout**: each family's part within 0.02 m (`PART_GATE_METRES`) and its pixel gap within 2 px (`FRAME_GATE_PIXELS`).
- **Surface**: each family's mean colour within 2.3 DeltaE (`COLOUR_GATE`) and its structure within the outline gate. A surface pass reads the exports' albedo at the reference's camera and its kit colours from the region's palette.
- **Shape**: outline within 1 px (`SHAPE_OUTLINE_GATE_PIXELS`), depth within 0.01 (`SHAPE_DEPTH_GATE`), normals within 10 degrees (`SHAPE_NORMAL_GATE_DEGREES`).
- **Camera**: root mean square and reprojection 2 px (`FRAME_GATE_PIXELS`). The solved pose is written as `cameraPose` in `ParityReferenceMap.ts` once its landmarks reproject within the gate.
- **Sun**: the solved edges within 2 px (`FRAME_GATE_PIXELS`); on a hit the held minute, read through `computeSunDirection`, replaces the provisional noon in the reference's `heldMinutes` (a call). A reference that shows no shadow's edge on a flat receiver gives no edge to solve, so its item waits on a frame with a cast shadow on one, and the held minute needs another source until then (the [roadmap](../../../changes/genshin-roadmap/tasks.md)'s sun-direction item).
- **Light**: shadow edges within 2 px (`FRAME_GATE_PIXELS`) and the stone's colour within 2.3 DeltaE (`COLOUR_GATE`).
- **Atmosphere**: the sky's statistics within the spread of the reference's own sky halves, and its clear sky within 2.3 DeltaE (`COLOUR_GATE`).
- **Display**: the shipped contrast's excess within 0.1 (`DISPLAY_CONTRAST_GATE`), and, on each reference whose screen draws the bloom (`BLOOM_SCREENS`), the drawn bloom's reading at or under zero (`BLOOM_READING_GATE`), negative where the bloom closes.
- **Frame score** (not gated): a location's frame reads the reference and the screen at the reference's size, writes its row of the parity snapshot and the reference, ours and difference images, and is reported, not gated: the passes above carry the bars.

## Sources

The citations the region pages share: the bar's constant, the passes folder and its writer, the command lines, the solve folders, the pass modules' headers and the sun's reader. Each region page keeps the citations its own items read.

- `FRAME_GATE_PIXELS` in `scripts/src/services/genshinParity/passes/constants.ts` (`FRAME_GATE_PIXELS = 2`), the 2 px bar the Sun, Camera and Layout items gate on.
- `PARITY_DIRECTORY` in `scripts/src/services/genshinParity/shared/constants.ts`, the folder the pose and shadow runs write under, which grounds the output paths.
- `PARITY_PASSES_DIRECTORY` in `scripts/src/services/genshinParity/passes/constants.ts` (`passes/snapshots`) and `getParityPassesPath` in `scripts/src/services/genshinParity/passes/getParityPassesPath.ts` (`${component}.snapshot.md`), the file every pass item writes.
- `passesCommand` in `scripts/src/services/genshinParity/commands/passesCommand.ts` (`passes`, its `pass` argument), `compareCommand` in `scripts/src/services/genshinParity/commands/compareCommand.ts` (`compare`), `shadowsCommand` in `scripts/src/services/genshinParity/commands/shadowsCommand.ts` (`shadows`, its `witness` argument) and `poseCommand` in `scripts/src/services/genshinParity/commands/poseCommand.ts` (`pose`, its `witness` argument, its `write` argument, which `run` reads before it writes the pose into the reference map through `replaceReferenceCameraPose`): the command lines the items name.
- `solveReferenceShadows` in `scripts/src/services/genshinParity/witness/solveReferenceShadows.ts` (writes `PARITY_DIRECTORY/shadows`) and `solveReferencePose` in `scripts/src/services/genshinParity/witness/solveReferencePose.ts` (writes `pose`): the `shadows` and `pose` output folders.
- `MIN_DISPLAY` and `MIN_SAMPLE_COUNT` in `scripts/src/services/genshinParity/passes/measureDisplay.ts`, the header comment of `measureLight` in `scripts/src/services/genshinParity/passes/measureLight.ts` (its sun's direction through `solveReferenceShadows`), the `WitnessView` import and the header comment of `measureLayout` in `scripts/src/services/genshinParity/passes/measureLayout.ts`, `measureSurface`'s read of the exports' albedo in `scripts/src/services/genshinParity/passes/measureSurface.ts`, and the `readCloudStatistics` and `formatSkyComparison` imports of `measureAtmosphere` in `scripts/src/services/genshinParity/passes/measureAtmosphere.ts`: the reads the pass items name, in each module's own header or pass.
- `computeSunDirection(minutes, tilt, sunDirection)` in `packages/genshin-engine/src/atmosphere/computeSunDirection.ts`, the function the held minute is read through on a hit.

## Open

The unbuilt facts more than one region's passes depend on. Each is recorded once here, and a region page points at it rather than restating it.

- [ ] **The display pass reads the post profile's grading** — no source yet: `measureDisplay.ts` names the exports' parts, the tone curve's contrast and the bloom its reading compares, and no file under `passes/`, `display/` or `sky/` in `scripts/src/services/genshinParity/` reads the grading as a value it compares (`sky/readSky.ts` names a grade only as one way a sky could be drawn otherwise); the grade the engine's post pipeline holds (`packages/genshin-engine/src/post/createPostPipeline.ts`) is not read by it as far as its header says. What would settle it is the Display pass's read list in code, or a reader that names the grade it compares.
- [ ] **The shape pass reads our capital's kit parts through `BuildingKitPartsMap`** — no source yet: `packages/genshin-world/src/services/world/BuildingKitPartsMap.ts` (its `[BuildingKit.Mondstadt]` entry) has consumers only in `packages/genshin-world/src/index.ts`, the `Landmark/Building/Index.vue` component and its own test file `BuildingKitPartsMap.test.ts`, and none in `scripts/src/services/genshinParity/` or `packages/genshin-world/parity/`. What would settle it is the parity code path that draws the kit parts at the reference's camera.
