# Reputation

Each nation keeps a Reputation, raised by the work done for its people. Mondstadt's is built as data and rules: its levels from the game's table, the reward each level, request and bounty pays, the unlocks a level opens, and the weekly limit on claiming them. Nothing yet stands in the world to claim them from. The keeper, the bounties' trails and the exploration that raises the EXP wait on their own pages, so the rules here have no caller yet.

## How it works

```mermaid
flowchart TD
  CLAIM["A request or bounty claimed"] --> WEEK{"Under the week's limit of its kind, across nations?"}
  WEEK -->|"no"| SHUT["Not claimable until the weekly reset"]
  WEEK -->|"yes"| PAY["The nation's Reputation EXP and items paid"]
  PAY --> CARRY{"EXP past the level's requirement?"}
  CARRY -->|"yes"| UP["Level up: the new level's reward and unlocks"]
  CARRY -->|"no"| HOLD["Held at the level"]
  UP --> LAST{"The nation's last level?"}
  LAST -->|"yes"| NONE["No more EXP earned there"]
```

## Data

- **The levels.** `ReputationLevelExcelConfigData`'s rows for the nation, each with `nextLevelExp`, the EXP to leave that level, unlike Friendship's totals. The last level's is zero, and it earns no more EXP. Level 2 opens the mining outcrop search and level 4 the merchant discounts, the function ids the table names.
- **Each reward.** A level's `rewardId`, and a request's or bounty's, read from the reward table. The nation's Reputation EXP is the item `ReputationCityExcelConfigData` names as its `virtualItemId`, so the reward is split into the EXP that item's count gives and the items it also pays. A request pays its EXP and Mora, a bounty its EXP and Mora, more of each at the harder difficulties.
- **Requests, Reputation quests and bounties.** The requests of the groups the levels name, each with its weight; the Reputation quests of `ReputationQuestExcelConfigData`, each bound to the quest its `parentQuestId` names, which pays its reward once that quest finishes; and the nation's `HuntingRefreshExcelConfigData` bounties with the region each is hunted in.
- **The exploration thresholds.** The exploration table's rows for the nation, each at a percentage of its exploration and paying a reward split the same way. The thresholds reached between two percentages are the ones the progress passes, so one already held pays nothing again.
- **The tables the dump lacks.** The dump holds the exploration table but not the level, city, function, request, quest or hunting tables. Those are fetched from the AnimeGameData repository into the dump's `ExcelBinOutput` and never committed.

## Notes

