---
title: Compute queue
description: The runs owed on the Genshin parity work, one page per area, each item a line a haiku runner takes once every call in it is already made.
---

# Compute queue

Runs owed with every call already made: the exact command, what it reads, what it writes, and the measure that says it worked. A run that meets its measure commits what it wrote and leaves the queue; one that misses goes back as a call, never run again with a value guessed.

Each area's page holds its items under **Queue**, the runnable ones, and under **Waiting**, the items whose input does not exist yet, each naming what it waits on. The format of an item and how a runner takes one are in the `genshin-parity` skill's `references/compute-queue.md`. Within a region the passes run in the order its page lists them, and an item waits only on the earlier passes its measure reads, so it names on its line each of those and any blocker beyond the order, such as an extraction, a palette or a base ground. A region's frame score waits on every pass.

The fleet reads every page here except this one, and an id that two pages share is an error. A runner's release deletes its item's line from its area's page.

| Page                                             | Covers                                                                                  |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [Capitals](/docs/genshin/compute/capitals)       | the four capitals laid out as the witness draws them, and the city areas' re-extraction |
| [Character](/docs/genshin/compute/character)     | the character screen's Attributes tab, and the interface's character menu and its tabs  |
| [Crafting](/docs/genshin/compute/crafting)       | the crafting table over its whole frame, and the interface's crafting screen            |
| [Dialogue](/docs/genshin/compute/dialogue)       | the dialogue box's five states, scored over their backdrop                              |
| [Fontaine](/docs/genshin/compute/fontaine)       | Fontaine's region, from its base ground to its frame score                              |
| [Gcg](/docs/genshin/compute/gcg)                 | the Genius Invokation duel board over its whole frame                                   |
| [Handbook](/docs/genshin/compute/handbook)       | the adventurer handbook's experience page over its whole frame                          |
| [Inazuma](/docs/genshin/compute/inazuma)         | Inazuma's region, from its base ground to its frame score                               |
| [Interaction](/docs/genshin/compute/interaction) | the interaction pill and the selection's move                                           |
| [Interface](/docs/genshin/compute/interface)     | the interface components with no parity-page screen yet                                 |
| [Inventory](/docs/genshin/compute/inventory)     | the bag's whole frame, and the interface's inventory screen                             |
| [Liyue](/docs/genshin/compute/liyue)             | Liyue's region, from its base ground to its frame score                                 |
| [Login](/docs/genshin/compute/login)             | the login screen's light and shadows, and the health notice                             |
| [Map](/docs/genshin/compute/map)                 | the map's names over the terrain, and the Galesong Hill label                           |
| [Mondstadt](/docs/genshin/compute/mondstadt)     | Mondstadt's region, from its base ground to its frame score                             |
| [Natlan](/docs/genshin/compute/natlan)           | Natlan's region, from its base ground to its frame score                                |
| [Nod-Krai](/docs/genshin/compute/nod-krai)       | Nod-Krai's region, from its base ground to its frame score                              |
| [Paimon](/docs/genshin/compute/paimon)           | the quit prompt, the menu's open and close, and the reputation reward page              |
| [Quest](/docs/genshin/compute/quest)             | the quest screen over its whole frame                                                   |
| [Settings](/docs/genshin/compute/settings)       | the follow camera's defaults                                                            |
| [Snezhnaya](/docs/genshin/compute/snezhnaya)     | Snezhnaya's region, from its base ground to its frame score                             |
| [Sumeru](/docs/genshin/compute/sumeru)           | Sumeru's region, from its base ground to its frame score                                |
| [Text](/docs/genshin/compute/text)               | every language's text map, decoded from the install                                     |
| [Windrise](/docs/genshin/compute/windrise)       | the first scene: the oak, the surface and the sun                                       |
| [Wish](/docs/genshin/compute/wish)               | the single pull and the ten results, frame by frame                                     |
| [World](/docs/genshin/compute/world)             | teleports, weather, thunderstorms, lightning, the ores and the scripted props           |

## Bars

The bars the region passes and the area pages' pass items share, each gate named by its constant.

- **Layout**: each family's part within 0.02 m (`PART_GATE_METRES`) and its pixel gap within 2 px (`FRAME_GATE_PIXELS`).
- **Surface**: each family's mean colour within 2.3 DeltaE (`COLOUR_GATE`) and its structure within the outline gate.
- **Shape**: outline within 1 px (`SHAPE_OUTLINE_GATE_PIXELS`), depth within 0.01 (`SHAPE_DEPTH_GATE`), normals within 10 degrees (`SHAPE_NORMAL_GATE_DEGREES`).
- **Camera**: root mean square and reprojection 2 px (`FRAME_GATE_PIXELS`).
- **Sun**: the solved edges within 2 px (`FRAME_GATE_PIXELS`); on a hit the held minute, read through `computeSunDirection`, replaces the provisional noon in the reference's `heldMinutes` (a call).
- **Light**: shadow edges within 2 px (`FRAME_GATE_PIXELS`) and the stone's colour within 2.3 DeltaE (`COLOUR_GATE`).
- **Atmosphere**: the sky's statistics within the spread of the reference's own sky halves, and its clear sky within 2.3 DeltaE (`COLOUR_GATE`).
- **Display**: the shipped contrast's excess within 0.1 (`DISPLAY_CONTRAST_GATE`).
