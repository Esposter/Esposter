## 1. Measure under contention

- [ ] 1.1 Run the full `scripts` workspace suite in parallel with `openspecLinks`, `openspecIndexes` and `ledgerScopes` at the default timeout, and record each suite's slowest test. Verify: the run's result and the three suites' slowest durations are written into the commit body that settles the rule.

## 2. Settle the rule

- [ ] 2.1 Restore `TREE_READ_TIMEOUT_MS` on any suite that fails or sits near the default in 1.1, or leave it removed and say so. Verify: the parallel run in 1.1 passes with the decided set.
- [ ] 2.2 Make `script-clock.md` and `timeouts.md` state the one rule. Verify: a grep for "whole-tree suite" across `.agents/skills` gives one rule that the three suites follow.
