---
title: Hosted game data
description: Proposal, second phase — the other thirty-five generated datasets genshin-world still bundles move to the hosted game data, and the synchronous imports, tests and fixtures that still read them change with them, so the package ships no generated JSON at all.
model: claude-haiku-5-5
---

# Hosted game data: the remaining datasets

The Profile tab and the book reader already fetch their records from the published game data, as [hosted game data](/docs/genshin/hosted-game-data) sets out. Every dataset the package bundles is published there too, from its committed files, with the talent multipliers already read from their index and the suites' mirror in place. This proposal is what is left of the same move: the readers of the thirty-five folders of generated JSON and the fitted data files that the package still imports, the three reads that still happen synchronously at import time, the builders that still write files, and the suites and fixtures that read them. Nothing here changes the mechanism; it extends the one that shipped.

## Decisions

- **Each dataset is one builder that returns records.** A step stops writing files and hands its records to the publisher, scoped to the dataset it replaces. Code-named records take a key of their own (`stats/weapons`, `gcg/standardRule`). Gcg decks take `gcg/deck<id>`, one key each.
- **The talents screen reads one character's labels** from the published `talentLabels` index, as the combat reads its multipliers, so it fetches one record and not the collection.
- **Synchronous reads become awaited reads.** The Bennett kit reads a weapon type it has no access to today, and the Windrise wildlife layer is a static import. Each becomes a value loaded at mount and handed down, so no screen waits on a module it did not need.
- **Scripts read what the publisher wrote, from the account.** A step that reads another step's output reads it through the lock and the dev account, never through `genshin-world`'s build, which a step running under `tsx` may load stale.
- **The develop deployment reads the dev account.** The owner admitted `https://esposter-develop.up.railway.app` on `devstesposter001`'s Blob CORS (2026-10-09), beside `http://localhost:3000` and with its methods, so a develop World mount reads its records from the dev account rather than from production's.

## Datasets

The dataset list is what the builders publish, in the order each one depends on another:

| Group                                                       | Datasets                                                                                                                                                   | Read by                                                                      |
| :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| Stats and talents                                           | `stats`, `talentMultipliers`, `talentLabels`                                                                                                               | `readStatTables` at World mount, the talent readers in the combat composable |
| Tables a screen opens                                       | `wildlife`, `forging`                                                                                                                                      | The readers named in their own services                                      |
| Recipes and activities, read through their existing readers | `cooking`, `crafting`, `fishing`, `home`, `imaginarium`, `spiralAbyss`, `commissions`, `expeditions`, `gadgets`, `offerings`, `reputation`, `statueLevels` | The readers already in `genshin-world`                                       |
| Tables with no reader yet, published unchanged              | `chests`, `puzzles`, `oculi`, `shops`, `frostbearingTreePlaces`                                                                                            | Nothing today; the puzzles page plans a reader                               |

`gcg/games.json` is `{}` at HEAD, so `readGcgGame` still throws for every id. The move carries that defect; it does not fix it.

## Synchronous reads that change

- `Combatant` gains a required `weaponType`, filled from the stat tables the composable already holds before any kit runs. `getCharacterWeaponType` is deleted, and `bennettKit.ts` reads the field.
- The Windrise wildlife layer fills a shallow ref at setup and renders under `v-if`, as the screen's landmark layer already does.

## Tests and fixtures

- Three fixtures stop importing JSON statically: the character screen, the card game screen and the HUD screen.
- Nine suites that read named records take the same route. Kit suites and the card game's effect suites read through the mirror, given the base URL they now take.
- About forty-five test files call the readers that gain a base argument. The change at each call site is the base, and the expectation stays as it is.
- One CI step fills the mirror with every object and index entry the lock names and saves it, keyed on the lock, before the shards that only restore it run, so a run fetches only the objects a patch changed.

## Removing the generated tree

- The loader maps for the remaining datasets go, with their barrel exports and the generator halves that write them.
- The declaration stand-in and its path block in the build tsconfig go, once no generated JSON remains.
- `toJson.ts` goes with the last pretty-printed writer, and the constants that point into `packages/genshin-world/src/generated` become dataset values.
- The `.chunk.ts` rules in the build skill are already gone with phase one; this phase removes the stand-in rule that is left.

## Open decisions

- **The card game's words are behind their decks.** The committed deck slices name 176 texts, and the lock's `gcgText` records hold 102, written before decks 11002, 11005, 30111 and 30112 were built. The card game reads the 102 until `genshin:text gcg` publishes its chunks from the slices, which its builder does once it is run for real.
- **The npm package needs a host.** Consumers outside Esposter must serve the objects the lock names and pass `gameDataBaseUrl`. The README says so.
- **World mount latency is measured, not assumed.** Mount waits on the account's round trips instead of same-origin chunks. The phase ends with a timing before and after; a preconnect, or merging the stats tables into one object, follows only if mount got slower.

## Done when

- The generated folder holds only the lock, and the package build reads and emits no generated JSON.
- Every dataset passes `pnpm -C scripts genshin:data verify` against both accounts.
- A rerun of each builder on the same dump reports unchanged with no request.
- The as-built page records the phase's before and after measurements, and this page is deleted.
