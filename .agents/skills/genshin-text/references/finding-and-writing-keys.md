# Finding and writing keys

Read when a game word's key is found in the text map, or a key is added to `GameTextKey` and written.

The one-line rule is in `SKILL.md`; this page is its reasoning.

## Words the account kit shows

What the account kit shows as the player signs in is in the kit's own strings, which `write` reads beside the text map by the kit's key.

## Keys in the enum and attributes

`write` reads the enum through the package's `dist`, so `pnpm -C packages/genshin-text exec tsdown --no-clean` runs first, or the new key is silently left out of every chunk. An attribute's name is filed under its own `FIGHT_PROP_*` id, the value `genshin-world`'s `Attribute` already takes, so `find` lists it first among the matches of its English. A manual-map label whose hash the English text map lacks (the combine types' `COMBINE_TYPE_NAME6` and `COMBINE_TYPE_NAME12`) is missing from `find`, and its English is read from `TextMap/TextMap_MediumEN.json` under the manual map's hash.

A raw-hash value is the id `find` prints, never a hash copied from a table: the table may be of an older build than the text map, and a hash from it reads empty (thirteen keys were filed so, 512 below the text map's keys, until the fetch compared content). The one table whose hashes do not match the text map's keys on a fresh dump is the Dialog table, which `readTalkTables` resolves (`getDialogTextHash`); a key in the enum never rests on that.
