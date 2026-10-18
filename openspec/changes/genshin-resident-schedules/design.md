# Resident schedules

The game's people keep hours. A hunter sells meat in Springvale by day and goes home at night, a guard stands their post, and some people are found only in the evening. The [dialogue](../../specs/genshin/dialogue/design.md)'s residents are placed in region data, and the world keeps the game's twenty-four-minute day ([sky and time](../../specs/genshin/sky-and-time/design.md)). The clock's rule is built, as the [resident schedules](../../specs/genshin/resident-schedules/design.md) page describes; this proposal keeps only what it does not yet do.

## Decisions

- **Day and night, at the game's hours.** A resident's day runs from 06:00 to 19:00 and their night from 19:00 to 06:00, the hours the wiki's resident pages give, such as Draff selling in Springvale during the day. A resident has a day spot and, where the game places them differently, a night spot. What a resident with no night spot keeps is on [resident schedules](../../specs/genshin/resident-schedules/design.md). Absence at night is an explicit `absentAtNight` in the data, set only where the game shows the resident by day alone; no record sets it yet, so no resident is absent at night. Most of the game's NPCs stand in the same place day and night, so a resident is not absent at night unless the data says so.
- **Their spots are the game's own records.** `genshin:assets residents` reads the NPC members the [scene group record](../../specs/genshin/scene-groups/design.md) places, each filled from the dump's NPC births with its place and its turn. How a resident placed twice is read is on [resident schedules](../../specs/genshin/resident-schedules/design.md); no night spot is matched until the wiki's NPC page gives one.
- **Moved out of sight.** At the turn of the hour, a resident in view stays until out of view and then stands at their new spot, so nobody is seen to jump.
- **Shopkeepers at their building points.** Where the births hold no NPC, the scene's building point of her shop or service stands in for her place: Mondstadt's General Goods (Blanche), Souvenir (Marjorie), Blacksmith (Schulz), the Adventurers' Guild (Katheryne, NPC 1512, the base receptionist's id), the Fishing Association (Nantuck), Angel's Share's bartender (Charles), and Hertha's Reputation point. The point is the game's own, but the NPC standing at it is an estimate, marked provisional, since the record places no one there. Draff, Brook, Flora, Shiliu and Chloris have no point of their own, so they stay unplaced until the scene's group export places them.
- **The wiki's NPC pages are the one source left.** The births reach Natlan's groups and none of Nod-Krai's, and give each NPC a single spot, so the record holds no Nod-Krai resident and no second spot to tell a day place from a night one. Nod-Krai's residents wait on the NPC placements missing from the scene-group export, since the wiki's Nod-Krai NPC pages give their hours but no positions. Outside Nod-Krai, each resident's night spot comes from the wiki's NPC page, its location and hours, placed as an estimate marked provisional, and the residents' writer reads them beside the births; a Nod-Krai night spot waits on the same placements as its day spot.
- **A vendor sells in their hours.** A resident who sells does so only in the hours their page gives, and offers no shop outside them, once the [shops](../genshin-shops/design.md) sell.
- **Read by the world's clock.** Where a resident stands is read from the world's clock each frame, so a jump in time from the Time screen moves them as the hours do.

## What is left

Nothing is built until the wiki's NPC pages are read; then, in order:

1. **The wiki's night spots outside Nod-Krai.** `scripts/src/services/genshinAssets/residents/joinResidents.ts` reads each non-Nod-Krai NPC's location and hours from its wiki page: an NPC whose page gives a night spot takes it as its provisional night spot. An NPC of Nod-Krai joins as a resident only once the scene-group export places them, the same wait as its day spot. `pnpm -C scripts genshin:assets residents` rewrites the regions' data, and `joinResidents.test.ts` asserts a resident with a night spot gains one and a resident with only a day spot keeps it through the night.
2. **Vendors' hours**, with the [shops](../genshin-shops/design.md)' vendors: a vendor sells while they stand at their spot, as Blanche's shop is open at all hours by the wiki and Draff's by day.

- **Not covered by the wiki's pages.** Snezhnaya has no residents, since its fit matched no statue or waypoint, and the wiki's daytime and nighttime gallery pictures are not read, the NPC pages' location and hours standing in their place.

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
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the open world's NPC birth records the scene group record's NPC members are filled from.
