# Exploration progress

In the game the map shows how much of each area a player has explored, as a percentage. This page is what is built of [exploration progress](../../../changes/genshin-exploration-progress/design.md): the game's table gives Mondstadt's level-one areas their totals and the events each counts (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ExploreAreaTotalExpExcelConfigData.json`, `~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/WorldAreaExploreEventConfigData.json`), and the map's label for an area shows its percentage once a statue in it is unlocked (`~/Esposter.noindex/genshin-parity/captures/yt-kgW2IgWKukg-exploration-steps.mp4`, at 4.6 s). Windrise is a town of Galesong Hill (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/WorldAreaConfigData.json`, row 1201), so Galesong Hill is the first area counted (`scripts/src/services/genshinAssets/exploration/ExploreAreaCatalogueIdMap.ts`). Only its statue's waypoint is done so far, since chests and camps have no record in the world yet (`packages/genshin-world/src/services/exploration/computeExploredDoingIds.ts`), and the percentage's scale waits on a recording of more than one step.

## How it works

```mermaid
flowchart TD
  T["The game's table: each area's total and its events"] --> S["Mondstadt's slice, fetched by its key as the world opens"]
  S --> K["Each doing an area counts: its kind and weight"]
  U["Unlocked Statues of The Seven"] -->|"a statue done: its area's waypoint"| D["The doings done"]
  K --> D
  D --> C["Percentage: done weight over the total, rounded down, at most 100"]
  C --> L["The area's label on the map"]
```

