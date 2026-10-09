---
title: Resident schedules
description: Proposal — the residents' data that is still to come. The world's clock already picks each resident's day or night spot and holds a change while they are in view; what remains is writing Mondstadt's residents into region data from the game's NPC birth records and the wiki, and a vendor selling only in their hours once the shops sell.
model: claude-opus-5-5
---

# Resident schedules

The game's people keep hours. A hunter sells meat in Springvale by day and goes home at night, a guard stands their post, and some people are found only in the evening. The [dialogue](/docs/genshin/dialogue)'s residents are placed in region data, and the world keeps the game's twenty-four-minute day ([sky and time](/docs/genshin/sky-and-time)). The clock's rule is built, as the [resident schedules](/docs/genshin/resident-schedules) page describes; this proposal keeps only what it does not yet do.

## Decisions

- **Day and night, at the game's hours.** A resident's day runs from 06:00 to 19:00 and their night from 19:00 to 06:00, the hours the wiki's resident pages give, such as Draff selling in Springvale during the day. A resident has a day spot and, where the game places them differently, a night spot. A resident with no night spot keeps their day spot through the night. Absence at night is an explicit `absentAtNight` in the data, set only where the game shows the resident by day alone; no record sets it yet, so no resident is absent at night. Most of the game's NPCs stand in the same place day and night, so a resident is not absent at night unless the data says so.
- **Their spots are the game's own records.** `BinOutput/Scene/SceneNpcBorn/scene3_npcborn.json` places every open-world resident: its NPC id, its place and its turn. A resident the records place twice in one region is the same NPC at nearly the same spot, so its first place is its day spot and it has no night spot until one is matched. Built by `genshin:assets residents`, which writes the residents of each fitted region.
- **Moved out of sight.** At the turn of the hour, a resident in view stays until out of view and then stands at their new spot, so nobody is seen to jump. Built.
- **A vendor sells in their hours.** A resident who sells does so only in the hours their page gives, and offers no shop outside them, once the [shops](/docs/proposals/genshin/shops) sell.
- **Read by the world's clock.** Where a resident stands is read from the world's clock each frame, so a jump in time from the Time screen moves them as the hours do. Built.

## What is left

- **Night spots.** The wiki's daytime and nighttime locations are gallery pictures captioned by the hour, not text naming a place, and the records give a resident one place in most cases, so no night spot is matched yet. Matching one needs a reading of those pictures against the map.
- **The other regions' residents.** Mondstadt, Liyue, Inazuma and Sumeru are written. Fontaine, Natlan and Nod-Krai have none, since the dump holds only the open world's scene 3 birth records and their scenes' records are not dumped. Snezhnaya has none, since its fit matched no statue or waypoint.
- **Vendors' hours.** A vendor's shop is offered only in the hours its page gives, once [shops](/docs/proposals/genshin/shops) sell.

## Needs the user

- **Which placement is the day's, where a resident has two.** A recording of the resident's spot at each hour settles it, which only the user can make.

## What this does not propose

- **The cities' crowds.** The passers-by the game draws for a busy city, who cannot be talked to, are their own system.

## Key files

| File                                                                  | Role after the change                                      |
| :-------------------------------------------------------------------- | :--------------------------------------------------------- |
| `packages/genshin-world/src/services/resident/computeResidentSpot.ts` | The rule the generator's residents are placed by, built    |
| `packages/genshin-world/src/composables/useResidentSpots.ts`          | The per-frame placement the residents are read from, built |

## Sources

- [NPC](https://genshin-impact.fandom.com/wiki/NPC), Genshin Impact Wiki: open-world residents with their daytime and nighttime locations.
- [Draff](https://genshin-impact.fandom.com/wiki/Draff), Genshin Impact Wiki: a vendor selling during the day, 06:00 to 19:00, with a daytime and a nighttime location.
- [Exploration](https://genshin-impact.fandom.com/wiki/Exploration), Genshin Impact Wiki: residents found only at certain times of day, or in other places.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the open world's NPC birth records with each resident's places, groups and suites.
