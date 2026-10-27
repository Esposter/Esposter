# Gadgets

The game's tools are the widget config's entries: the Wind Catcher, the Treasure Compasses, the gather point finders and the devices, each a kind with its own cooldowns (`~/Esposter/genshin-parity/text/BinOutput/Widget/ConfigWidget.json`, and the names `Wind Catcher` and `Treasure Compass` in `~/Esposter/genshin-parity/text/TextMap/TextMap_MediumEN.json`). This page is the first part of the [gadgets](../../../changes/genshin-gadgets/design.md) proposal, its data and its cooldowns. `Z` is already bound to the quick-use gadget ([controls](../controls/design.md)) (`packages/genshin-engine/src/input/InputActionBindingMap.ts`), but nothing is equipped to it and nothing is used yet: the bag's items do not yet include the widget material type, so a gadget has no item to equip.

## How it works

```mermaid
flowchart TD
  CFG["The widget config, built into the gadgets record"] --> KIND{"Its widget type is one this page builds?"}
  KIND -->|"no"| LEFT["Left out of the slice until its own page"]
  KIND -->|"yes"| ROW["A row: kind, cooldowns, cooldown group and whether it is equipable"]
  ROW --> READY{"Its cooldown group ready at this moment?"}
  READY -->|"no"| REFUSE["Refused until the group's moment"]
  READY -->|"yes"| USE["Used"]
  USE --> WORKS{"Did the use work?"}
  WORKS -->|"yes"| COOL["The group's cooldown starts"]
  WORKS -->|"no"| FAIL["The group's cooldown on a failed use starts"]
```

## The kinds

The config's widget type is the game's own kind, and a gadget is built as one of four kinds (`packages/genshin-world/src/models/gadget/GadgetKind.ts`, `scripts/src/services/genshinAssets/gadgets/ConfigWidgetTypeGadgetKindMap.ts`). Each kind is one widget type or a few that act alike.

| Kind              | Widget types                                                    | What the config spawns                                                                                                                                                                                   |
| :---------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collector         | `ConfigWidgetClientCollector`                                   | a wind field that absorbs wind seeds (`~/Esposter/genshin-parity/text/ExcelBinOutput/GadgetExcelConfigData.json`, ids 70500005 and 70500012)                                                             |
| Detector          | `ConfigWidgetClientDetector`, `ConfigWidgetTreasureMapDetector` | the treasure boxes of Mondstadt, Liyue and Dragonspine, and a Seelie crystal (`~/Esposter/genshin-parity/text/ExcelBinOutput/GadgetExcelConfigData.json`, ids 70500008, 70500009, 70500031 and 70500013) |
| GatherPointFinder | `ConfigWidgetOneoffGatherPointDetector`                         | the success and failure crystals of its gather point types (`~/Esposter/genshin-parity/text/ExcelBinOutput/GadgetExcelConfigData.json`, ids 70290533 and 70290534)                                       |
| Device            | `ConfigWidgetGadgetBuilder`, `ConfigWidgetMiracleRing`          | a Seelie, a balloon widget and a miracle ring (`~/Esposter/genshin-parity/text/ExcelBinOutput/GadgetExcelConfigData.json`, ids 70500014, 70500022 and 70500020)                                          |

The rest of the config's widgets, the cameras, the avatar attachments, the water sprite, the ability groups and the toys, are not among the four kinds and are left out of the slice until a page names them (`scripts/src/services/genshinAssets/gadgets/toGadgetRows.ts`). The camera widgets wait on the [free camera](../free-camera/design.md) page.

## Cooldowns

- **Each cooldown is a whole number of seconds from the config.** A gadget's cooldown is its `coolDown`, and its cooldown on a failed use its `coolDownOnFail` (`~/Esposter/genshin-parity/text/BinOutput/Widget/ConfigWidget.json`, `scripts/src/services/genshinAssets/gadgets/toGadgetRows.ts`). A field the config omits reads as zero, so a collector has no cooldown on a failed use (`~/Esposter/genshin-parity/text/BinOutput/Widget/ConfigWidget.json`, the collector `220004`, which names a `coolDown` and no `coolDownOnFail`).
- **A group is shared.** A gadget with a cooldown group shares its cooldown with every gadget of that group, and a gadget with none shares with no other, so it is kept under its own id (`packages/genshin-world/src/services/gadget/getCooldownGroup.ts`). The game's groups are small numbers and the ids are not, so the two never meet (`~/Esposter/genshin-parity/text/BinOutput/Widget/ConfigWidget.json`, groups from 1 to 18 against widget ids from 101516 up).
- **A cooldown is read, not ticked.** The group is kept as the moment it is ready again (`packages/genshin-world/src/models/gadget/CooldownGroupReadyAtMap.ts`), and a gadget is ready once `now` has reached it (`packages/genshin-world/src/services/gadget/checkIsGadgetReady.ts`). A pause changes nothing in it (`packages/genshin-world/src/services/gadget/checkIsGadgetReady.ts`), so a cooldown started before a menu runs on while the menu is open, as the game's do.

## Key files

| File                                                                  | Role                                                               |
| :-------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `packages/genshin-world/src/models/gadget/GadgetKind.ts`              | The four kinds the widget types are built as                       |
| `packages/genshin-world/src/models/gadget/GadgetRow.ts`               | A gadget's row, checked against its schema as the slice is read    |
| `packages/genshin-world/src/models/gadget/CooldownGroupReadyAtMap.ts` | The moment each cooldown group is ready again                      |
| `packages/genshin-world/src/services/gadget/checkIsGadgetReady.ts`    | Whether a gadget's group is ready at a moment                      |
| `packages/genshin-world/src/services/gadget/startGadgetCooldown.ts`   | Starts a group's cooldown after a use that works or one that fails |
| `packages/genshin-world/src/services/gadget/getCooldownGroup.ts`      | A gadget's group, its own id when the config gives none            |
| `packages/genshin-world/src/services/gadget/readGadgetRows.ts`        | Reads the gadgets by their key from the hosted game data           |
| `scripts/src/services/genshinAssets/gadgets/toGadgetRows.ts`          | Each config widget of a built type as a row                        |
| `scripts/src/services/genshinAssets/gadgets/buildGadgetRows.ts`       | Builds the slice from the widget config, for publishing            |
| `scripts/src/services/genshinAssets/commands/gadgetsCommand.ts`       | `genshin:assets gadgets`                                           |

## Sources

- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `~/Esposter/genshin-parity/text/BinOutput/Widget/ConfigWidget.json`, the widget config with each widget's type, cooldowns and cooldown group, and `~/Esposter/genshin-parity/text/ExcelBinOutput/GadgetExcelConfigData.json`, which names each spawned gadget. Both are read from the dump outside the repository and nothing from them is committed.
- [Gadget](https://genshin-impact.fandom.com/wiki/Gadget), Genshin Impact Wiki: the gadgets as the bag's tab, and the cooldowns that run while the world is paused.

## Open

- [ ] **A cooldown counts on through a paused world, as the game's do** — no source yet: the wiki's Gadget page, which the Sources name for the paused cooldowns, is not in `~/Esposter/cache/genshin-wiki/`.
- [ ] **The success and failure crystals belong to each gather point type** — no source yet: the two grass crystals are named in `~/Esposter/genshin-parity/text/ExcelBinOutput/GadgetExcelConfigData.json`, but no table checked ties them to a gather point type of the one-off detector.
