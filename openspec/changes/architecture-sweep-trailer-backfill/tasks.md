# Tasks

## 1. Decide the dating path

- [ ] 1.1 The owner picks one of the three options in `proposal.md`. Verified by a recorded choice in this change's `proposal.md`, replacing the open question.

## 2. Date the swept units (option 1)

- [ ] 2.1 Write a ledger-only commit with one `Ledger: genshin-spec-evidence | <unit>` trailer per unit whose sweep commit changed the unit's file, and name each sweep commit in the body. Verified by `pnpm ai:sweep:ledger-coverage` reporting those rows dated and no trailer naming an unknown row.

## 3. Option 2 only

- [ ] 3.1 Write a failing test in `scripts/src/services/sweeps/ledgerCoverage` for a unit changed by a commit with no trailer, expecting a date. Verified by seeing it fail first.
- [ ] 3.2 Make `getLedgerEvents` take the date from the changed file's history, and update `.agents/skills/sweeps/references/one-pass.md` in the same commit. Verified by the test passing and the ledger rebuilt.
