# Design

## Context

`pnpm ai:sweep:ledger-coverage` dates a ledger row only from the trailers it reads: `getLedgerEvents` in `scripts/src/services/sweeps/ledgerCoverage/getLedgerEvents.ts` takes a `Ledger:` value with a unit and nothing else, and the script raises a cell to the newest such event. The convention that a trailer dates only what a pass read is stated in `.agents/skills/sweeps/references/one-pass.md`, and the coverage mechanism in `.agents/skills/sweeps/references/ledger-files.md`. A sweep that lands a unit without its trailer leaves the row open, which is what happened to about twenty units of `.agents/ledgers/genshin-spec-evidence.md`.

## Decision needed

The choice between the three options in `proposal.md` is the owner's. This design records what each one would touch, so the choice is made against the cost and not the name.

- **Backfill commit (recommended).** Touches the ledger file only, plus the commit message. The date written is the backfill's, and the message names each sweep commit it dates, so the row's date is the one fact that is wrong. No script change, no history rewrite, no change to the sweep rule. The risk is a reviewer reading the ledger date as the sweep date; the commit body prevents that.
- **History-dated coverage.** Touches `getLedgerEvents.ts`, its coverage test and the sweeps skill, because a changed file would count as a read. It is the only option with exact dates, and the only one that changes what a trailer means. Rejected as the default because a commit that edits a unit has not necessarily read all of it, and the convention exists to refuse that inference.
- **Leave open.** Touches nothing. Rejected as the default because the work is already done, and reading it again is the cost the ledger exists to avoid.

## Key files

| File                                                            | Role                                            |
| :-------------------------------------------------------------- | :---------------------------------------------- |
| `.agents/ledgers/genshin-spec-evidence.md`                      | the ledger whose rows the backfill would date   |
| `scripts/src/services/sweeps/ledgerCoverage/getLedgerEvents.ts` | reads the trailers; changed only under option 2 |
| `.agents/skills/sweeps/references/one-pass.md`                  | the trailer rule; changed only under option 2   |
| `openspec/specs/architecture/engineering-loops/design.md`       | the code-health loop that owns sweeps           |
