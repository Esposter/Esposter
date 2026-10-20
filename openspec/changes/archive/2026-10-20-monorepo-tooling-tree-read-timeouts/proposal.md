# Whole-tree suites: one rule for their timeout under contention

## Why

Two rules disagree about the whole-tree suites in `scripts/src/workspace`. `script-clock.md` says a whole-tree suite declares `TREE_READ_TIMEOUT_MS`, because several of them run at once and contend, so Vitest's 5s default fails a sibling that is not slow alone. `timeouts.md` says a timeout is earned only by a measurement, and the commit that removed the override from some suites measured each one alone, one file at a time. Under the parallel run the two rules give opposite answers for the same suite: the async tree read in `openspecLinks`, `openspecIndexes` and the per-row `ledgerScopes` test has lost its declared limit, and nothing records whether it was measured under contention.

## What Changes

Decide which rule governs a whole-tree suite's timeout, and make that decision measured under the parallel run rather than alone.

- The three suites (`openspecLinks`, `openspecIndexes`, `ledgerScopes`) keep or lose `TREE_READ_TIMEOUT_MS` on the result of that measurement, not on either rule's wording.
- `script-clock.md` and `timeouts.md` name the same rule once the decision is made.

## Capabilities

- **architecture/monorepo-tooling** (modified)

## Impact

- The workspace suite runs in parallel in CI, so a wrong call here fails a sibling suite rather than the one that is slow.
- No code changes until the decision is made; the measurement is the first task.
