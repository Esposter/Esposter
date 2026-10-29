# Adventure Rank

The player's rank on the game's table, the World Level that follows it, and the enemies raised by that World Level. Adventure EXP accrues toward rank 60's total even while an ascension quest holds the rank lower, the rank catches up the moment that quest is done, and EXP past rank 60 is paid in Mora (`packages/genshin-world/src/services/adventureRank/gainAdventureExp.ts`). The rank, its EXP and the World Level are pure services in `genshin-world` over the game's tables, which `genshin:assets rank` publishes from the dump to the [hosted game data](../hosted-game-data/design.md). The world reads them as it opens (`readAdventureRankTables`), and each rule takes them as an argument. The session holds the EXP live from the save: a statue's first unlock adds its transport point's Adventure EXP, and the other sources add theirs as their pages land. Until the rank reaches 20, the World Level stays at 0 (`{data-root}/genshin-parity/text/ExcelBinOutput/PlayerLevelLockExcelConfigData.json`, whose World Level 1 row opens at rank 20 with no quest).

## How it works

```mermaid
flowchart TD
  T["The game's tables: ranks, World Level locks, World Level levels"] --> ST["Standing: each World Level opens in order, its rank and quest met"]
  E["Adventure EXP gained"] --> G["gainAdventureExp: accrues up to rank 60's total"]
  G --> ST
  ST --> R["Rank: the EXP's rank, held at the cap the last open World Level sets"]
  ST --> WL["World Level unlocked"]
  ST --> CARD["Profile card"]
  WL --> L["Lowered by one from World Level 3, once a day"]
  L --> W["World Level played at"]
  W --> S["Each camp's enemy stands at its level under that World Level"]
  G -->|"cap 60: EXP past the total"| M["Mora, ten for each point"]
```

## The rank and its holds

A rank is reached at the Adventure EXP of every rank below it: rank 1 at none, rank 2 at 375, rank 25 at 46,400 and rank 60 at 1,880,200 (`computeAdventureExpAtRank`, summing the EXP column of `{data-root}/genshin-parity/text/ExcelBinOutput/PlayerLevelExcelConfigData.json`). The World Levels open in order, each needing the rank the one before it capped and, where the lock table names one, its main quest done. An open World Level's cap is the rank the player may reach (`{data-root}/genshin-parity/text/ExcelBinOutput/PlayerLevelLockExcelConfigData.json`; the game's text at 2955635938 in `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json` gives the same ranks and quests):

| World Level | Opens at | Needs                       | Rank capped at |
| :---------- | :------- | :-------------------------- | :------------- |
| 0           | rank 1   | none                        | 20             |
| 1           | rank 20  | none                        | 25             |
| 2           | rank 25  | Ascension quest 1           | 30             |
| 3           | rank 30  | none                        | 35             |
| 4           | rank 35  | Ascension quest 2           | 40             |
| 5           | rank 40  | none                        | 45             |
| 6           | rank 45  | Ascension quest 3           | 50             |
| 7           | rank 50  | Ascension quest 4           | 55             |
| 8           | rank 55  | none                        | 60             |
| 9           | rank 58  | World Level Ascension quest | 60             |

The rank is the EXP's own, held at the cap of the last World Level open. So a player whose quest is not done stays at 25, 35, 45 or 50, and their EXP keeps accruing toward rank 60's total; once the quest is done the rank rises to whatever the EXP reaches under the new cap (`computeAdventureRankStanding`).

The wiki's Adventure Rank page gives the same opening ranks and quests in its World Level and Ascension table, and the Adventure EXP page's Total column gives the same totals (`{data-root}/cache/genshin-wiki/Adventure_Rank.json` and `{data-root}/cache/genshin-wiki/Adventure_EXP.json`, cited under Sources). Each cap below 60 is the rank the next World Level opens at, except World Level 8's: its cap is 60, not World Level 9's 58, because the wiki's note on World Level Ascension says the rank still rises while that quest is undone. The wiki's Max EXP Attainable table gives, for each hold, rank 60's total less the total at the hold's rank: 1,833,800 for the hold at 25 is 1,880,200 less 46,400, and the holds at 35, 45 and 50 check the same way. Those figures are the EXP a held player can gain above the hold, which is what accrual toward rank 60's total means here.

## Systems a rank opens

