# Text

## Queue

- [ ] `[cpu]` {text-language-maps} needs game-install, game-exports — **Text: every language's text map, decoded from the install.** `pnpm -C scripts genshin:text decode`. Reads the installed game's blocks, each hotfixed copy under `GenshinImpact_Data/Persistent` over its StreamingAssets one, and `{data-root}/genshin-parity/extracted/maps/index.tsv`. Writes `{data-root}/genshin-parity/text/TextMap/TextMap{CODE}_{n}.json` and `TextMap_Medium{CODE}_{n}.json` for the fifteen languages, in place of the community dump's maps, outside the repository. Bar: all 15,360 chunks exported and each decoded to its last byte with no U+FFFD; then `pnpm -C scripts genshin:text write` runs green, its diff over `packages/genshin-text/src/generated` empty or only lines 7.1 reworded, each read against the dump's map of the same revision before it is kept; a chunk left over or a key missing is a miss. — waits on a published decoder for the current patch, as [game text](../../game-text/design.md) records.

## Waiting

## Sources

- The community dump's map of the same revision, which the generated text is compared with before a reworded line is kept, grounds the requirement "The generated game text" and its scenario "The text write runs green with an empty or reworded diff".
- `scripts/src/services/genshinText/commands/decodeCommand.ts` (the `decode` verb) and `scripts/package.json:78` (`genshin:text`), and `scripts/src/services/genshinText/commands/writeCommand.ts` (the `write` verb): the command lines the item names.
- `scripts/src/services/genshinText/constants.ts:10` (`GAME_TEXT_DIRECTORY`, `PARITY_DIRECTORY/text`), `:11` (`TEXT_MAP_DIRECTORY_NAME = "TextMap"`), `:56-59` (`TextMapChunkRangeMap`: `TextMap` at 512 to 1023 and `TextMap_Medium` at 0 to 511, so 1,024 chunks a language), and `:85` (`GameLanguageCodeMap`, fifteen entries): the output folder, the file names and the 15,360-chunk bar (15 times 1,024).
- `scripts/src/services/genshinText/decodeGameText.ts:24` (the decode writes every language's map from the installed game's chunks, in place of the community dump's maps) and `scripts/src/services/genshinText/readTextMap.ts:11` (the `TextMap(_Medium)?{CODE}(_n)?.json` names the reader expects).
- `scripts/src/services/genshinAssets/blocks/linkInstalledBlocks.ts:13-14` (the hotfix under `Persistent` where the game downloaded one, else the StreamingAssets copy): the install read the item names.
- `scripts/src/services/genshinAssets/shared/constants.ts:37` (`ASSET_INDEX_PATH`, `{EXTRACTED}/maps/index.tsv`): the index the item names, present at `{data-root}/genshin-parity/extracted/maps/index.tsv` on the Mac.

## Open

- [ ] **Each chunk is decoded to its last byte with no U+FFFD** — no source yet: no `FFFD` or replacement-character check exists under `scripts/src/services/genshinText/` or `scripts/src/services/genshinAssets/`, and no test there names it. What would settle it is the decode's own check, or a test that decodes a chunk and asserts it.
- [ ] **The write's diff is empty or "only lines 7.1 reworded"** — no source yet: no source read defines the reworded lines "7.1", so the bar's exception cannot be checked against one.
