---
title: Achievements
description: Proposal — the achievements beyond the quest triggers already built: exploring's triggers as their pages land, the server-fired ones written one by one from their descriptions, and the namecard a finished category pays once companionship keeps namecards. The table, the quest triggers and the screen are built, as the achievements page describes.
model: claude-opus-5-5
---

# Achievements

The table, the quest triggers and the Achievements screen are built, and the [achievements](/docs/genshin/achievements) page describes them. What is left is the triggers the other pages record, and the namecard a finished category pays. Each trigger type is wired once to the record it reads, so an achievement waits on the page that records its doing and moves once that page does.

## Decisions

- **A watcher per trigger type, added as its page lands.** Exploring's triggers (chests, waypoints, areas, statues and offerings, materials, fish caught) join `AchievementTriggerEventKindMap` one trigger type at a time, each wired to the record its page keeps. A trigger type not in the map is not watched, so its achievements stay at zero until it is.
- **Server-fired triggers are written one by one.** Hundreds are triggered by a scene group's notice or a combat config, which run on the game's servers and are never in the client. Each is written from its own description, as a check over the world's doings, when the page building its subject lands: a puzzle's with the puzzle, a combat feat's with the kits.
- **A namecard, once companionship keeps one.** A category with an end pays the namecard item its reward names when every one of its achievements is finished, which `checkIsAchievementCategoryComplete` already tests. The open-ended categories pay none. The grant waits on the [companionship](/docs/proposals/genshin/companionship) page's namecard list.
- **Settled for the triggers still to come (2026-10-09, from the table).** A quest trigger names a sub-quest's id, the `subId` of the quest table. A parent-quest trigger names a main quest's id, which finishes once its last sub-quest does. An OR trigger counts each named quest once, so an OR with a count of five needs five of its list.

## Scope and order

1. **Quest finishes reach the watchers.** The quest page that starts and finishes quests emits a `QuestFinished` for each sub-quest and a `ParentQuestFinished` for each main quest once its last sub-quest is done, and calls `advanceAchievements` with the same doing it hands `advanceQuest`. Until it does, the table and the screen read zero.
2. **Exploring's triggers**, as the chest, waypoint, area, statue, offering and gathering pages land.
3. **Each server-fired achievement**, with the page that builds its subject.
4. **The namecard grant**, with companionship's namecard list.

## Data and measures

- **Read from the wiki:** what a server-fired achievement asks for, wherever its own words are vague.
- **Read from a recording:** the Achievements screen's look, once `achievements-screen.mkv` is owed on the roadmap.

## Key files

| File                                                                                    | Role after the change                             |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------ |
| `packages/genshin-world/src/services/achievement/AchievementTriggerEventKindMap.ts`     | Each watched trigger type and the doing it counts |
| `packages/genshin-world/src/services/quest/advanceQuest.ts`                             | Beside the watchers handed the same doings        |
| `packages/genshin-world/src/services/achievement/checkIsAchievementCategoryComplete.ts` | The namecard's completion test, read by the grant |

## Sources

- [Achievements](https://genshin-impact.fandom.com/wiki/Achievements), Genshin Impact Wiki: the namecard a category pays once it is done, as the namecard decision takes it.
