# Genius Invokation TCG

The card game is a rules engine of its own in `genshin-world`: a duel is a plain state over two sides, advanced by the actions a duel answers, and it shares only the elements with the world. This section is what is built of [Genius Invokation TCG](../../../changes/genshin-genius-invokation/design.md).

| Page                               | What it holds                                                                                                                   |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| [Rules](rules/design.md)           | The engine: the standard rule, dice and rerolls, rounds and turns, energy, reactions, damage, defeats and the phases' hooks     |
| [Decks](decks/design.md)           | The characters, skills and action cards each built deck plays, their card modules, the opponent decks and the words they show   |
| [Duel board](duel-board/design.md) | How a talk opens a duel, the board's choices, the session host, the opponent's policy and the frame the board is judged against |

## The data is the dump's

`genshin:assets gcg` publishes the standard rule and one record per opponent deck (`gcg/standardRule` and `gcg/deck<id>`) from the dump's `GCGDeckExcelConfigData`, `GCGCharExcelConfigData`, `GCGSkillExcelConfigData`, `GCGCardExcelConfigData` and `GCGCostExcelConfigData`, and `gcg/games` from the game table (`packages/genshin-world/src/models/data/GameDataset.ts`, `Gcg = "gcg"`; `scripts/src/services/genshinAssets/gcg/buildGcgStandardRule.ts`; `packages/genshin-world/src/generated/gameDataLock.json`; the tables are `~/Esposter/genshin-parity/text/ExcelBinOutput/GCGDeckExcelConfigData.json` and its siblings). Each row's obfuscated keys are unread, and whether the plain fields carry everything a duel reads is open (see Open); each cost type must be named by the cost table or the build refuses (`scripts/src/services/genshinAssets/gcg/toCosts.ts`, which throws on a cost type the table does not name). The [rules](rules/design.md) page covers what the standard rule holds, and the [decks](decks/design.md) page what each deck record holds.

## Open

- [ ] **The plain fields carry everything a duel reads** — no source yet: the duel's reads of the built records, across the files under `packages/genshin-world/src/models/gcg/`, were not traced to their plain keys.
