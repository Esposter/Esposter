# Achievements

The [achievements](../../specs/genshin/achievements/design.md) page holds the table, the quest triggers, the Achievements screen and the namecard a finished category pays. What is left is the triggers the other pages record, and the grant of that namecard to the profile. Each trigger type is wired once to the record it reads, so an achievement waits on the page that records its doing and moves once that page does.

## Decisions

- **A watcher per trigger type, added as its page lands.** Exploring's triggers (chests, waypoints, areas, statues and offerings, materials, fish caught) join `AchievementTriggerEventKindMap` one trigger type at a time, each wired to the record its page keeps. A trigger type not in the map is not watched, so its achievements stay at zero until it is.
- **Server-fired triggers are written one by one.** Hundreds are triggered by a scene group's notice or a combat config, which run on the game's servers and are never in the client. Each is written from its own description, as a check over the world's doings, when the page building its subject lands: a puzzle's with the puzzle, a combat feat's with the kits.
- **The namecard is granted from the finished category, never stored.** The namecard is read from the progress each time, so the grant adds to the profile's held namecards and nothing waits on a namecard list kept in the save.
- **Exploring's triggers wait on their doings' callers.** Only the pickups have a caller in the world today, and no achievement counts Mondstadt's pickups, so each exploring trigger type joins the map when its page's rule (opening a chest, unlocking a waypoint, an offering's level) is called from the world.
- **Settled for the triggers still to come (2026-10-09, from the table).** A quest trigger names a sub-quest's id, the `subId` of the quest table. A parent-quest trigger names a main quest's id, which finishes once its last sub-quest does. An OR trigger counts each named quest once, so an OR with a count of five needs five of its list.

## Scope and order

1. **Exploring's triggers**, each as its page's rule gains a caller in the world.
2. **Each server-fired achievement**, with the page that builds its subject.
3. **The namecard's grant**, from `computeAchievementNamecardItemIds` into the profile's held namecards.

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

## Reference

- `achievements-screen.mkv` — the Achievements screen opened from the Paimon menu on a category with a finished achievement and one with none, 20 seconds at most; the category tabs' places, the rows' layout, the Primogem glyph and the hidden row's "?" are read from it ([achievements](../../specs/genshin/achievements/design.md)). Partly found 2026-10-11 in the wiki's still `File:Achievements.png`; still sought: A video of the Achievements screen opened from the Paimon menu on a category with a finished achievement and one with none, 20 seconds at most. The still is 1600x878 and older, with no hidden row in view.
