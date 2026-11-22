# Ledger refresh

## Why

The sweep ledgers under `.agents/ledgers/` say which units each settled convention has reached, and a row's date says the rules held there on that day. Most rows were dated before the rules that now shape the repository were written down: the [write-once](../../specs/architecture/write-once/design.md) compass, the [enforcement ladder](../../specs/architecture/enforcement-ladder/design.md), the `over-engineering` and `fallacies` catalogues and the `no-compatibility-debt` rule. A row read against a narrower rule set is not swept against the current one, so nearly every ledger is open in substance while its table reads as finished.

Some ledgers also break those rules in their own shape. A few hold hand-listed tables of hundreds or thousands of rows that the tree could derive, which is the write-once page's "list held equal to the code" red flag. Several area-split ledgers repeat the same list of areas and units, and two pairs of ledgers ask what may be one question twice. Refreshing their rows without fixing their shape would carry those faults forward.

## What changes

- Each ledger's shape is judged against the current rules before its rows are read again: whether it should be merged, split, derived from the tree, handed to an enforcer or retired. The design lists the candidates and the questions each one answers.
- Every ledger is reopened and read again in full under the current rules and the current model, whatever its units' dates, so no unit keeps a date earned under a narrower rule set. The batches follow the [ledger redesign](../archive/2026-11-22-architecture-ledger-redesign/design.md)'s sitting rules: a unit is read once for every question whose scope holds it, a clean unit's trailer rides a record commit, and a ledger whose sample of thirty finds no defect is sampled clean instead of read unit by unit.
- A pass that finds a shape needing more than a mechanical fix — a manual registry, an allowlist, an abstraction with one consumer — fixes it in that pass, as its own commit ahead of the row's sweep commit. A change of behaviour leaves the sweep for a proposal, as the [engineering loops](../../specs/architecture/engineering-loops/spec.md) require.

No behaviour changes. This is a tooling and documentation change, so it carries no spec delta.

## Out of scope

- Row progress. It is read from commit trailers by `pnpm ai:sweep:status`, as the `sweeps` skill requires; this change holds the redesign decisions and the batch order, never a copy of a row's state.
- New conventions. A gap a pass finds in a rule goes to the skill that owns the rule (the `sweeps` skill's rule-gaps page), not into this change.
