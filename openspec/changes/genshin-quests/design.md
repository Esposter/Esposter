# Quests

The [quests](../../specs/genshin/quests/design.md) page holds the quest model, its progression, the quest screen laid out off the wiki's still, the navigation beam, the reader that writes the carried quests from the community's dump, the start and finish of the Archon quests, the world quests started by the talks that offer them, and the achievements and Travel Log they reach. It builds on [dialogue](../../specs/genshin/dialogue/design.md), whose talks a quest's talk-to steps end on. What remains is what the world still does not hand the quests: the places the go-to steps stand at and the series a world quest belongs to.

## Decisions

- **A go-to's place is its own location guide.** A go-to step's guide names where to go. In the dump's quest file (`BinOutput/Quest/<id>.json`, field names obfuscated), a sub-quest's guide of type `QUEST_GUIDE_LOCATION` carries a dummy point name as its parameter, such as `Q351ClimbEnd` for Wanderer's Trail's first step (quest 351). The client's `scene3_dummy_points.lua`, decoded by `pnpm -C scripts genshin:assets scene-scripts`, places that point, and it held all four such names checked on 2026-10-12. A `QUEST_GUIDE_NPC` guide places the step at that NPC. The go-to's radius is an estimate, marked provisional.
- **A go-to's place is placed in region data.** A region's data places each go-to the carried quests name, and reaching it is the go-to event. Navigation then finds it as it finds a resident.
- **A go-to is reached on stepping in.** The character's ground point is read as it moves, and each go-to place it steps into raises its trigger's go-to event once. Standing within a radius raises nothing, so a step held in a radius raises no second event, and a place reached before the quest starts raises none for it.
- **A series' later quest waits on the one before it.** `startQuests` takes the series' order from the chapter table's quests, so a quest whose predecessor is not carried is never offered, since it could not finish. The world hands no series yet, so the order holds for no quest until the chapters are read (section 2.1, not yet built).

## What is left

1. **The go-to places.** Each carried go-to's guide is read from its quest file: a dummy point is placed from the client's dummy points, and an NPC from the residents' places. Its place is written into its region's data with its provisional radius, reaching it being the go-to event.
2. **The world quest series.** A carried world quest's series is the quest screen's `QuestChapter`, which the screen lists the quest under once the world hands it the series. The chapter table (`ChapterExcelConfigData`, in the dump at the install's build) names each series by the main quest's `chapterId`: its title, its region by `cityId`, and its first quest. Its words are already in the community dump's English text maps for 399 of its 430 titles and 332 of its numbers (`chapterNumTextMapHash`), so a series' journal waits on nothing, and one with no words shows empty, as a dialog line does. The Seventh Samurai, the one world quest carried, belongs to none, so this step carries one series whole: the first whose first quest a placed resident offers, found by the check The Seventh Samurai was picked by ([quests](../../specs/genshin/quests/design.md)). A series' quests unlock one after another, so `startQuests` gains that order, offering each once the one before it is finished.
3. **The clues.** The quests' objectives' places are what [Elemental Sight](../genshin-elemental-sight/design.md) draws its quest trails to, and what [companionship](../genshin-companionship/design.md)'s story waits name, once item 1 places them.

The commissions are dealt by [commissions](../../specs/genshin/commissions/design.md), and their wiring is that proposal's. The finished quests the world level reads are [Adventure Rank](../genshin-adventure-rank/design.md)'s.

## Measures owed

These need the English PC client at 1080 high, published screenshots and recordings first ([parity](../../specs/genshin/parity/README.md)):

- **The Adventurer Handbook**, against the wiki's screenshot of its Experience tab: the book, its tabs and its close button.
- **The beam**, its radius and colour off a recording navigating to an objective, into `QUEST_BEAM_RADIUS` and `QUEST_BEAM_COLOR`.

## Key files

| File                                                            | Role after the change                                                |
| :-------------------------------------------------------------- | :------------------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Session/Index.vue` | Starts the quests, hands each doing to them and reports the finishes |
| `packages/genshin-world/src/models/world/RegionData.ts`         | Gains the go-to places the carried quests name                       |
| `packages/genshin-world/src/models/quest/QuestId.ts`            | Grows by a line for each quest carried                               |
| `packages/genshin-world/src/services/quest/QuestLoaderMap.ts`   | Gains a line for each quest carried                                  |

## Sources

- [Quest](https://genshin-impact.fandom.com/wiki/Quest), Genshin Impact Wiki: the kinds of quest, and navigation's beam.
- [Commission](https://genshin-impact.fandom.com/wiki/Commission), Genshin Impact Wiki: four commissions a day at the reset, from the areas reached, in the preferred region the handbook sets.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: V for quest navigation, and held V for the step's objective.

## Reference

- `quest-open.mkv` — J pressed in the open world, the quest screen opening, a Q step to the next tab, then J closing it, 60 frames a second; the open, close and tab timings are read off it. Partly found 2026-10-11: the wiki's `File:Quest Screen.png`, and the 6.3 Quest Overview showcase `captures/yt-2_e7S_J9yAA-quest-overview.mp4`, J opening the screen over the world about 1.9 seconds in with no quest in progress; still sought: the still shows the screen's layout only; the open, close and tab timings are read off motion, which the still cannot give. The 1080p file is from the 2026 wiki revision.
