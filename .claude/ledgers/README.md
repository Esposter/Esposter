# Ledgers

Progress state for sweeps in flight. What a sweep is and how one is run: the `sweeps` skill.

| Ledger                                            | Mode     | Rules                        | Unit               | Coverage          |
| ------------------------------------------------- | -------- | ---------------------------- | ------------------ | ----------------- |
| [comments](comments.md)                           | standing | `formatting` skill           | one package        | dated per package |
| [simplification](simplification/)                 | one-shot | `AGENTS.md` step 1           | one area           | one file per area |
| [component-granularity](component-granularity.md) | one-shot | `vue-page-composition` skill | one component tree | dated per tree    |
| [test-trimming](test-trimming.md)                 | one-shot | `testing` skill              | one tree           | dated per tree    |
| [single-use-computeds](single-use-computeds.md)   | one-shot | `vue` skill                  | one tree           | dated per tree    |

Coverage lives in the leaf, never here. A pass reads this table and the one file it is sweeping.

Retired: **pass-through-helpers**, swept out on 2026-08-12 and now enforced by `pass-through-helper/no-forwarding-wrapper` — a forwarding wrapper fails the lint on the line that writes it, so there is nothing left to track. A sweep whose whole scope becomes enforceable is deleted rather than maintained (`sweeps` skill).
