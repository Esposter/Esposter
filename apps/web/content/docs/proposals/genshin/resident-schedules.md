---
title: Resident schedules
description: Proposal — the residents' data that is still to come. The world's clock already picks each resident's day or night spot and holds a change while they are in view; what remains is writing Mondstadt's residents into region data from the game's NPC birth records and the wiki, and a vendor selling only in their hours once the shops sell.
model: claude-opus-5-5
---

# Resident schedules

The game's people keep hours. A hunter sells meat in Springvale by day and goes home at night, a guard stands their post, and some people are found only in the evening. The [dialogue](/docs/genshin/dialogue)'s residents are placed in region data, and the world keeps the game's twenty-four-minute day ([sky and time](/docs/genshin/sky-and-time)). The clock's rule is built, as the [resident schedules](/docs/genshin/resident-schedules) page describes; this proposal keeps only what it does not yet do.

## Decisions

- **Day and night, at the game's hours.** A resident's day runs from 06:00 to 19:00 and their night from 19:00 to 06:00, the hours the wiki's resident pages give, such as Draff selling in Springvale during the day. A resident has a spot for each, or for one only and is absent in the other.
- **Their spots are the game's own records.** `BinOutput/Scene/SceneNpcBorn/scene3_npcborn.json` places every open-world resident: its NPC id, its place, its turn, and the scene group and suites it belongs to. A resident placed twice has a day spot and a night spot. Which of the two is the day's is the server's, so it is matched to the wiki's daytime and nighttime location for that resident, and a resident the wiki shows at one time only is absent at the other.
- **Moved out of sight.** At the turn of the hour, a resident in view stays until out of view and then stands at their new spot, so nobody is seen to jump. Built.
- **A vendor sells in their hours.** A resident who sells does so only in the hours their page gives, and offers no shop outside them, once the [shops](/docs/proposals/genshin/shops) sell.
- **Read by the world's clock.** Where a resident stands is read from the world's clock each frame, so a jump in time from the Time screen moves them as the hours do. Built.

## What is left

- **Mondstadt's residents in region data.** Every region's `residents` list is empty. Writing Mondstadt's residents needs a generator that reads the birth records, matches each placement to a resident by the wiki's day and night locations, and gives each a talk id, since a resident's talk is required by the schema. Until it runs, the rule has no residents to place.
- **Vendors' hours.** A vendor's shop is offered only in the hours its page gives, once [shops](/docs/proposals/genshin/shops) sell.

## Needs the user

- **Which placement is the day's, where the wiki shows neither.** A recording of the resident's spot at each hour settles it, which only the user can make.

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
