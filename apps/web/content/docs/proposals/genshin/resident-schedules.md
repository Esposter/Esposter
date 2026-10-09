---
title: Resident schedules
description: Proposal — the residents' data that is still to come. The world's clock already picks each resident's day or night spot and holds a change while they are in view; what remains is the other regions' residents and the night spots, from the scene group export, and a vendor selling only in their hours once the shops sell.
model: claude-opus-5-5
needs: [game-exports]
touches: ["scripts/src/services/genshinAssets/residents/**", "packages/genshin-world/src/data/regions/**"]
waiting: "the scene group export (the other machine)"
---

# Resident schedules

The game's people keep hours. A hunter sells meat in Springvale by day and goes home at night, a guard stands their post, and some people are found only in the evening. The [dialogue](/docs/genshin/dialogue)'s residents are placed in region data, and the world keeps the game's twenty-four-minute day ([sky and time](/docs/genshin/sky-and-time)). The clock's rule is built, as the [resident schedules](/docs/genshin/resident-schedules) page describes; this proposal keeps only what it does not yet do.

## Decisions

- **Day and night, at the game's hours.** A resident's day runs from 06:00 to 19:00 and their night from 19:00 to 06:00, the hours the wiki's resident pages give, such as Draff selling in Springvale during the day. A resident has a day spot and, where the game places them differently, a night spot. What a resident with no night spot keeps is on [resident schedules](/docs/genshin/resident-schedules). Absence at night is an explicit `absentAtNight` in the data, set only where the game shows the resident by day alone; no record sets it yet, so no resident is absent at night. Most of the game's NPCs stand in the same place day and night, so a resident is not absent at night unless the data says so.
- **Their spots are the game's own records.** `BinOutput/Scene/SceneNpcBorn/scene3_npcborn.json` places every open-world resident of the regions it holds, up to Sumeru's: its NPC id, its place and its turn. How a resident the records place twice is read is on [resident schedules](/docs/genshin/resident-schedules); no night spot is matched until one is. Built by `genshin:assets residents`, which writes the residents of each fitted region.
- **Moved out of sight.** At the turn of the hour, a resident in view stays until out of view and then stands at their new spot, so nobody is seen to jump. Built.
- **The scene groups are the one source left.** AnimeGameData's `scene3_npcborn.json` is the same file the dump holds, byte for byte, and its records stop at Sumeru's groups (`1333xxxxx`), so no public dump places Fontaine's, Natlan's or Nod-Krai's residents. The other machine's scene group export (`Lua/Scene/3`, each group's NPCs with their suites) places them, and its suites tell a resident's day place from its night one, which the birth records cannot.
- **A vendor sells in their hours.** A resident who sells does so only in the hours their page gives, and offers no shop outside them, once the [shops](/docs/proposals/genshin/shops) sell.
- **Read by the world's clock.** Where a resident stands is read from the world's clock each frame, so a jump in time from the Time screen moves them as the hours do. Built.

## What is left

Nothing is built until the scene group export lands; then, in order:

1. **The other regions' residents and the night spots from the groups.** `scripts/src/services/genshinAssets/residents/joinResidents.ts` reads each NPC's group from the export beside the birth records: an NPC of Fontaine's, Natlan's or Nod-Krai's groups becomes a resident as the others are, and an NPC placed in two suites of one group, the group switching between them by the hour, takes its night suite's place as its night spot. `pnpm -C scripts genshin:assets residents` rewrites the regions' data, and `joinResidents.test.ts` asserts a two-suite NPC gains a night spot and a one-suite NPC keeps its day spot through the night.
2. **Vendors' hours**, with the [shops](/docs/proposals/genshin/shops)' vendors: a vendor sells while they stand at their spot, as Blanche's shop is open at all hours by the wiki and Draff's by day.

- **Not covered by the groups.** Snezhnaya has no residents, since its fit matched no statue or waypoint, and the wiki's daytime and nighttime gallery pictures are not read, the groups' suites read in their place as data.

## What this does not propose

- **The cities' crowds.** The passers-by the game draws for a busy city, who cannot be talked to, are their own system.

## Key files

| File                                                                  | Role after the change                                      |
| :-------------------------------------------------------------------- | :--------------------------------------------------------- |
| `packages/genshin-world/src/services/resident/computeResidentSpot.ts` | The rule the generator's residents are placed by, built    |
| `packages/genshin-world/src/composables/useResidentSpots.ts`          | The per-frame placement the residents are read from, built |

## Sources

- [NPC](https://genshin-impact.fandom.com/wiki/NPC), Genshin Impact Wiki: the open-world residents whose night spots this proposal matches.
- [Draff](https://genshin-impact.fandom.com/wiki/Draff), Genshin Impact Wiki: a vendor selling during the day, 06:00 to 19:00, with a daytime and a nighttime location.
- [Exploration](https://genshin-impact.fandom.com/wiki/Exploration), Genshin Impact Wiki: residents found only at certain times of day, or in other places.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the open world's NPC birth records with each resident's places, groups and suites.
