---
title: Achievements
description: Proposal — the achievements beyond the quest triggers already built: exploring's triggers as their pages land, the server-fired ones written one by one from their descriptions, and the namecard a finished category pays. The table, the quest triggers and the screen are built, as the achievements page describes.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/services/achievement/**"]
---

# Achievements

The table, the quest triggers and the Achievements screen are built, and the [achievements](/docs/genshin/achievements) page describes them. What is left is the triggers the other pages record, and the namecard a finished category pays. Each trigger type is wired once to the record it reads, so an achievement waits on the page that records its doing and moves once that page does.

## Decisions

- **A watcher per trigger type, added as its page lands.** Exploring's triggers (chests, waypoints, areas, statues and offerings, materials, fish caught) join `AchievementTriggerEventKindMap` one trigger type at a time, each wired to the record its page keeps. A trigger type not in the map is not watched, so its achievements stay at zero until it is.
- **Server-fired triggers are written one by one.** Hundreds are triggered by a scene group's notice or a combat config, which run on the game's servers and are never in the client. Each is written from its own description, as a check over the world's doings, when the page building its subject lands: a puzzle's with the puzzle, a combat feat's with the kits.
- **A namecard is held by the finished category, never stored.** A category with an end pays the namecard item its reward names when every one of its achievements is finished, which `checkIsAchievementCategoryComplete` already tests, and the open-ended categories, whose `namecardItemId` is zero, pay none. The namecard is read from the progress each time, as [companionship](/docs/proposals/genshin/companionship) reads a Friendship namecard from the level, so nothing waits on a namecard list kept in the save; the profile's list is the two read together.
- **Exploring's triggers wait on their doings' callers.** Only the pickups have a caller in the world today, and no achievement counts Mondstadt's pickups, so each exploring trigger type joins the map when its page's rule (opening a chest, unlocking a waypoint, an offering's level) is called from the world.
- **Settled for the triggers still to come (2026-10-09, from the table).** A quest trigger names a sub-quest's id, the `subId` of the quest table. A parent-quest trigger names a main quest's id, which finishes once its last sub-quest does. An OR trigger counts each named quest once, so an OR with a count of five needs five of its list.

## Scope and order

1. **The namecards the finished categories pay, as a rule.** No source is owed: `packages/genshin-world/src/generated/achievements/categories.json` holds each category's `namecardItemId`.

   ```text
   packages/genshin-world/src/services/achievement/computeAchievementNamecardItemIds.ts
   ```

   - `computeAchievementNamecardItemIds.ts`: given the categories, the achievements and the progress map, the `namecardItemId` of every category with a non-zero one that `checkIsAchievementCategoryComplete` finds finished, in the categories' order.
   - The proof: `computeAchievementNamecardItemIds.test.ts` beside it, on two categories of two achievements each, lists the namecard of the one with both finished, none for the one with one finished, and none for a finished category whose `namecardItemId` is zero.

2. **Exploring's triggers**, each as its page's rule gains a caller in the world.
3. **Each server-fired achievement**, with the page that builds its subject.

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