- **The weekly limit is three of each kind, across nations.** Bounties and requests are counted apart, and each kind's claims are counted from the weekly reset, Monday at 04:00 on the server's clock, a claim at the reset counting toward the new week. The count is the weekly helper the bosses also use, in `services/weekly`. A request past the limit pays nothing until the reset, and its quest still finishes, as the quest system owns it.
- **A discount is 10% off, rounded down to a multiple of five Mora.** The rounding is the player's favour, the five beneath the discounted price. The wiki's Reputation page does not confirm it, so the reading follows the proposal's own wording and the [shops](../../../changes/genshin-shops/design.md) proposal's.
- **The discount's shops are the shop types the grocery names.** Which shops a discount covers is named in the function's text. The grocery's shop type 1004 is the one the discount names, and only its goods are written with the level (`toShopGoodSlice`). The food shop's goods are not published, so it takes none yet. The [shops](../shops/design.md) page applies it.
- **The reward page.** The `ReputationScreen` lists each level of the nation as the public clip's reward page does: its level on a pentagon badge under the game's short level word (`LevelShort`, "Lv." in English, the one abbreviated in every language), its items in the interface's `ItemTile`, coloured by rarity with their count beneath, the feature it unlocks in the game's words behind an info mark (`ReputationFunctionGameTextKeyMap`, by the level's function id), and the tick or the not achieved block at its end. Each slot reads its item's name and count to assistive technology, the items' rarity and names coming from the materials catalogue, which carries every item a level pays. The slots draw no art, since the game's item icons cannot ship. The list scrolls, since its eight rows are taller than the panel, and the page opens on the level it is given. The picked level's name and requirement, and the words the tick is read aloud with, stay empty in the world: which item the game names for a level of two is unknown, its requirement is worded per item, and no game text names the mark.
- **Not built.** The keeper placed in region data and the screen opened from her talk, the camp requests run as world quests, a bounty's trail and its spawned target, the discount at the food shop, the reward page's sources tabs, and Natlan's tribes and supply notices. The [proposal](../../../changes/genshin-reputation/design.md) keeps them.
- **The reward page's list is measured off its frame; its head and left column are provisional.** The rows, the badge, the slots, the unlock lines and the row's end are read off `references/reputation-screen/18s.png`, the 18-second frame of the public reward-guide clip (`captures/yt-1SqmdXbIhLs-reputation-guide.mp4`), at 1080 high: rows 126 apart from 27 down and 32 in, 1145 wide and 121 tall. The frame shows only the list, so the title, the way back and the picked level's reward stand as estimates. Against it the list scores within the parity loop's bar: what is left is the item icons' art and the face, Signika for the game's HYWenHei.

## Key files

| File                                                                                    | Role                                                                                   |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| `packages/genshin-interface/src/components/ReputationScreen/Index.vue`                  | The reward page: each level's mark, item slots and unlock line                         |
| `packages/genshin-world/src/components/Reputation/Screen/Index.vue`                     | The nation's reward page wired to its levels and the Reputation's level                |
| `packages/genshin-world/src/services/reputation/ReputationFunctionGameTextKeyMap.ts`    | Each unlock function's line in the game's words, by its id                             |
| `packages/genshin-world/src/services/reputation/addReputationExp.ts`                    | The EXP carried up through each level's requirement, held at the last level            |
| `packages/genshin-world/src/services/reputation/computeReputationDiscountedPrice.ts`    | A price's 10% off, rounded down to a multiple of five Mora                             |
| `packages/genshin-world/src/services/reputation/checkIsReputationWeeklyLimitReached.ts` | Whether a kind's claims this week have reached the limit across nations                |
| `packages/genshin-world/src/services/reputation/addWeeklyReputationClaim.ts`            | The one claim a kind makes: its claims this week with one more, refused past the limit |
| `packages/genshin-world/src/services/reputation/computeReputationExploresReached.ts`    | The exploration thresholds a progress passes between two percentages                   |
| `packages/genshin-world/src/services/reputation/readMondstadtReputation.ts`             | The slice, fetched by its key and checked against its shape                            |
| `packages/genshin-world/src/services/reputation/constants.ts`                           | The discount, its rounding and the weekly claim limit                                  |
| `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`                       | The claims the weekly limit counts, across nations                                     |
| `packages/genshin-world/src/services/time/computeLastWeeklyReset.ts`                    | The weekly reset on the server's clock the limit counts from                           |
| `packages/genshin-world/src/models/reputation/ReputationCity.ts`                        | A nation's slice, with the schemas of its levels, quests, requests and bounties        |
| `scripts/src/services/genshinAssets/reputation/buildMondstadtReputation.ts`             | Builds the slice from the dump's tables, for publishing                                |
| `scripts/src/services/genshinAssets/reputation/toReputationReward.ts`                   | Splits a reward into the Reputation EXP and the items it also pays                     |

## Sources

- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `ReputationLevelExcelConfigData`, `ReputationCityExcelConfigData`, the function table, `ReputationRequestExcelConfigData`, `HuntingRefreshExcelConfigData` and `RewardExcelConfigData`, the tables the slice is written from.
- [Reputation](https://genshin-impact.fandom.com/wiki/Reputation), Genshin Impact Wiki: the nations' Reputation and its sources. Only the proposal's own wording stands for the discount's rounding.
