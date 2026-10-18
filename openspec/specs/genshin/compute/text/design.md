# Text

## Queue

Nothing here.

## Waiting

- [ ] `[cpu]` {text-language-maps} needs game-install, game-exports — **Text: every language's text map, decoded from the install.** `pnpm -C scripts genshin:text decode`. Reads the installed game's blocks, each hotfixed copy under `GenshinImpact_Data/Persistent` over its StreamingAssets one, and `~/Esposter/genshin-parity/extracted/maps/index.tsv`. Writes `~/Esposter/genshin-parity/text/TextMap/TextMap{CODE}_{n}.json` and `TextMap_Medium{CODE}_{n}.json` for the fifteen languages, in place of the community dump's maps, outside the repository. Bar: all 15,360 chunks exported and each decoded to its last byte with no U+FFFD; then `pnpm -C scripts genshin:text write` runs green, its diff over `packages/genshin-text/src/generated` empty or only lines 7.1 reworded, each read against the dump's map of the same revision before it is kept; a chunk left over or a key missing is a miss. — waits on a published decoder for the current patch, as [game text](../../game-text/design.md) records.
