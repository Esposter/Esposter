---
title: Quests
description: Proposal — what remains of Genshin's quests: the go-to places placed in region data, the series a world quest belongs to, and the clues the quests leave for companionship and Elemental Sight.
model: claude-opus-5-5
needs: [parity-page]
touches:
  [
    "packages/genshin-world/src/components/Handbook/**",
    "packages/genshin-world/src/components/Quest/**",
    "packages/genshin-world/src/services/quest/**",
    "scripts/src/services/genshinText/**",
  ]
---

# Quests

The [quests](/docs/genshin/quests) page holds the quest model, its progression, the quest screen laid out off the wiki's still, the navigation beam, the reader that writes the carried quests from the community's dump, the start and finish of the Archon quests, the world quests started by the talks that offer them, and the achievements and Travel Log they reach. It builds on [dialogue](/docs/genshin/dialogue), whose talks a quest's talk-to steps end on. What remains is what the world still does not hand the quests: the places the go-to steps stand at and the series a world quest belongs to.

## Decisions

- **A go-to's place is its own location guide.** A go-to step's guide names where to go. In the dump's quest file (`BinOutput/Quest/<id>.json`, field names obfuscated), a sub-quest's guide of type `QUEST_GUIDE_LOCATION` carries a dummy point name as its parameter, such as `Q351ClimbEnd` for Wanderer's Trail's first step (quest 351). The client's `scene3_dummy_points.lua`, decoded by `pnpm -C scripts genshin:assets scene-scripts`, places that point, and it held all four such names checked on 2026-10-12. A `QUEST_GUIDE_NPC` guide places the step at that NPC. The go-to's radius is an estimate, marked provisional.
- **A go-to's place is placed in region data.** A region's data places each go-to the carried quests name, and reaching it is the go-to event. Navigation then finds it as it finds a resident.

## What is left

1. **The go-to places.** Each carried go-to's guide is read from its quest file: a dummy point is placed from the client's dummy points, and an NPC from the residents' places. Its place is written into its region's data with its provisional radius, reaching it being the go-to event.
2. **The world quest series.** A carried world quest's series is the quest screen's `QuestChapter`, which the screen lists the quest under once the world hands it the series. The chapter table (`ChapterExcelConfigData`, added to `DUMP_TABLE_NAMES`) names each series by the main quest's `chapterId`: its title, its region by `cityId`, and its first quest. Its words are already in the community dump's English text maps for 399 of its 430 titles and 332 of its numbers (`chapterNumTextMapHash`), so a series' journal waits on nothing, and one with no words shows empty, as a dialog line does. The Seventh Samurai, the one world quest carried, belongs to none, so this step carries one series whole: the first whose first quest a placed resident offers, found by the check The Seventh Samurai was picked by ([quests](/docs/genshin/quests)). A series' quests unlock one after another, so `startQuests` gains that order, offering each once the one before it is finished.
3. **The clues.** The quests' objectives' places are what [Elemental Sight](/docs/proposals/genshin/elemental-sight) draws its quest trails to, and what [companionship](/docs/proposals/genshin/companionship)'s story waits name, once item 1 places them.

The commissions are dealt by [commissions](/docs/genshin/commissions), and their wiring is that proposal's. The finished quests the world level reads are [Adventure Rank](/docs/proposals/genshin/adventure-rank)'s.

## Measures owed

These need the English PC client at 1080 high, published screenshots and recordings first ([parity](/docs/genshin/parity)):

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
