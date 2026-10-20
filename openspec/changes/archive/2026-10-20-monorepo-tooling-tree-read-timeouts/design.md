# Whole-tree suites: one rule for their timeout under contention

## Decisions

- **The decision is made by a measurement under contention, not by either skill's wording.** The removal in `97740d6d5b` was measured one file at a time, which is the condition the contention argument says does not hold. Rejected: restoring `TREE_READ_TIMEOUT_MS` on the three suites by rule alone, since it keeps a limit no measurement has sized; and deleting the constant's rule from `script-clock.md` alone, since it leaves the three suites unmeasured under the run that fails them.
- **The measurement is the full `scripts` workspace suite run in parallel, with the three suites at the default.** Its slowest whole-tree suite under contention sets the answer. Rejected: a stopwatch reading kept in prose, since the bench skill says the committed bench is the only number a session quotes.
- **If a suite passes under the default in that run, its override stays removed; if it does not, the override returns with its measured magnitude in the commit body.** One rule then governs all whole-tree suites, and the other skill's text follows it.

## Key files

| File                                                           | Role                                              |
| -------------------------------------------------------------- | ------------------------------------------------- |
| `scripts/src/workspace/constants.test.ts`                      | `TREE_READ_TIMEOUT_MS` and its contention comment |
| `scripts/src/workspace/openspecLinks.test.ts`                  | a whole-tree suite without the constant           |
| `scripts/src/workspace/openspecIndexes.test.ts`                | a whole-tree suite without the constant           |
| `scripts/src/workspace/ledgerScopes.test.ts`                   | a per-row whole-tree test without the constant    |
| `.agents/skills/runtime-efficiency/references/script-clock.md` | the contention rule                               |
| `.agents/skills/testing/references/timeouts.md`                | the measured-isolation rule                       |