The wiki's table of Game System Unlocks, on its Adventure Rank page (`{data-root}/cache/genshin-wiki/Adventure_Rank.json`), gives the rank each system opens at, and its figures are the wiki's: Friends at 2; basic out-of-game rewards at 5; all out-of-game rewards at 7; Blossom of Revelation outcrops at 8; Blossom of Wealth outcrops and daily commissions at 12; Expeditions at 14; Co-Op Mode and Domains of Forgery at 16; Spiral Abyss and the Battle Pass at 20; Domains of Blessing at 22; Adventure Encounters at 24; Reputation at 25; Story Keys at 26; Domains of Mastery at 27; Serenitea Pot and Travelers' Tales at 28; Genius Invokation TCG at 30; Imaginarium Theater and Repertoire of Myriad Melodies at 35; Mystic Offering at 45; and Valiant Chronicles at 55. Three of the Paimon menu's entries are in it: Friends at rank 2, Co-Op Mode at rank 16 and the Battle Pass at rank 20 (`ScreenKindOpenRankMap`). The game's own `{data-root}/genshin-parity/text/ExcelBinOutput/OpenStateConfigData.json` is the primary source, and where its rows name a system's icon they agree with the wiki for Co-Op Mode (id 49, player level 16 with quest 35001, whose icon is id 9 of "SystemOpenUIConfigData.json"), the Battle Pass (id 1301, level 20), Reputation (id 802, level 25) and the Blossom icon (id 53, level 8). Two rows disagree with the wiki, and both are stated rather than reconciled. The Wish icon's row (id 31, icon id 1) gates Wish on quest 2010001 and names no rank, where the wiki's Wish page (`{data-root}/cache/genshin-wiki/Wish.json`) says wishes open after the Knights of Favonius quest, which players reach at about Adventure Rank 5; the quest's own text does not resolve in the cached text maps, so whether it is that quest is not checked. The Genius Invokation icon's row (id 3300) gates on a quest alone, where the wiki gives rank 30. No row names Friends: the dump's rank-2 rows (ids 30, 37 and 2101) gate player level 2 and name no system, so Friends' rank 2 rests on the wiki's table alone. The main quests the Paimon menu's entries open after are in `ScreenKindOpenQuestMap`, beside it: the Wish and the Shop after quest 2010001 (ids 31 and 900 of `OpenStateConfigData.json`), and Co-Op Mode after quest 35001 as well as its rank 16 (id 49). `checkIsSystemOpen` holds an entry to both, the rank held and the quests finished, and an entry not open is not drawn in the Paimon menu, as the [Paimon menu](../paimon-menu/design.md) records; the menu's other entries are open from the start. The table's other systems are not entries of the menu, so each is gated on its own screen.

## EXP past the total and past rank 60

`gainAdventureExp` adds EXP up to rank 60's total, 1,880,200. Where the cap is below 60, EXP past that total is not gained, as the game does while a quest holds the rank. Once the cap is 60, EXP past the total is paid in Mora at ten for each point, returned as `moraPaid` for the wallet to take (`packages/genshin-world/src/services/adventureRank/gainAdventureExp.ts`, the rate in `constants.ts`). The game's text says all Adventure EXP received after the maximum rank is converted to Mora (text 365981086 in `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`) but gives no rate. The rate is the wiki's: its Adventure Rank and Adventure EXP pages both give a 1:10 ratio, ten Mora for each point (`{data-root}/cache/genshin-wiki/Adventure_EXP.json`, cited under Sources).

## Lowering the World Level

From World Level 3 the player may lower it by one, and restore it by one (`toggleWorldLevelLowering`). Either change waits 24 hours after the last, so a lowering cannot be undone at once and a restore cannot be lowered again at once. The World Level played at is the unlocked one less that single step (`computeWorldLevel`). The game's text at 2955635938 in `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json` says the option opens after World Level 3, the threshold this page takes, and gives the 24 hour wait there and at 2310679825. The wiki's Change World Level section gives the same threshold, World Level 3, and the same 24 hour wait (`{data-root}/cache/genshin-wiki/Adventure_Rank.json`).

