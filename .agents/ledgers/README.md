# Ledgers

Progress state for sweeps in flight. What a sweep is and how one is run: the `sweeps` skill.

| Ledger                                  | Rules                                                  | Unit                        | Coverage          |
| --------------------------------------- | ------------------------------------------------------ | --------------------------- | ----------------- |
| [browser-boundary](browser-boundary.md) | `/docs/architecture/browser-execution`                 | one `app/` tree             | dated per tree    |
| [comments](comments.md)                 | `formatting` skill                                     | one package                 | dated per package |
| [docs](docs.md)                         | `docs` + `readme-standards` + `skill-authoring` skills | one docs area or skill tree | dated per area    |
| [simplification](simplification/)       | `AGENTS.md` step 1                                     | one area                    | one file per area |
| [tests](tests.md)                       | `testing` skill                                        | one tree                    | dated per tree    |
| [ux](ux.md)                             | `ux` skill                                             | one product area            | dated per area    |
| [vue-components](vue-components.md)     | `vue-page-composition` + `vue` skills                  | one component tree          | dated per tree    |

There is no mode column, because every sweep is standing — the `sweeps` skill owns why, and how a pass resumes
from the files changed since a row's date.

**One ledger per subject, not per convention.** A subject read twice is read twice — `tests` absorbed
test-trimming and test-constant-scope, and `vue-components` absorbed component-granularity and
computed-extraction, because each pair always ran over the same files and handed findings to the other. A new
convention joins the ledger that already owns its files and resets that ledger's dates; it does not open a
ledger of its own.

Coverage lives in the leaf, never here. A pass reads this table and the one file it is sweeping.

Absorbed: **simplification/skills**, folded into [docs](docs.md) on 2026-08-20 — both read `.agents/skills`
against `skill-authoring`, so the tree was being read twice and each pass handed findings to the other. Its
structural check went with it.

Retired: **package-imports**, finished on 2026-08-23 and now enforced by an `.oxlintrc.json` override that bans
`@/**` under `packages/*/src/**` — every package addresses its own source through `#src/*`, and the alias it
replaced no longer exists to fall back to, since `tsconfig.base.json` has no `paths` block.

Retired: **pass-through-helpers**, swept out on 2026-08-12 and now enforced by
`pass-through-helper/no-forwarding-wrapper` — a forwarding wrapper fails the lint on the line that writes it, so
there is nothing left to track. A sweep whose whole scope becomes enforceable is deleted rather than maintained
(`sweeps` skill).
