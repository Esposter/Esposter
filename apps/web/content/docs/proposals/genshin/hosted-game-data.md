---
title: Hosted game data
description: Proposal, second phase — the other thirty-five generated datasets genshin-world still bundles move to the hosted game data, and the synchronous imports, tests and fixtures that still read them change with them, so the package ships no generated JSON at all.
model: claude-haiku-5-5
---

# Hosted game data: the remaining datasets

The Profile tab and the book reader already fetch their records from the published game data, as [hosted game data](/docs/genshin/hosted-game-data) sets out. This proposal is what is left of the same move: the thirty-five folders of generated JSON that the package still imports, the three reads that still happen synchronously at import time, and the suites and fixtures that read them. Nothing here changes the mechanism; it extends the one that shipped.

## Decisions

- **Each dataset is one builder that returns records.** A step stops writing files and hands its records to the publisher, scoped to the dataset it replaces. Code-named records take a key of their own (`stats/weapons`, `gcg/standardRule`). Gcg decks take `gcg/deck<id>`, one key each.
- **Entity collections the screens open one at a time become indexes.** Talent multipliers and talent labels follow the profile's shape, one index each, so the talents screen fetches one record and not the collection.
- **Synchronous reads become awaited reads.** The Bennett kit reads a weapon type it has no access to today, the gcg game table is imported at module load, and the Windrise wildlife layer is a static import. Each becomes a value loaded at mount and handed down, so no screen waits on a module it did not need.
- **Scripts read what the publisher wrote, from the account.** A step that reads another step's output reads it through the lock and the dev account, never through `genshin-world`'s build, which a step running under `tsx` may load stale.
- **Tests read a local mirror.** Suites and the parity page read the records through a content-addressed cache that a missing record fills from the dev account, so no test reads a copy of the game data.
- **The package takes a major version.** Its `gameDataBaseUrl` is required, and a host that is not on the allowed origins must serve the objects its lock names.

## Datasets

The dataset list is what the builders publish, in the order each one depends on another:

| Group                                                       | Datasets                                                                                                                                                   | Read by                                                                      |
| :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| Stats and talents                                           | `stats`, `talentMultipliers`, `talentLabels`                                                                                                               | `readStatTables` at World mount, the talent readers in the combat composable |
| Text                                                        | `nameText`, `achievementText`, `archiveText`, `questText`, `gcgText`                                                                                       | Each screen's text loader, one language on demand                            |
| Tables a screen opens                                       | `achievements`, `archive`, `quests`, `gcg`, `gathering`, `wildlife`, `exploration`, `transPoints`, `friendship`, `forging`                                 | The readers named in their own services                                      |
| Recipes and activities, read through their existing readers | `cooking`, `crafting`, `fishing`, `home`, `imaginarium`, `spiralAbyss`, `commissions`, `expeditions`, `gadgets`, `offerings`, `reputation`, `statueLevels` | The readers already in `genshin-world`                                       |
| Tables with no reader yet, published unchanged              | `chests`, `puzzles`, `oculi`, `shops`, `frostbearingTreePlaces`                                                                                            | Nothing today; the puzzles page plans a reader                               |

`gcg/games.json` is `{}` at HEAD, so `readGcgGame` still throws for every id. The move carries that defect; it does not fix it.

## Synchronous reads that change

- `Combatant` gains a required `weaponType`, filled from the stat tables the composable already holds before any kit runs. `getCharacterWeaponType` is deleted, and `bennettKit.ts` reads the field.
- `readGcgGame` becomes async, and its one caller, the card game's session setup, awaits it.
- The Windrise wildlife layer fills a shallow ref at setup and renders under `v-if`, as the screen's landmark layer already does.

## Tests and fixtures

- Three fixtures stop importing JSON statically: the character screen, the card game screen and the HUD screen.
- Nine suites that read named records take the same route. Kit suites and the card game's effect suites read through the mirror, given the base URL they now take.
- About forty-five test files call the readers that gain a base argument. The change at each call site is the base, and the expectation stays as it is.
- A CI cache keeps each shard's mirror, keyed on the lock, so a run fetches only the objects a patch changed.

## Removing the generated tree

- The loader maps for the remaining datasets go, with their barrel exports and the generator halves that write them.
- The declaration stand-in and its path block in the build tsconfig go, once no generated JSON remains.
- `toJson.ts` goes with the last pretty-printed writer, and the constants that point into `packages/genshin-world/src/generated` become dataset values.
- The `.chunk.ts` rules in the build skill are already gone with phase one; this phase removes the stand-in rule that is left.

## Open decisions

- **The develop deployment is not admitted.** `https://esposter-develop.up.railway.app` is in neither account's CORS list, so a develop World mount against `devstesposter001` would fail once the World reads its stats from the account. The choice is between admitting that origin on the dev account and pointing develop at production data; it needs the owner's decision before this phase ships.
- **The npm package needs a host.** Consumers outside Esposter must serve the objects the lock names and pass `gameDataBaseUrl`. The README says so, and the major version marks it.
- **World mount latency is measured, not assumed.** Mount waits on the account's round trips instead of same-origin chunks. The phase ends with a timing before and after; a preconnect, or merging the stats tables into one object, follows only if mount got slower.

## Done when

- The generated folder holds only the lock, and the package build reads and emits no generated JSON.
- Every dataset passes `pnpm -C scripts genshin:data verify` against both accounts.
- A rerun of each builder on the same dump reports unchanged with no request.
- The as-built page records the phase's before and after measurements, and this page is deleted.
