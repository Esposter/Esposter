# Ledgers

Progress state for sweeps in flight. What a sweep is and how one is run: the `sweeps` skill.

| Ledger                                    | Rules                                                  | Unit                        | Coverage          |
| ----------------------------------------- | ------------------------------------------------------ | --------------------------- | ----------------- |
| [browser-boundary](browser-boundary.md)   | `/docs/architecture/browser-execution`                 | one `app/` tree             | dated per tree    |
| [comments](comments.md)                   | `formatting` skill                                     | one package                 | dated per package |
| [docs](docs.md)                           | `docs` + `readme-standards` + `skill-authoring` skills | one docs area or skill tree | dated per area    |
| [error-handling](error-handling.md)       | `error-handling` skill                                 | one tree                    | dated per tree    |
| [file-organization](file-organization.md) | `file-organization` skill                              | one package or tree         | dated per unit    |
| [naming](naming.md)                       | `naming` skill                                         | one tree                    | dated per tree    |
| [pinia](pinia.md)                         | `pinia` skill                                          | one store tree              | dated per tree    |
| [quality](quality/)                       | `code-review` skill — quality lane                     | one area                    | one file per area |
| [schemas](schemas.md)                     | `zod` + `drizzle` skills                               | one schema tree             | dated per tree    |
| [styling](styling.md)                     | `styling` + `unocss` + `vuetify` + `responsive` skills | one component tree          | dated per tree    |
| [tests](tests.md)                         | `testing` skill                                        | one tree                    | dated per tree    |
| [trpc](trpc.md)                           | `trpc` skill                                           | one router tree             | dated per tree    |
| [ux](ux.md)                               | `ux` skill                                             | one product area            | dated per area    |
| [vue-components](vue-components.md)       | `vue-page-composition` + `vue` skills                  | one component tree          | dated per tree    |

There is no mode column, because every sweep is standing — the `sweeps` skill owns why, and how a pass resumes
from the files changed since a row's date.

**One ledger per question, not per file set.** Several ledgers reaching the same files is deliberate — three of
them read `app/components`, asking three different things of it. They merge only when the question is the same:
`tests` absorbed test-trimming and test-constant-scope, and `vue-components` absorbed component-granularity and
computed-extraction, because each pair ran the same skill over the same files and handed findings to the other.
A convention with no ledger opens one; a convention an enforcer already decides opens none (`sweeps` skill).

Still unledgered, and known to be: `pagination`, `typescript` (mostly enforced already), `invariants`,
`runtime-efficiency`, and the product skills (`esbabbler`, `routing`, `slash-commands`, `tiptap`, `vjsf`,
`grapesjs`, `azure-table`, `string-utils`) — each too small for a sitting today, so a finding against one is
raised rather than swept.

Coverage lives in the leaf, never here. A pass reads this table and the one file it is sweeping.

Absorbed: **quality/skills**, folded into [docs](docs.md) on 2026-08-20 — both read `.agents/skills`
against `skill-authoring`, so the tree was being read twice and each pass handed findings to the other. Its
structural check went with it.

Retired: **package-imports**, finished on 2026-08-23 and now enforced by an `.oxlintrc.json` override that bans
`@/**` under `packages/*/src/**` — every package addresses its own source through `#src/*`, and the alias it
replaced no longer exists to fall back to, since `tsconfig.base.json` has no `paths` block.

Retired: **pass-through-helpers**, swept out on 2026-08-12 and now enforced by
`pass-through-helper/no-forwarding-wrapper` — a forwarding wrapper fails the lint on the line that writes it, so
there is nothing left to track. A sweep whose whole scope becomes enforceable is deleted rather than maintained
(`sweeps` skill).
