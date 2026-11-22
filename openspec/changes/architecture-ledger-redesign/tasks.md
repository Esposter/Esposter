# Tasks

## 1. Status

- [x] 1.1 Read a carried date and a sample from a trailer, and date each ledger's units from its events in the order they happened. Verified by `scripts/src/services/sweeps/ledgerCoverage/getLedgerEvents.test.ts` and `getLedgerCoverage.test.ts` passing.
- [x] 1.2 Add `pnpm ai:sweep:status`, printing every ledger's open and dated units, or one ledger's units with their dates and models. Verified by the command reading the same date and model for every unit as the ledger files hold today.

## 2. Move

- [x] 2.1 Carry every dated cell the trailers do not reproduce on a trailer-only record commit. Verified by a one-time diff of `pnpm ai:sweep:status` against every `Swept` cell finding no difference.
- [x] 2.2 Move the `invariants` area files to `.agents/ledgers/areas/`, keep a `quality`, `security` or `write-once` area file only for its noted units, drop every `Swept` column, keep a derived ledger's file only for the rows that carry something, and delete `pnpm ai:sweep:ledger-coverage` and `ledgerAreaUnits.test.ts`. Verified by `ledgerUnits.test.ts`, `ledgerMembers.test.ts` and `ledgerScopes.test.ts` passing, and the status reading the same as in 2.1.

## 3. Sittings

- [ ] 3.1 Rewrite the `sweeps` skill for the record commit, the reopen by recipe, the unit read once for several questions and the sampled-clean ledger, and point every page that names the old command or column at the status. Verified by `scripts/src/workspace/skillDocs.test.ts` passing and no page outside the archive naming `ai:sweep:ledger-coverage`.
- [ ] 3.2 Archive this change. Verified by `pnpm exec openspec archive architecture-ledger-redesign --yes` succeeding.
