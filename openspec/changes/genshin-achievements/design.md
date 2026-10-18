# Achievements

The [achievements](../../specs/genshin/achievements/design.md) page holds the table, the quest triggers, the Achievements screen and the namecard a finished category pays. What is left is the triggers the other pages record, and the grant of that namecard to the profile. Each trigger type is wired once to the record it reads, so an achievement waits on the page that records its doing and moves once that page does.

## Decisions

- **A watcher per trigger type, added as its page lands.** Exploring's triggers (chests, waypoints, areas, statues and offerings, materials, fish caught) join `AchievementTriggerEventKindMap` one trigger type at a time, each wired to the record its page keeps. A trigger type not in the map is not watched, so its achievements stay at zero until it is.
- **Server-fired triggers are written one by one.** Hundreds are triggered by a scene group's notice or a combat config, which run on the game's servers and are never in the client. Each is written from its own description, as a check over the world's doings, when the page building its subject lands: a puzzle's with the puzzle, a combat feat's with the kits.
- **A level trigger counts the level its event reached (2026-10-18, decided by the main session).** A trigger whose watch names a `levelSlot` reads the level to reach in that slot, and its event's quantity is the level reached. The count is the level reached, never a sum of events, and the trigger finishes once that level is the one it names.
- **The namecard is granted from the finished category, never stored.** The namecard is read from the progress each time, so the grant adds to the profile's held namecards and nothing waits on a namecard list kept in the save.
- **Each watched trigger names the slot its target sits in (2026-10-18, decided by the main session).** `AchievementTriggerEventKindMap` holds, for each watched trigger type, the event kind it counts, the parameter slot its target id or ids sit in (the table's `paramList` index), and whether its event advances the count by one or by the event's quantity. `advanceAchievements` reads only that slot, and a slot's list splits on both `,` and `;`. The trigger's parameters keep their slots, so a slot's list is never read as another's.
- **The slots of the watched exploring triggers.** Quest triggers (`TRIGGER_FINISH_QUEST_AND`/`_OR`, `TRIGGER_FINISH_PARENT_QUEST_AND`/`_OR`): slot 0, by one. Chests (`TRIGGER_OPEN_WORLD_CHEST`): slot 0, by one. Waypoints and statues (`TRIGGER_UNLOCK_TRANS_POINT`): slot 2, by one. Offering levels (`TRIGGER_OFFERING_LEVEL`): slot 0 names the offering by its id (`1` for the Frostbearing Tree), and slot 1 the level the trigger reaches (`4`, `8` or `12`), so the watch matches the offering by slot 0 and reaches its count at the level slot 1 names. The event carries the offering's id and the level it reached (settled 2026-10-18 by the main session). Material gain (`TRIGGER_OBTAIN_MATERIAL_NUM`): slot 0, by the event's quantity. `TRIGGER_UNLOCK_AREA` and `TRIGGER_FISHING_SUCC_NUM` stay out until their callers exist.
- **Each exploring doing is emitted the way quest steps are.** `useWorldChests.openChestById`, `useWorldMap.activateLandmark` (a statue's transport point, from `LandmarkIdStatuePointIdMap`, when it has one), `useWorldOfferings.offerFrostbearingTree` and `useWorldPickups.strikeGatheringOres` (on a break, by the drop count) each put their event on `achievementEvents`. An event's `quantity` is one for every doing but the material gain.
- **The watched ids that do not match the table yet.** A chest place's id is its official map point (`chest-<point>`), and the table names game ids in slot 0, so a chest opening counts nothing until the chest places carry the game's id. No row of the material trigger names an ore item, so an ore break counts nothing until a row names one. `LandmarkIdStatuePointIdMap` maps only Windrise's statue, so only its unlock counts.
- **Settled for the triggers still to come (2026-10-09, from the table).** A quest trigger names a sub-quest's id, the `subId` of the quest table. A parent-quest trigger names a main quest's id, which finishes once its last sub-quest does. An OR trigger counts each named quest once, so an OR with a count of five needs five of its list (provisional: the counted ids are held in the progress for the session only, `countedTargetIds`, and are not saved, since a named quest's step passes once and a reloaded save cannot pass it again; the game's own rule for an OR list, read from a recording or the wiki's wording of one, settles it).

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
