# Ledgers

Progress state for sweeps in flight. What a sweep is and how one is run: the `sweeps` skill.

| Ledger                              | Rules                                 | Unit               | Coverage          |
| ----------------------------------- | ------------------------------------- | ------------------ | ----------------- |
| [comments](comments.md)             | `formatting` skill                    | one package        | dated per package |
| [simplification](simplification/)   | `AGENTS.md` step 1                    | one area           | one file per area |
| [tests](tests.md)                   | `testing` skill                       | one tree           | dated per tree    |
| [vue-components](vue-components.md) | `vue-page-composition` + `vue` skills | one component tree | dated per tree    |

There is no mode column, because every sweep is standing — the `sweeps` skill owns why, and how a pass resumes
from the files changed since a row's date.

**One ledger per subject, not per convention.** A subject read twice is read twice — `tests` absorbed
test-trimming and test-constant-scope, and `vue-components` absorbed component-granularity and
computed-extraction, because each pair always ran over the same files and handed findings to the other. A new
convention joins the ledger that already owns its files and resets that ledger's dates; it does not open a
ledger of its own.

Coverage lives in the leaf, never here. A pass reads this table and the one file it is sweeping.

Retired: **pass-through-helpers**, swept out on 2026-08-12 and now enforced by
`pass-through-helper/no-forwarding-wrapper` — a forwarding wrapper fails the lint on the line that writes it, so
there is nothing left to track. A sweep whose whole scope becomes enforceable is deleted rather than maintained
(`sweeps` skill).
