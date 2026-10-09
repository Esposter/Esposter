---
title: Quests
description: Proposal — what remains of Genshin's quests once the carried Archon quests start and the world's doings advance them: the go-to triggers placed in region data, the world and story quests started by the talks that offer them, the commissions dealt at the reset, and the clues the quests leave for companionship and Elemental Sight. The quest model, its progression, the quest screen, the navigation beam, the HUD's tracker and V, the handbook's tabs, the reader, the start and finish of the Archon quests, and the achievements and Travel Log they reach are built, as the quests page describes.
model: claude-opus-5-5
---

# Quests

The quest model and its pure progression, the quest screen J opens, the beam over a navigated objective, the Adventurer Handbook's tabs, the reader that writes the carried quests from the community's dump, and the world's side are built: the carried Archon quests start from the prologue's first, a talk's end, an item collected, an enemy defeated and a thing acted on advance the quests in progress, and a finished quest reaches the achievements and the Travel Log. See [quests](/docs/genshin/quests), [achievements](/docs/genshin/achievements) and [archive](/docs/genshin/archive). What remains is what the world still does not hand the quests: the places the go-to steps stand at, the quests the talks offer, and the commissions. It builds on [dialogue](/docs/proposals/genshin/dialogue), whose talks a quest's talk-to steps end on.

## Decisions

- **The carried quests are chunks of the bundle, loaded on demand.** The reader's quest files and words are imported as their own chunks by `QuestLoaderMap` and `QuestTextLoaderMap`, one line a carried quest, rather than served from a base URL as region data is. A quest is small enough to ship with the world, and the typed map makes a quest carried without its loader fail to typecheck.
- **The Archon quests run from the prologue's first.** `startQuests` starts the first Archon quest not finished once the ones before it are. The carried quests are listed in the order the prologue plays them, Wanderer's Trail before Bird's Eye View.
- **Every doing the world records is an event.** A talk's end is a talk-to under its talk's id, an item picked up or a gathering point picked is a collect under the item's id, an enemy defeated is a defeat under its kind, and a waypoint or landmark unlocked is an interact. Each is handed to every quest in progress, so one doing can advance several. A collect counts one pick up, whatever the bag had room for.
- **A quest's finish reaches the watchers as the achievements expect.** Each step passed on is a `QuestFinished` under the step's id, and a quest its last step finishes is a `ParentQuestFinished` under the quest's id. A finished main quest opens its Travel Log entry, by the entry's quest.
- **Progress is kept in the browser.** Each quest's progress, the quests finished and the one navigated to are kept per device, as the [menu screens](/docs/proposals/genshin/menu-screens)' settings are, since the world is the person's own and needs no account. Held in memory until the save lands, as What is left says.
- **A place's trigger is placed in region data.** A go-to objective names the trigger the game fires, so a region's data places each trigger the carried quests name, and reaching it is the go-to event. Navigation then finds it as it finds a resident.
- **A quest a talk offers starts from that talk.** A world or story quest starts when the talk that offers it ends, the offering talk read from the quest table.
- **The daily commissions are four a day, dealt at the reset.** As the wiki describes them, they are drawn from the pool of the areas the player has reached, with the preferred region the handbook sets.
- **The quest and dialogue text is the install's own.** A quest's words and a talk's are decoded from the installed game at the same patch as every other export, so a line, its id and its quest cannot drift apart. The community dump's half-empty English text then stops mattering.

## What is left

1. **The save.** The world keeps no save yet, so the bag, the wallet and the quests alike start over on a reload. Each quest's progress, the quests finished and the one navigated to are kept per device once the save lands, as the decision above says.
2. **The go-to triggers.** A quest's go-to steps name triggers no region data places yet, so they never move. Each trigger the carried quests name is placed in its region's data, and reaching it is the go-to event.
3. **The talks that offer a quest.** A world or story quest starts from the talk that offers it. The carried quests do not name their offering talk, so the quest table's offer is read first.
4. **The commissions.** Dealt at the reset from the reached areas' pools, with the preferred region, as [commissions](/docs/genshin/commissions) describes.
5. **The clues.** The quests' objectives' places are what [Elemental Sight](/docs/proposals/genshin/elemental-sight) draws its quest trails to, and what [companionship](/docs/proposals/genshin/companionship)'s story waits name, once the places are placed by item 1.
6. **The Adventure Rank's quests.** The world level is still computed from no finished quests. [Adventure rank](/docs/proposals/genshin/adventure-rank) reads the finished quests once the rank's own page does.

## Measures owed

These need the English PC client at 1080 high, published screenshots and recordings first ([parity](/docs/genshin/parity)):

- **The quest screen**, against the wiki's screenshot `ParityReferenceMap` names: its tabs' glyphs traced from the game's own, and its list, headings, details and button measured as the login's interface is.
- **The Adventurer Handbook**, against the wiki's screenshot of its Experience tab: the book, its tabs and its close button.
- **The beam**, its radius and colour off a recording navigating to an objective, into `QUEST_BEAM_RADIUS` and `QUEST_BEAM_COLOR`.

## Key files

| File                                                           | Role after the change                                                |
| :------------------------------------------------------------- | :------------------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Screen/Index.vue` | Starts the quests, hands each doing to them and reports the finishes |
| `packages/genshin-world/src/models/world/RegionData.ts`        | Gains the triggers the carried quests name                           |
| `packages/genshin-world/src/models/quest/QuestId.ts`           | Grows by a line for each quest carried                               |
| `packages/genshin-world/src/services/quest/QuestLoaderMap.ts`  | Gains a line for each quest carried                                  |

## Sources

- [Quest](https://genshin-impact.fandom.com/wiki/Quest), Genshin Impact Wiki: the kinds of quest, and navigation's beam.
- [Commission](https://genshin-impact.fandom.com/wiki/Commission), Genshin Impact Wiki: four commissions a day at the reset, from the areas reached, in the preferred region the handbook sets.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: V for quest navigation, and held V for the step's objective.
