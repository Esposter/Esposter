---
title: Exploration progress
description: Proposal — each area's exploration progress as the game shows it on the map. Galesong Hill, where Windrise stands, is built with its count and percentage, its statue's waypoint the one doing done so far. Mondstadt's share past its thresholds paying its Reputation is next, then chests, camps, Oculi and puzzles as their pages build, each kind's weight re-measured off a recording of the percentage stepping.
model: claude-haiku-5-5
touches:
  [
    "packages/genshin-world/src/services/exploration/**",
    "packages/genshin-world/src/composables/useWorldMap.ts",
    "packages/genshin-world/src/components/World/Session/**",
  ]
---

# Exploration progress

The game's map shows, for every area, how much of it a player has explored as a percentage, and a nation's exploration raises its Reputation at set thresholds. It is a count over what the other exploring pages do, so it waits on the [map unlocking](/docs/proposals/genshin/map-unlocking), [chests](/docs/proposals/genshin/chests), [puzzles](/docs/proposals/genshin/puzzles) and [Statues of The Seven](/docs/proposals/genshin/statues-of-the-seven) whose doings it counts. The count and the percentage are built for Galesong Hill, as the [as-built page](/docs/genshin/exploration-progress) records; what follows is what remains.

## Decisions

- **A share of the area's total.** An area's progress is the weight of what has been done in it over its total, which `ExploreAreaTotalExpExcelConfigData` holds for every area, shown as a percentage on the map's area label.
- **Each doing adds its kind's weight.** A waypoint unlocked, a chest opened, a camp cleared, a puzzle solved and an Oculus offered each add their kind's weight to the area they stand in. `WorldAreaExploreEventConfigData` lists the first three for the first four areas, each with a weight of ten, but those weights do not fit the totals, so each kind's weight is read off a recording of the map's percentage stepping as one of each is done. The puzzle and Oculus kinds have no event in the table, so they are read off the same recording.
- **The table's other events are not kinds of this page.** The table also lists gathered ingredients (`EXPLORE_EVENT_ITEM_ADD`) and a force entered (`EXPLORE_EVENT_ENTER_FORCE`). The public accounts of what counts toward a region's exploration name chests, Oculi, waypoints and challenges, and none names gathering, so the progress counts the kinds above alone. The recording's stepping includes one gathered ingredient, which settles whether gathering moves the percentage.
- **Windrise's area is Galesong Hill.** The table counts per level-one area, and Windrise is a level-two area of Galesong Hill, so Windrise's statue completes Galesong Hill's waypoint and its count is Galesong Hill's.
- **A waypoint is its area's statue.** Built as the [exploration progress](/docs/genshin/exploration-progress) page records; the four areas each hold one waypoint event.
- **The area panel is the area's label.** The count and the percentage sit under each filled area's name on the map, as built.
- **The percentage is rounded down.** Once the measured weights fit the totals, an area reads 100 only with all its weight done, so a near-complete area never shows as complete. Until then the table's weights overshoot, so an area can read 100 early and pass it, as the [as-built page](/docs/genshin/exploration-progress) records.
- **Counted once.** A doing counts once, kept with the player's progress, so a chest that never comes back and a waypoint unlocked once each add their weight a single time.
- **A nation's thresholds raise its Reputation.** A nation's exploration reaching each of `ReputationExploreExcelConfigData`'s thresholds gives its Reputation reward once ([reputation](/docs/proposals/genshin/reputation)). Reputation is kept in the save now, so this is built before the doings below.
- **A nation's percentage is read off its areas the way the tables weigh them.** `ReputationCityExcelConfigData` names the areas each nation's exploration counts (`exploreAreaVec`; Mondstadt's are areas 1 to 4, the four level-one areas the slice holds), and `ExploreAreaTotalExpExcelConfigData` gives each area a `reputationRatio`. Liyue's six ratios sum to one, so a nation's percentage is its areas' percentages weighted by their ratios, rounded down. Every Mondstadt ratio reads 0 at this revision, so a nation whose ratios are all 0 takes its areas' done weight over their summed totals, rounded down, as an area's own percentage is.

## How it works

```mermaid
flowchart LR
  DOING["Waypoint unlocked, chest opened, camp cleared, puzzle solved, Oculus offered"] -->|"its kind's weight"| AREA["Its area's done weight"]
  AREA --> SHARE["Done over the area's total"]
  SHARE --> MAP["The map's area label"]
  SHARE --> NATION{"The nation past a threshold?"}
  NATION -->|"yes"| REP["Reputation reward, once"]
```

## Scope and order

**Built:** the count and the percentage on Galesong Hill's label, from the statue's waypoint alone, as the [as-built page](/docs/genshin/exploration-progress) records.

**This adds, in order:**

```text
packages/genshin-world/src/services/exploration/computeNationExplorationPercentage.ts
```

1. **Mondstadt's Reputation thresholds, paid as a statue is unlocked.**
   - `computeNationExplorationPercentage.ts`: takes the nation's `ExplorationArea`s and the unlocked landmarks, sums each area's done weight (`computeExploredDoingIds`) and total, and returns the percentage by the rule under Decisions (Mondstadt's all-zero ratios: done over total, rounded down). Its test, `computeNationExplorationPercentage.test.ts` beside it, asserts two areas of totals 100 and 300 with 40 done read 10, and that nothing unlocked reads 0.
   - `packages/genshin-world/src/composables/useWorldMap.ts`: `activateLandmark` reads the percentage before and after the unlock, passes both to `computeReputationExploresReached` with `readMondstadtReputation()`'s `explores`, and pays each reached threshold: its `reward.exp` through `addReputationExp` with the slice's `levels`, and its `reward.items` (Mora, item 202) into the wallet through `setWallet`, as `payFirstUnlockReward` pays Primogems. The composable takes a `reputation` ref and a `setReputation` callback beside `wallet` and `setWallet`.
   - `packages/genshin-world/src/components/World/Session/Index.vue`: holds the reputation in a `shallowRef` from `savedState.reputation`, passes it to `useWorldMap`, and saves the ref rather than the saved value.
   - Data: the generated `exploration/mondstadt.json` and `reputation/mondstadt.json` slices already hold every number; nothing is regenerated.
2. **Chests and camps done.** Waits on the join of a placed chest and camp to the game's own scene records, which the scene group export the other machine is making carries; the [chests](/docs/proposals/genshin/chests) page records the join. Each is then done once opened or cleared, kept with the player's progress.
3. **Oculi and puzzles done.** The Oculi offered and the puzzles solved join the count once [offerings](/docs/proposals/genshin/offering-systems) and the puzzles record them.
4. **Each kind's weight, re-measured.** The table's weight of ten stays in use; the owed `exploration-steps.mkv` re-measures the scale and each kind's weight, with whether a gathered ingredient counts, and gates nothing above.

## Data and measures

- **Read from the game's tables (built for Mondstadt):** `ExploreAreaTotalExpExcelConfigData`'s totals and `WorldAreaExploreEventConfigData`'s events for the four level-one areas.
- **Read from the game's tables (built into the Reputation slice):** `ReputationExploreExcelConfigData`'s thresholds, whose rows name each nation by its city and the progress of its three levels.
- **Measured:** each kind's weight, off a recording of the English PC client's map before and after one statue, one chest, one camp, one puzzle solved, one Oculus offered and one gathered ingredient in Galesong Hill, the step in its percentage times its total. The clip is listed as owed on the [roadmap](/docs/genshin/roadmap).

## Key files

| File                                                                         | Role after the change                                                                 |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/exploration/computeExploredDoingIds.ts` | Which doings are done: chests and camps once recorded, Oculi and puzzles once counted |
| `packages/genshin-world/src/models/exploration/ExplorationKind.ts`           | The kinds the progress counts; the Oculus and puzzle kinds join it                    |

## Sources

- [Reputation](https://genshin-impact.fandom.com/wiki/Reputation), Genshin Impact Wiki: world exploration progressed by puzzles, chests and offerings to the statues, and its share of a nation's Reputation.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: every area's exploration total, the exploration events listed for the first areas alone, and the nations' exploration thresholds.
- [Do World Quests count as exploration in Genshin?](https://cyberpost.co/do-world-quests-count-as-exploration-genshin/), CyberPost: the chests, Oculi, waypoints and challenges a region's exploration counts, and the world quests it does not.
