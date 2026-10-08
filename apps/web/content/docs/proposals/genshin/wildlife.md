---
title: Wildlife
description: Proposal — the open world's animals as the game runs them. Birds and beasts flee within their escape radius and drop meat or fowl when struck, boars charge, Sumeru's fight back with health bars, crystalflies, butterflies, lizards and crabs are picked up as materials and vanish in smoke, cats and dogs simply live there, and each kind's numbers and weathers are the game's own environment animal rows. Mondstadt's fleeing birds and beasts are built, their drops and the rest still to come.
model: claude-haiku-5-5
---

# Wildlife

The game's world is lived in by animals: birds that scatter, boars that charge, crystalflies to catch and cats on the roofs. They give the meat, fowl and materials cooking and crafting spend, and fill in the archive's living beings. They are a kind of [enemies](/docs/genshin/enemies)' camp with an AI of their own, standing where the [spawned places](/docs/proposals/genshin/spawned-places) fit them. The fleeing birds and beasts of Mondstadt are built, as the [as-built page](/docs/genshin/wildlife) describes; what follows is what is still to come.

## Decisions

- **Three kinds, by what they give.** Pets, the cats and dogs, cannot be interacted with. Birds and beasts drop their items when struck down. Material sources, crystalflies, butterflies, lizards, frogs, crabs and the like, are picked up as an item through the [interaction](/docs/proposals/genshin/interaction) prompts and vanish in a puff of smoke. A fish in shallow water can be struck or picked up.
- **Each kind's numbers are the game's, where a table holds them.** `EnvAnimalGatherExcelConfigData` gives the material sources their escape radius and time, how long they live, the weathers they hide in (rain, thunderstorms and snow for some) and the items they give. `CaptureExcelConfigData` gives what each beast drops when caught, and the monster table its kind, which the enemies' run already reads.
- **Birds and beasts are the archive's animals, and no table gives their flight.** The environment table holds the critters, fish and gadgets. The birds and beasts are monsters filed under the archive's aviary and animal groups, and no row of the table gives their escape radius or time. Until a recording times them, they stand on the closest values the table does hold, the gadget rows' radius of four metres and time of one second, marked provisional.
- **They flee on the enemies' step.** A startled animal runs from the player once within its escape radius, as a stepped state beside the enemies' own, and most come into being only when the player is near. Boars charge and can hurt a player in their way; Sumeru's beasts fight back with health bars and draw the player into combat; Chenyu Vale's flee and vanish when struck.
- **Struck down by a hit, as combat deals it.** A bird or beast falls to the hit [combat](/docs/genshin/combat) prices, one hit for most. A hit on wildlife triggers a weapon's passive but never an artifact set's, as the wiki notes. The capture table's drops are a single item in every row, and its name is not yet in the game's text the dump holds, so what a bird gives waits on that name.
- **They come back on the game's refresh**, as gathering points do, by their kind's policy.

## How it works

```mermaid
stateDiagram-v2
  [*] --> Idle: spawned when the player is near
  Idle --> Fleeing: the player within its escape radius
  Fleeing --> Idle: escaped, after its escape time
  Idle --> Fallen: struck down
  Fleeing --> Fallen: struck down
  Idle --> Picked: a material source picked up
  Fallen --> [*]: its items dropped
  Picked --> [*]: a puff of smoke
```

## Scope and order

**Built:** the fleeing birds and beasts of Mondstadt, stood at their fitted places and running from the character in Windrise's scene ([as-built page](/docs/genshin/wildlife)).

**Still to come, in order:**

1. **Birds and beasts drop when struck.** The kit's strike has to accept an animal as a target, the capture table's drop is written, and the item's name is read from the game's text.
2. **Material sources, picked up.**
3. **Boars, and the wildlife that fights back.**
4. **Pets**, and each region's own animals when its region lands.

## Data and measures

- **Read from the game's tables:** `EnvAnimalGatherExcelConfigData` for the material sources, `CaptureExcelConfigData` for the birds' and beasts' captures, and `AnimalCodexExcelConfigData` and the animals' monster rows.
- **Placed by the spawned places:** where each kind lives, from the official map's marks.
- **Measured:** how fast each bird and beast flees, and its escape radius and time, timed off recordings of each. Until a clip lands the flight stays provisional.

## Key files

| File                                                               | Role after the change                                 |
| :----------------------------------------------------------------- | :---------------------------------------------------- |
| `packages/genshin-world/src/services/enemy/stepEnemy.ts`           | Beside the animals' own fleeing step                  |
| `packages/genshin-world/src/models/enemy/EnemyCamp.ts`             | Animals placed as camps                               |
| `packages/genshin-world/src/components/World/Enemies/Index.vue`    | Steps and draws the animals in reach with the enemies |
| `scripts/src/services/genshinAssets/enemies/writeEnemyKinds.ts`    | Writes the animals' rows beside the enemies'          |
| `packages/genshin-world/src/services/interaction/getHeldPickUp.ts` | Picks up a material source                            |

## Sources

- [Wildlife](https://genshin-impact.fandom.com/wiki/Wildlife), Genshin Impact Wiki: fleeing when approached, boars' charge, Sumeru's that fight back and Chenyu Vale's that vanish, pets, item drops and material sources gone in smoke, fish struck or picked, weapon passives triggered but not artifact sets', and spawning near the player.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the environment animal table with each animal's escape radius, time, weathers and items, and the capture table.