- **Read from the table, Mondstadt first.** `pnpm -C scripts genshin:assets exploration` builds the slice from the dump's `ExploreAreaTotalExpExcelConfigData` and `WorldAreaExploreEventConfigData` and publishes it to the hosted game data as `exploration/mondstadt` (`scripts/src/services/genshinAssets/exploration/buildMondstadtExplorationAreas.ts`). The slice holds, for each of the level-one areas Mondstadt holds (Starfell Valley, Galesong Hill, Windwail Highland and Brightcrown Mountains), its total, its reputation ratio and its counted doings (the totals 273, 146, 218 and 211 of area IDs 1 to 4 in `~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ExploreAreaTotalExpExcelConfigData.json`, each named in `WorldAreaConfigData.json` as rows 1100, 1200, 1300 and 1400). The world fetches it by its key as the session starts (`readMondstadtExplorationAreas`, `packages/genshin-world/src/services/exploration/readMondstadtExplorationAreas.ts`), and checks it against its schema as it arrives.
- **Three kinds are counted.** A camp (`EXPLORE_EVENT_CLEAR_GROUP_MONSTER`), a chest (`EXPLORE_EVENT_OPEN_CHEST`) and a waypoint (`EXPLORE_EVENT_UNLOCK_POINT`) (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/WorldAreaExploreEventConfigData.json`, `scripts/src/services/genshinAssets/exploration/ExploreEventKindMap.ts`). The table also lists gathered items (`EXPLORE_EVENT_ITEM_ADD`), which are the ingredients picked up from plants and ores, and a force entered ("EXPLORE_EVENT_ENTER_FORCE") (EventIDs 21 to 38 and 39 in the same file). Neither is one of the kinds the progress is read from, so both are left out. Whether a picked ingredient counts is one of the questions the recording settles.
- **A statue done is its area's waypoint done.** `computeExploredDoingIds` names an area's waypoint done once a Statue of The Seven in that area is unlocked. Each Mondstadt area holds one waypoint event, which is its statue's, so a statue completes exactly one doing (one `EXPLORE_EVENT_UNLOCK_POINT` each, EventIDs 1, 40, 77 and 78 in `~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/WorldAreaExploreEventConfigData.json`). Chests and camps are never done yet, since the world keeps no record of opening or clearing them (`packages/genshin-world/src/services/exploration/computeExploredDoingIds.ts`).
- **The label shows the game's line.** Each area's label is drawn once a landmark in it is unlocked, and under its name it shows "Exploration Progress: 99%", the game's `UI_EXPLORE_COUNT` with the percentage filled in (`packages/genshin-text/src/generated/text/English.json`), and no count: the English map over Galesong Hill (`~/Esposter.noindex/genshin-parity/captures/yt-kgW2IgWKukg-exploration-steps.mp4`, at 4.6 s) shows only the percentage. At 100 the line is `UI_EXPLORE_COUNT_MAX`, whose percentage the game colours gold through its own colour tag (`packages/genshin-text/src/generated/text/English.json`, and the capture at 10.5 s), drawn as a run of its own ([game text](../game-text/design.md)). `computeExplorationProgress` takes the done weight as a share of the area's total, rounds it down and holds it at 100, so a weight past the total never reads past the game's gold 100% (`packages/genshin-world/src/services/exploration/computeExplorationProgress.ts`).
- **Counted once.** The done doings are a set of ids, so a doing adds its weight a single time however it is reached (`packages/genshin-world/src/services/exploration/computeDoneWeight.ts`).
- **The scale is provisional.** The table gives every counted doing a weight of ten, and Galesong Hill's counted doings at ten each sum to nearly twice its total. So the table's weights cannot be shares of the total as read. The one recording of the map's steps shows a single chest taking Galesong Hill from 99% to 100% (`~/Esposter.noindex/genshin-parity/captures/yt-kgW2IgWKukg-exploration-steps.mp4`, the label at 99% from about 3.5 to 5 s and at 100% from about 10.5 s), which nearly any chest's weight fits, so the percentage stays provisional until a recording shows more steps.

## Key files

| File                                                                               | Role                                                                                      |
| :--------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/exploration/computeExplorationProgress.ts`    | An area's percentage, the done weight over its total, rounded down and at most 100        |
| `packages/genshin-world/src/services/exploration/computeExploredDoingIds.ts`       | The doings an area's unlocked statue has done                                             |
| `packages/genshin-world/src/services/exploration/readMondstadtExplorationAreas.ts` | The Mondstadt slice, fetched from the hosted game data and parsed                         |
| `packages/genshin-world/src/composables/useExplorationAreas.ts`                    | Reads the slice as the world opens, logging a slice that fails                            |
| `packages/genshin-world/src/components/Map/Overlay/Index.vue`                      | Shows each filled area's progress line under its name, and lists them for a screen reader |
| `packages/genshin-world/src/models/exploration/ExplorationArea.ts`                 | An area's total, its reputation ratio and the doings its progress counts                  |
| `scripts/src/services/genshinAssets/exploration/buildMondstadtExplorationAreas.ts` | Builds the Mondstadt slice from the dump, for publishing                                  |
| `scripts/src/services/genshinAssets/exploration/ExploreEventKindMap.ts`            | The event types the progress counts, each as its kind                                     |
| `scripts/src/services/genshinAssets/exploration/ExploreAreaCatalogueIdMap.ts`      | Each level-one area the world holds, by its catalogue area                                |

## Notes

- **Windrise's area is Galesong Hill.** The game counts exploration per level-one area. Windrise is a level-two area of Galesong Hill (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/WorldAreaConfigData.json`, row 1201, its `areaID1` 2 and `areaID2` 201), and the statue that stands at Windrise is Galesong Hill's, so unlocking it completes Galesong Hill's waypoint.
- **Not yet.** Chests, camps, Oculi and puzzles are not recorded as done, so an area's count holds only its statue until they are. Mondstadt's Reputation is kept in the [save](../save-data/design.md), but its thresholds are not paid yet: the [proposal](../../../changes/genshin-exploration-progress/design.md) records paying each one as the count reaches it as its next step.
- **The label's measures are the game's, its face is not.** The name's and the line's sizes and the line's place below the name are read off the English map over Galesong Hill at 4.6 seconds (`~/Esposter.noindex/genshin-parity/captures/yt-kgW2IgWKukg-exploration-steps.mp4`): capitals 28.8 and 16.0 pixels high, their middles 45.9 apart, white with no outline. Signika stands in for the game's face, spaced out toward each line's width, and its strokes are the difference left: the label scores 7.76% against the still over its glyphs' silhouettes (`map-overlay-galesong`), against a bar of 2% ([map](../map/design.md)).

## Sources

- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the explore total and event tables, read as the references folder's copies and never committed.

## Open

- [ ] **The label appears once a statue in its area is unlocked, as the game does** — no source yet: the capture shows the label but not the unlock, and the wiki's Exploration page is not in the genshin-wiki cache.
- [ ] **The Windrise statue is Galesong Hill's waypoint, the one doing its statue completes** — no source yet: event 40 of the table names point 4, and no row read ties that point to the statue at Windrise.
- [ ] **Galesong Hill's counted doings at ten each sum to nearly twice its total** — contradicted by `~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/WorldAreaExploreEventConfigData.json`: 19 counted doings sum to 190 against a total of 146.
- [ ] **A single chest took Galesong Hill from 99% to 100%** — no source yet: the capture shows the step near 10 s, but no frame read shows the chest that caused it.
- [ ] **The label's capitals are 28.8 and 16.0 pixels high, their middles 45.9 apart** — no source yet: the frame at 4.6 s shows the label, but no measurement of it is recorded in a file.
- [ ] **The label scores 7.76% against its still, against a bar of 2%** — no source yet: the still `~/Esposter.noindex/genshin-parity/comparisons/map-overlay-galesong.png` exists, but no file read records the score.
- [ ] **The label reads "Exploration Progress: 99%", the game's `UI_EXPLORE_COUNT` with the percentage filled in** — no source yet: `~/Esposter.noindex/genshin-parity/text/TextMapEN.json` holds no line reading "Exploration Progress" with a percentage, so the key's words are not found there.
- **`computeExplorationProgress` holds a done weight's share at most 100** — `packages/genshin-world/src/services/exploration/computeExplorationProgress.ts`.
- [ ] **The English map reads the fully explored area in gold 100%** — no source yet: the one recording of the map's steps that the code comment cites (a single chest taking it from 99% to 100%), not yet re-read for the gold.
