# Tasks

## 1. Shapes

- [x] 1.1 Judge `genshin-evidence` against `genshin-spec-evidence`, merging them or naming the difference in their units and index rows. Verified by `pnpm -C scripts exec vitest run src/workspace/ledgerUnits.test.ts` passing and the index holding one row per question.
- [x] 1.2 Judge `kit-records` against `kit-differs-from-source` the same way. Verified by the same test passing after the merge or the recorded difference.
- [x] 1.3 Resize or derive the hand-listed tooling tables in `quality`, `security` and `file-organization`, with every resized row opening at `—`. Verified by `ledgerUnits.test.ts` passing and no tooling table holding a row per file.
- [x] 1.4 Decide whether the area-split ledgers share one derived listing of areas and units, and build it if they do. Verified by `ledgerUnits.test.ts` holding every area-split ledger's rows to the listing, or by the index stating why each sizes its own.
- [x] 1.5 Read every ledger's rules table for rules an enforcer now owns, and retire a ledger left with nothing to judge. Verified by `pnpm ai:sweep:ledger-coverage` reporting no row for a retired ledger and no index row naming it.
- [x] 1.6 Reopen every remaining row dated before the current rules, setting its `Swept` cell to `—`. Verified by `pnpm ai:sweep:ledger-coverage` listing those rows as open.

## 2. Rows

- [ ] 2.1 Read the `write-once` rows. Verified by `pnpm ai:sweep:ledger-coverage` listing no open `write-once` row.
- [ ] 2.2 Read the language ledgers: `typescript`, `naming`, `invariants`, `test-values` and `error-handling`. Verified by the coverage command listing none of their rows as open.
- [ ] 2.3 Read `quality`, `security` and `file-organization`. Verified the same way.
- [ ] 2.4 Read the framework ledgers: `pinia`, `trpc`, `routing`, `tiptap`, `pagination`, `schemas`, `vue-components`, `vue-composable-patterns`, `vue-phaserjs`, `styling`, `ui-library`, `ux`, `slash-commands`, `string-utils`, `esbabbler`, `esbabbler-call` and `runtime-efficiency`. Verified the same way.
- [ ] 2.5 Read the Genshin ledgers and the tooling ledgers: the Genshin engine, parity, text, evidence, kit, summon and component ledgers, then `build`, `bench`, `cli`, `oxlint`, `package-scripts`, `github-actions`, `dependency-updates`, `dependencies`, `pulumi-infra`, `claude-mods`, `claude-permissions`, `comments`, `embedded-recipes`, `type-level` and `docs`. Verified the same way.
- [ ] 2.6 Archive this change once the coverage command lists no row older than the current rules. Verified by `pnpm exec openspec archive architecture-ledger-refresh --yes` succeeding.
