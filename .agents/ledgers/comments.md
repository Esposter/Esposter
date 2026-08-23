# Comments

| Unit                                                    | Swept      | Notes                                                     |
| ------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| `packages/app`                                          | 2026-08-20 | components, composables, stores, services, server, shared |
| `packages/azure-functions`                              | 2026-08-20 |                                                           |
| `packages/azure-mock`                                   | 2026-08-20 | filter/search/container mocks                             |
| `packages/configuration`                                | 2026-08-20 | external lists, `global.d.ts`                             |
| `packages/db`, `packages/db-mock`, `packages/db-schema` | 2026-08-20 | schema + models                                           |
| `packages/infra`                                        | 2026-08-20 | event subscriptions, GitHub rulesets                      |
| `packages/parse-tmx`                                    | 2026-08-20 | `TMXNode.ts`                                              |
| `packages/shared`, `packages/shared-node`               | 2026-08-20 | `takeOne`                                                 |
| `packages/virrun`                                       | 2026-08-20 | the WSL mirror prose is the bulk of it                    |
| `packages/vue-phaserjs`                                 | 2026-08-20 | composables, store, models, test setup                    |
| `packages/xml2js`                                       | 2026-08-20 | `Parser.ts`                                               |
| repo root — `scripts/`, `.agents/`, root `*.config.ts`  | 2026-08-20 | workflow scripts and their tests                          |

Each pass re-checks only files changed since its unit's date, then bumps it. A new rule resets every date — the doc-block rule (6) landed on 2026-08-20 and every row was re-read against it. Greps:

1. `^\s*//.{85,}` over `*.ts`, `*.vue`
2. `\n[ \t]*\n[ \t]*//` multiline (skip `.test.ts`/`.test-d.ts` and the import→body boundary)
3. `/\*` over `*.ts`, `*.vue` (ignore `import.meta.glob`)
4. `<!--` over `*.vue`
5. `(used to|previously|no longer|formerly|the old |the former |now that |replaces the |we now )` over `//`/`<!--` lines — the history-narration ban. Most hits are present-tense domain uses (`the old manifest`, `no longer resolvable`); what fails is a clause naming what the code replaced.
6. `^\s*/\*\*` — a doc block. It stays only on an exported API surface, and its content obeys every comment rule: a line restating the declaration's own name, or claiming what `implements` and typecheck already prove, earns nothing.
7. A comment sentence that appears **verbatim in more than one file** — sort the `//` lines of the unit, count duplicates, and read every group of two or more. A rationale worth writing at every call site is a convention, and the owning skill already states it; the copies are what go stale. This is rule "never restate an established pattern" applied to the one shape a per-file read cannot see.

Never swept anywhere: 3-line `//` blocks with every line short.

Excluded: `packages/app/configuration/plugins/fixAjv.ts` + test (numbered step list is a deliberate reference) · `packages/app/shared/types/nuxt.d.ts`, `packages/app/app/types/desmos.d.ts`, `packages/configuration/types/global.d.ts`, `packages/vue-phaserjs/auto-imports.d.ts` (vendored/generated) · `packages/app/app/util/math/random/getRandomValues.ts`, `packages/db/src/services/azure/table/getTableNullClause.ts` (source-URL references) · `*/tsdown.config.ts`, `@ts-expect-error` / `oxlint-disable` lines (directives) · doc blocks copied verbatim from an upstream type (`azure-mock`'s paging interfaces, the Desmos enums) — they are kept diff-identical to their source, same ground as an unimplemented interface stub.

Enforceable next: comment length and blank-before-comment, via a custom oxlint plugin — oxlint excludes layout rules by design, so this needs a JS plugin rather than a stock rule. SFC block padding already went to `vue/padding-line-between-blocks`.