The info icon beside the World Level on the profile card opens the World Level dialog on a click (`packages/genshin-world/src/components/Menu/WorldLevelDialog/Index.vue`; the two recordings `{data-root}/genshin-parity/captures/yt-P13s7kSmVOE-world-level-dialog-2024.mp4` and `{data-root}/genshin-parity/captures/yt-ZGsragloQxU-world-level-dialog-2025-4k.mp4` show the dialog over the dimmed menu), over the menu dimmed behind it. The dialog shows the game's own help text for the World Level by its text id, its headings and numbers in the colours its tags give them (`splitGameTextColors`), opened at its end where the change is told, and under it the button that lowers the World Level by one, or restores it once lowered. The button opens the Change World Level prompt over the dialog: its Confirm makes the change through `toggleWorldLevel`, and its Cancel closes the prompt back to the dialog. The button is drawn only while the World Level can be changed at all, and waits while the last change's cooldown runs (`computeWorldLevelCooldown`, `WORLD_LEVEL_COOLDOWN_CLOCK_INTERVAL_MS` in `packages/genshin-world/src/services/adventureRank/constants.ts`; the 2024 recording's prompt shows "Can be readjusted after 23 hours 58 minutes" in `{data-root}/genshin-parity/captures/yt-P13s7kSmVOE-world-level-dialog-2024.mp4`), read against the server's clock as the dialog opens, at each minute while it stays open, and as a change is made. While the prompt is open the dialog is inert and the prompt takes Escape, which closes the prompt alone; the cross or Escape then closes the dialog back to the menu, focus returning to the icon; Escape stops at the dialog, short of the input that closes the menu to the world, and the menu behind it is inert while it is open. The help text is a focusable region, so a keyboard scrolls back up from its end. How it is measured against the game is the [screens](../screens/design.md) page's.

## Enemies at a World Level

A camp's enemy stands at its camp level under World Level 0. From World Level 1 it stands at that World Level's monster level, which `WorldLevelExcelConfigData` gives from 26 at World Level 1 to 100 at World Level 9 (`{data-root}/genshin-parity/text/ExcelBinOutput/WorldLevelExcelConfigData.json`), plus its camp level less `SPAWN_LEVEL_REFERENCE` (`computeSpawnLevel`, `packages/genshin-world/src/services/adventureRank/computeSpawnLevel.ts`). A camp at level 1 therefore stands at 9 at World Level 1. The reference is provisional: the wiki's enemy level ranges put each World Level's lowest enemy 14 to 17 under its monster level, which a camp at level 1 or 2 gives, and the enemies' name plates at World Levels 1, 5 and 9 measure it on the References sought list. Changing the World Level clears the camps and spawns them anew, so every enemy stands at the level the new World Level sets (`packages/genshin-world/src/components/World/Enemies/Index.vue`).

## Notes

- Only enemies are raised here. Bosses, ley line outcrops and the World Level's rewards wait on their own pages.
- The World Level adjustment is the save's `worldLevelAdjustment` slice, so the 24 hour wait survives a reload. The EXP is read back through the save sync, so a gain moves the rank, the World Level and the bar at once.
- Katheryne hands out each reached rank's reward once, and the ranks given are kept with the save.

## Decisions

- **The dialog's title is `UI_WORLDLEVEL_TITLE`,** the World Level's own interface title, the word the card's row already shows. The recording's dialog reads "World Level" as its title (`{data-root}/genshin-parity/captures/yt-P13s7kSmVOE-world-level-dialog-2024.mp4`). Several text ids read "World Level" exactly, and nothing on screen tells them apart.
- **The help text opens at its end.** Both public recordings show the dialog at its last lines, the scroll thumb at the track's foot, from the first frame it is open (`{data-root}/genshin-parity/captures/yt-P13s7kSmVOE-world-level-dialog-2024.mp4` and `{data-root}/genshin-parity/captures/yt-ZGsragloQxU-world-level-dialog-2025-4k.mp4`, with `packages/genshin-world/src/components/Menu/WorldLevelDialog/Index.vue`), so the body is laid out from its end as a column in reverse, which a later change of font or language keeps at the end too.
- **The button opens the Change World Level prompt.** The game shows the World Level now and the one the change sets, what the change does and, during a cooldown, the time left, over the dialog, as the [first](https://www.youtube.com/watch?v=P13s7kSmVOE) and [second](https://www.youtube.com/watch?v=ZGsragloQxU) tutorials show. The prompt is a plain dialog (`packages/genshin-world/src/components/Menu/WorldLevelPrompt/Index.vue`, which the recording shows at "Current World Level 8" to "Lowered World Level 7") with labels from the game's text ids, and its rule is `computeWorldLevelAdjustPrompt`. Its layout is provisional: its frame and choices are the quit prompt's, measured from its recording, and its lines are placed by eye until the user's recording `world-level-dialog-2024.mkv` is measured.
- **The dialog stays open after a change,** its button turned to Revert World Level and held through the cooldown. Neither recording shows whether the game closes it.
- **The restoring button's arrow is the lowering's turned over,** provisionally, since no recording shows the restoring button.
- **The card's values stand right-aligned beside the info disc,** as the current client draws them. The menu's reference still is the 1.3 build's, its values redacted, so the move costs its score a little.

## Still open

- [ ] **Adventure EXP from the sources whose pages are not built** — no source yet: the sources' own pages, which add their EXP through `gainWorldAdventureExp`, the composable's gain, which takes the completed main quests along. The chests, the map's rewards, the offerings, the statues and the trounce blossoms call it (`packages/genshin-world/src/composables/useWorldAdventureRank.ts`); a source whose page does not call it gives no EXP.
- [ ] **The lowest enemy at each World Level sits 14 to 17 under its monster level** — partly grounded: the wiki's approximate enemy level minima (`{data-root}/cache/genshin-wiki/Adventure_Rank.json`, its World Level and Ascension table) sit 14 to 17 under the monster levels of `WorldLevelExcelConfigData` at every World Level from 1 to 9, but the wiki calls them approximate, and the name-plate measurement that would make it exact is still on the References sought list. Under `SPAWN_LEVEL_REFERENCE` a camp at level 1 gives 17 under and a camp at level 2 gives 16, so the 14s at World Levels 2, 8 and 9 are not what the camps at levels 1 or 2 give, as the enemies section says.
- [ ] **The game has no tooltip on the World Level** — no source yet: the two recordings show the click and the dialog, not a hover over the info icon.
- [ ] **The prompt's frame and choices are the quit prompt's measured layout** — no source yet: the quit prompt's recording, which is not on disk under the name the page gives; the still `{data-root}/genshin-parity/references/menu-quit-prompt/exit-prompt-current.png` holds no measurement of the frame or buttons.
- [ ] **The dialog stays open after a change** — no source yet: neither recording shows the game after Confirm.
- [ ] **The card's values stand right-aligned beside the info disc, as the current client draws them** — no source yet: the menu's reference is the 1.3 build's, with its values redacted.
- [ ] **The option to lower the World Level opens after World Level 5, as the recording (`{data-root}/genshin-parity/captures/yt-P13s7kSmVOE-world-level-dialog-2024.mp4`) shows** — contradicted by `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`: text 2955635938 says the option opens after World Level 3.
- [ ] **The Adventurer Handbook opens after quest 20505, and the Events after quest 2010001, as estimates** — no source yet: no open-state row names either quest. The Handbook's quest is tied to it by the game's text, and the Events open like the Wish, which the game's tables gate on quest 2010001.

## Key files

| File                                                                                 | Its role                                                                                                                   |
| :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/adventureRank/buildAdventureRankTables.ts`       | builds the rank, lock and World Level records from the dump                                                                |
| `packages/genshin-world/src/services/adventureRank/readAdventureRankTables.ts`       | the rank, lock and World Level tables, read as the world opens                                                             |
| `packages/genshin-world/src/models/adventureRank/AdventureRankTables.ts`             | each rank's EXP, each World Level's lock and its monster level                                                             |
| `packages/genshin-world/src/services/adventureRank/constants.ts`                     | the constants the rules read                                                                                               |
| `packages/genshin-world/src/composables/useWorldAdventureRank.ts`                    | the live EXP, its standing and the gain a source adds                                                                      |
| `packages/genshin-world/src/services/adventureRank/computeAdventureRankStanding.ts`  | the rank, its cap and the World Level from EXP and quests                                                                  |
| `packages/genshin-world/src/services/adventureRank/gainAdventureExp.ts`              | the EXP gain, its cap and the Mora past rank 60                                                                            |
| `packages/genshin-world/src/services/adventureRank/toggleWorldLevelLowering.ts`      | the lowering and its 24 hour cooldown                                                                                      |
| `packages/genshin-world/src/services/adventureRank/computeAdventureRankProgress.ts`  | the EXP's share of the bar toward the next rank                                                                            |
| `packages/genshin-world/src/services/adventureRank/computeSpawnLevel.ts`             | a camp's enemy level at a World Level                                                                                      |
| `packages/genshin-world/src/services/adventureRank/computeWorldLevelCooldown.ts`     | the time left before the World Level can be changed again                                                                  |
| `packages/genshin-world/src/components/Menu/WorldLevelDialog/Index.vue`              | the World Level dialog: the game's help text and the button that opens the prompt                                          |
| `packages/genshin-world/src/components/Menu/Paimon/Index.vue`                        | the profile card's rank, EXP bar, World Level and its info icon                                                            |
| `packages/genshin-world/src/services/enemy/createEnemy.ts`                           | spawns an enemy at its World Level's level                                                                                 |
| `packages/genshin-world/src/components/World/Enemies/Index.vue`                      | spawns the camps, and respawns them when the World Level changes                                                           |
| `packages/genshin-world/src/components/World/Session/Index.vue`                      | the World Level the world plays at, handed down to its enemies                                                             |
| `packages/genshin-world/src/components/Menu/WorldLevelPrompt/Index.vue`              | The Change World Level prompt: the two levels, the question and the tips, Cancel and Confirm                               |
| `packages/genshin-world/src/services/adventureRank/computeWorldLevelAdjustPrompt.ts` | the levels the prompt shows and whether the change lowers                                                                  |
| `packages/genshin-world/src/services/adventureRank/checkIsSystemOpen.ts`             | whether a Paimon entry is open, at the rank held and with the main quests it opens after finished                          |
| `packages/genshin-world/src/services/adventureRank/ScreenKindOpenRankMap.ts`         | the rank each Paimon entry the wiki gates opens at                                                                         |
| `packages/genshin-world/src/services/adventureRank/ScreenKindOpenQuestMap.ts`        | the main quests each Paimon entry opens after; the Handbook's 20505 and the Events' 2010001 are estimates (see Still open) |

## Sources

- [Adventure Rank](https://genshin-impact.fandom.com/wiki/Adventure_Rank), Genshin Impact Wiki, cached at `{data-root}/cache/genshin-wiki/Adventure_Rank.json`: its World Level and Ascension table, its Game System Unlocks table, its Change World Level section, its Max EXP Attainable table and its note on World Level Ascension. The figures are the wiki's. The page names the "World Level tool-tip" on the Profile as where the option to lower appears, and does not say whether a hover opens it.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `PlayerLevelExcelConfigData`, `PlayerLevelLockExcelConfigData` and `WorldLevelExcelConfigData`, the tables the rank is read from. The dump at its revision lacked the three; they were taken from the same repository's files, which matched the dump's own tables byte for byte.
- World Level tutorials recorded on the English PC client, [2024](https://www.youtube.com/watch?v=P13s7kSmVOE) and [2025](https://www.youtube.com/watch?v=ZGsragloQxU): the dialog the info icon opens on a click, open at the end of its help text, and the Change World Level prompt its button opens.
- The caps in `{data-root}/genshin-parity/text/ExcelBinOutput/PlayerLevelLockExcelConfigData.json`, grounding "Rank follows Adventure EXP under the World Level cap".
- The game's text at 2955635938 in `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json` gives the same ranks and quests, grounding "A World Level opens after the rank and quest it needs".
- The game's text at 2955635938 and 2310679825 in `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`, grounding "The World Level can be lowered from World Level 3", "A lowered World Level can be restored" and "Each World Level change is followed by a 24 hour wait".
- The recording `{data-root}/genshin-parity/captures/yt-P13s7kSmVOE-world-level-dialog-2024.mp4`, grounding scenario 'Dialog opens at the end of the help text'.
- [Adventure EXP](https://genshin-impact.fandom.com/wiki/Adventure_EXP), Genshin Impact Wiki, cached at `{data-root}/cache/genshin-wiki/Adventure_EXP.json`: its Adventure EXP Table, whose Total column gives the totals in the rank and holds section, and its note that EXP past rank 60 converts to Mora at a 1:10 ratio, the rate the EXP past rank 60 section cites. The figures are the wiki's.
- [Wish](https://genshin-impact.fandom.com/wiki/Wish), Genshin Impact Wiki, cached at `{data-root}/cache/genshin-wiki/Wish.json`: wishes open after the Knights of Favonius quest, which players reach at about Adventure Rank 5, cited under the systems the rank opens.
