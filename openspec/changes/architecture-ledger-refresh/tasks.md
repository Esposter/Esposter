# Tasks

## 1. Shapes

- [x] 1.1 Judge `genshin-evidence` against `genshin-spec-evidence`, merging them or naming the difference in their units and index rows. Verified by `pnpm -C scripts exec vitest run src/workspace/ledgerUnits.test.ts` passing and the index holding one row per question.
- [x] 1.2 Judge `kit-records` against `kit-differs-from-source` the same way. Verified by the same test passing after the merge or the recorded difference.
- [x] 1.3 Resize or derive the hand-listed tooling tables in `quality`, `security` and `file-organization`, with every resized row opening at `—`. Verified by `ledgerUnits.test.ts` passing and no tooling table holding a row per file.
- [x] 1.4 Decide whether the area-split ledgers share one derived listing of areas and units, and build it if they do. Verified by `ledgerAreaUnits.test.ts` holding every area-split ledger's rows to the listing, or by the index stating why each sizes its own.
- [x] 1.5 Read every ledger's rules table for rules an enforcer now owns, and retire a ledger left with nothing to judge. Verified by `pnpm ai:sweep:ledger-coverage` reporting no row for a retired ledger and no index row naming it.
- [x] 1.6 Reopen every remaining row dated before the current rules, setting its `Swept` cell to `—`. Verified by `pnpm ai:sweep:ledger-coverage` listing those rows as open.
- [x] 1.7 Re-chunk `scripts/src/services/genshinAssets/fit` in the seven ledgers that list it (`typescript/packages`, `naming/tooling`, `invariants/tooling`, `test-values/tooling`, `write-once/tooling`, `quality/tooling` and `security/tooling`), so `getPointDistance.ts` sits in the name-ordered chunk its name falls in. The chunk holding `getMean.ts` and `getStandardDeviation.ts` and every chunk after it are full at 40 files, except the last, which holds 10 and has room, so the move cascades one file per chunk down to that last chunk, which absorbs the overflow and ends the shift. Each reshaped chunk is a new unit that reopens at `—`. Decide whether the cascade runs as one pass or after splitting the folder at a shallower boundary first. Verified by a read of each re-chunked row's names against its neighbours, since no test checks chunk order.

## 2. Resweep

- [ ] 2.1 Reopen every ledger with one `Reopens: <ledger>` trailer each, on a trailer-only record commit. Verified by `pnpm ai:sweep:status` counting no swept unit in any ledger.
- [ ] 2.2 Sample every ledger: thirty random units each, read in full, each unit read once for every question whose scope holds it, and a `Sampled:` trailer per ledger naming its defects. Verified by `pnpm ai:sweep:status` listing each ledger's unread units as sampled or open.
- [ ] 2.3 Read every unit of the ledgers whose sample found a defect, area-split questions first (`invariants`, `quality`, `security`, `write-once`), then the language, framework, Genshin and tooling ledgers. Verified by `pnpm ai:sweep:status` listing no open unit.
- [ ] 2.4 Archive this change once `pnpm ai:sweep:status` lists no open unit. Verified by `pnpm exec openspec archive architecture-ledger-refresh --yes` succeeding.
