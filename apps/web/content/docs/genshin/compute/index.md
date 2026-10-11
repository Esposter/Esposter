---
title: Compute queue
description: The runs owed on the Genshin parity work, one page per area, each item a line a haiku runner takes once every call in it is already made.
---

# Compute queue

Runs owed with every call already made: the exact command, what it reads, what it writes, and the measure that says it worked. A run that meets its measure commits what it wrote and leaves the queue; one that misses goes back as a call, never run again with a value guessed.

Each area's page holds its items under **Queue**, the runnable ones, and under **Waiting**, the items whose input does not exist yet, each naming what it waits on. The format of an item and how a runner takes one are in the `genshin-parity` skill's `references/compute-queue.md`.

The fleet reads every page here except this one, and an id that two pages share is an error. A runner's release deletes its item's line from its area's page.

| Page                                             | Covers                                                                                  |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [Capitals](/docs/genshin/compute/capitals)       | the four capitals laid out as the witness draws them, and the city areas' re-extraction |
| [Dialogue](/docs/genshin/compute/dialogue)       | the dialogue box's five states, scored over their backdrop                              |
| [Fontaine](/docs/genshin/compute/fontaine)       | Fontaine's region, from its base ground to its frame score                              |
| [Inazuma](/docs/genshin/compute/inazuma)         | Inazuma's region, from its base ground to its frame score                               |
| [Interaction](/docs/genshin/compute/interaction) | the interaction pill and the selection's move                                           |
| [Liyue](/docs/genshin/compute/liyue)             | Liyue's region, from its base ground to its frame score                                 |
| [Login](/docs/genshin/compute/login)             | the login screen's light and shadows, and the health notice                             |
| [Map](/docs/genshin/compute/map)                 | the map's names over the terrain, and the Galesong Hill label                           |
| [Mondstadt](/docs/genshin/compute/mondstadt)     | Mondstadt's region, from its base ground to its frame score                             |
| [Natlan](/docs/genshin/compute/natlan)           | Natlan's region, from its base ground to its frame score                                |
| [Nod-Krai](/docs/genshin/compute/nod-krai)       | Nod-Krai's region, from its base ground to its frame score                              |
| [Paimon](/docs/genshin/compute/paimon)           | the quit prompt, the menu's open and close, and the reputation reward page              |
| [Settings](/docs/genshin/compute/settings)       | the follow camera's defaults and the Graphics rows                                      |
| [Snezhnaya](/docs/genshin/compute/snezhnaya)     | Snezhnaya's region, from its base ground to its frame score                             |
| [Sumeru](/docs/genshin/compute/sumeru)           | Sumeru's region, from its base ground to its frame score                                |
| [Text](/docs/genshin/compute/text)               | every language's text map, decoded from the install                                     |
| [Windrise](/docs/genshin/compute/windrise)       | the first scene: the oak, the surface and the sun                                       |
| [Wish](/docs/genshin/compute/wish)               | the single pull and the ten results, frame by frame                                     |
| [World](/docs/genshin/compute/world)             | teleports, weather, thunderstorms, lightning, the ores and the scripted props           |
