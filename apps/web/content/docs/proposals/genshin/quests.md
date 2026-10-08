---
title: Quests
description: Proposal — Genshin's quests, still to come. The carried quests are written from the community's dump, with their words to be taken from the installed game's own text, and served to the world with those words, started as the game starts them, and advanced by every doing the world records. Their progress is kept in the browser, held V shows the step, the map pins the objective, and the daily commissions are dealt at the reset. The quest screen and the handbook are measured. The quest model, its progression, the quest screen, the navigation beam, the HUD's tracker and V, the handbook's tabs and the reader are built, as the quests page describes.
model: claude-opus-5-5
---

# Quests

The quest model and its pure progression, the quest screen J opens, the beam over a navigated objective, the Adventurer Handbook's tabs and the reader that writes the carried quests from the community's dump are built: see [quests](/docs/genshin/quests) and [Adventurer Handbook](/docs/genshin/adventurer-handbook). What remains gives the world quests to play and joins each of the world's doings to them. It builds on [dialogue](/docs/proposals/genshin/dialogue), whose talks a quest's talk-to steps end on.

## Decisions

- **The carried quests are served like region data.** The reader's quest files and text chunks are served by the app at a base URL the world takes as a prop, as region data is. A quest is fetched when it starts and its words with it, in the reader's language. The quests carried grow by a line in `QuestId` and a run of the reader each, never by hand.
- **A quest starts as the game starts it.** An Archon quest starts when the one before it finishes, from the prologue's first. A world or story quest starts from the talk that offers it. A commission is dealt at the daily reset. Only what has started shows on the quest screen.
- **Every doing the world records is an event.** A talk's end is a talk-to event under its talk's id. A trigger reached is a go-to under the trigger's. An item picked up is a collect under the item's id ([inventory](/docs/proposals/genshin/inventory)), an enemy defeated is a defeat under its kind ([enemies](/docs/genshin/enemies)), and a thing acted on or a waypoint unlocked is an interact ([interaction](/docs/proposals/genshin/interaction)). Each is handed to every quest in progress, so one doing can advance several.
- **Progress is kept in the browser.** Each quest's progress, the quests finished and the one navigated to are kept per device, as the [menu screens](/docs/proposals/genshin/menu-screens)' settings are, since the world is the person's own and needs no account.
- **The navigated quest is found as the game finds it.** The HUD's tracker and V's navigation are built ([HUD](/docs/genshin/hud)). Holding V shows the step's objective, the map pins the objective, and its distance shows beside the HUD's mark.
- **A place's trigger is placed in region data.** A go-to objective names the trigger the game fires, so a region's data places each trigger the carried quests name, and reaching it is the go-to event. Navigation then finds it as it finds a resident.
- **The daily commissions are four a day, dealt at the reset.** As the wiki describes them, they are drawn from the pool of the areas the player has reached, with the preferred region the handbook sets.
- **The quest and dialogue text is the install's own.** A quest's words and a talk's are decoded from the installed game at the same patch as every other export, so a line, its id and its quest cannot drift apart. The community dump's half-empty English text then stops mattering.

## Measures owed

These need the English PC client at 1080 high, published screenshots and recordings first ([parity](/docs/genshin/parity)):

- **The quest screen**, against the wiki's screenshot `ParityReferenceMap` names: its tabs' glyphs traced from the game's own, and its list, headings, details and button measured as the login's interface is.
- **The Adventurer Handbook**, against the wiki's screenshot of its Experience tab: the book, its tabs and its close button.
- **The beam**, its radius and colour off a recording navigating to an objective, into `QUEST_BEAM_RADIUS` and `QUEST_BEAM_COLOR`.

## Key files

| File                                                           | Role after the change                                     |
| :------------------------------------------------------------- | :-------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Screen/Index.vue` | Holds the quests in progress and hands each doing to them |
| `packages/genshin-world/src/models/world/RegionData.ts`        | Gains the triggers the carried quests name                |
| `packages/genshin-world/src/models/quest/QuestId.ts`           | Grows by a line for each quest carried                    |

## Sources

- [Quest](https://genshin-impact.fandom.com/wiki/Quest), Genshin Impact Wiki: the kinds of quest, and navigation's beam.
- [Commission](https://genshin-impact.fandom.com/wiki/Commission), Genshin Impact Wiki: four commissions a day at the reset, from the areas reached, in the preferred region the handbook sets.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: V for quest navigation, and held V for the step's objective.
