---
title: Quests
description: Proposal — what remains of Genshin's quests once the carried Archon quests start and the world's doings advance them: the quest screen measured against the wiki's still, the go-to triggers placed in region data, the world and story quests started by the talks that offer them, and the clues the quests leave for companionship and Elemental Sight. The quest model, its progression, its save, the quest screen, the navigation beam, the HUD's tracker and V, the handbook's tabs, the reader, the start and finish of the Archon quests, and the achievements and Travel Log they reach are built, as the quests page describes.
model: claude-opus-5-5
needs: [parity-page]
touches: ["packages/genshin-world/src/components/Quest/Screen/**"]
---

# Quests

The quest model and its pure progression, the quest screen J opens, the beam over a navigated objective, the Adventurer Handbook's tabs, the reader that writes the carried quests from the community's dump, and the world's side are built: the carried Archon quests start from the prologue's first, a talk's end, an item collected, an enemy defeated and a thing acted on advance the quests in progress, and a finished quest reaches the achievements and the Travel Log. See [quests](/docs/genshin/quests), [achievements](/docs/genshin/achievements) and [archive](/docs/genshin/archive). What remains is what the world still does not hand the quests: the places the go-to steps stand at, the quests the talks offer, and the commissions. It builds on [dialogue](/docs/proposals/genshin/dialogue), whose talks a quest's talk-to steps end on.

## Decisions

- **The carried quests are chunks of the bundle, loaded on demand.** The reader's quest files and words are imported as their own chunks by `QuestLoaderMap` and `QuestTextLoaderMap`, one line a carried quest, rather than served from a base URL as region data is. A quest is small enough to ship with the world, and the typed map makes a quest carried without its loader fail to typecheck.
- **The Archon quests run from the prologue's first.** `startQuests` starts the first Archon quest not finished once the ones before it are. The carried quests are listed in the order the prologue plays them, Wanderer's Trail before Bird's Eye View.
- **Every doing the world records is an event.** The [quests](/docs/genshin/quests) page sets out which doing is which event, and each event is handed to every quest in progress. A collect counts one pick up, whatever the bag had room for.
- **A quest's finish reaches the watchers as the achievements expect.** Each step passed on is a `QuestFinished` under the step's id, and a quest its last step finishes is a `ParentQuestFinished` under the quest's id. A finished main quest opens its Travel Log entry, by the entry's quest.
- **Progress is kept in the save.** Each carried quest's progress is a slice of the world's [save](/docs/genshin/save-data), kept in localStorage when signed out and merged by the further step, which is built.
- **A go-to's place is its trigger's region in the scene groups.** A go-to step's condition is `QUEST_CONTENT_TRIGGER_FIRE` with a trigger id (`1053` for Wanderer's Trail's first step, read from `BinOutput/Quest/351.json`). AnimeGameData's `TriggerExcelConfigData` names each id's scene, group and trigger name, and the group's script places the trigger's region, so a trigger is placed only from the scene group export, never by hand.
- **A carried quest is a record of the hosted game data.** Carrying a world or story quest publishes its own record under `quests` and its words in every language under `questText`, which `QuestLoaderMap` and `QuestTextLoaderMap` fetch by key, so a carried quest adds nothing to `genshin-world`'s bundle.
- **A place's trigger is placed in region data.** A go-to objective names the trigger the game fires, so a region's data places each trigger the carried quests name, and reaching it is the go-to event. Navigation then finds it as it finds a resident.
- **A quest a talk offers starts from that talk.** A world or story quest starts when the talk that offers it ends, the offering talk read from the quest table.
- **The daily commissions are four a day, dealt at the reset.** As the wiki describes them, they are drawn from the pool of the areas the player has reached, with the preferred region the handbook sets.
- **The quest and dialogue text is the install's own.** A quest's words and a talk's are decoded from the installed game at the same patch as every other export, so a line, its id and its quest cannot drift apart. The community dump's half-empty English text then stops mattering.

## What is left

1. **The quest screen's layout pass, from the wiki still held.** `quest-screen` (`File:Quest Screen.png`, 1920 by 1080, in `references/` by `pnpm -C scripts genshin:parity fetch`) scores 55.84% today. Set `components/Quest/Screen/Index.fixture.ts` to the still's state, with readable text ids for the fixture alone as `components/Dialogue/Talk/Index.fixture.ts` does: the In Progress tab, three Archon rows with distances, the World Quests heading with two series and their steps, and the detail panel's title, journal line, one objective at (0/3), description, five rewards and the Quest Overview and Cancel Navigation buttons. Place each piece off the still with `genshin:parity zoom` and `measure`, its sizes written in a `Layout.reference.ts` beside the component, and trace the six tab glyphs and the close mark with `genshin:parity trace` on the still at full resolution. The pass holds when `pnpm -C scripts genshin:parity compare quest-screen` falls clear of the 55.84% and its row of `ParityReferenceMap.snapshot.md` is committed with it, and the image is queued for the user's eyes under the roadmap's Awaiting the user.
2. **The go-to triggers.** Waits on the scene group export the other machine is making. Then `TriggerExcelConfigData` (added to `DUMP_TABLE_NAMES` and fetched with `genshin:text fetch`) joins each carried go-to's trigger id to its group, and the group's region is placed in its region's data, reaching it being the go-to event.
3. **The talks that offer a quest.** A world or story quest starts from the talk that offers it, read from the quest's own `BinOutput/Quest` file. Each carried quest is a record of its own, published by `genshin:text quests`.
4. **The clues.** The quests' objectives' places are what [Elemental Sight](/docs/proposals/genshin/elemental-sight) draws its quest trails to, and what [companionship](/docs/proposals/genshin/companionship)'s story waits name, once item 2 places them.

The commissions are dealt by [commissions](/docs/genshin/commissions), and their wiring is that proposal's. The finished quests the world level reads are [Adventure Rank](/docs/proposals/genshin/adventure-rank)'s.

## Measures owed

These need the English PC client at 1080 high, published screenshots and recordings first ([parity](/docs/genshin/parity)):

- **The quest screen**, against the wiki's screenshot `ParityReferenceMap` names, which What is left's first item builds.
- **The Adventurer Handbook**, against the wiki's screenshot of its Experience tab: the book, its tabs and its close button.
- **The beam**, its radius and colour off a recording navigating to an objective, into `QUEST_BEAM_RADIUS` and `QUEST_BEAM_COLOR`.

## Key files

| File                                                            | Role after the change                                                |
| :-------------------------------------------------------------- | :------------------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Session/Index.vue` | Starts the quests, hands each doing to them and reports the finishes |
| `packages/genshin-world/src/models/world/RegionData.ts`         | Gains the triggers the carried quests name                           |
| `packages/genshin-world/src/models/quest/QuestId.ts`            | Grows by a line for each quest carried                               |
| `packages/genshin-world/src/services/quest/QuestLoaderMap.ts`   | Gains a line for each quest carried                                  |

## Sources

- [Quest](https://genshin-impact.fandom.com/wiki/Quest), Genshin Impact Wiki: the kinds of quest, and navigation's beam.
- [Commission](https://genshin-impact.fandom.com/wiki/Commission), Genshin Impact Wiki: four commissions a day at the reset, from the areas reached, in the preferred region the handbook sets.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: V for quest navigation, and held V for the step's objective.
