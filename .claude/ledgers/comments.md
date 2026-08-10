# Comments

| Unit                                                    | Swept      | Notes                                                     |
| ------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| `packages/app`                                          | 2026-08-10 | components, composables, stores, services, server, shared |
| `packages/azure-functions`                              | 2026-08-10 |                                                           |
| `packages/azure-mock`                                   | 2026-08-10 | filter/search/container mocks                             |
| `packages/configuration`                                | 2026-08-10 | external lists, `global.d.ts`                             |
| `packages/db`, `packages/db-mock`, `packages/db-schema` | 2026-08-10 | schema + models                                           |
| `packages/infra`                                        | 2026-08-10 | event subscriptions, GitHub rulesets                      |
| `packages/parse-tmx`                                    | 2026-08-10 | `TMXNode.ts`                                              |
| `packages/shared`, `packages/shared-node`               | 2026-08-10 | `takeOne`                                                 |
| `packages/virrun`                                       | 2026-08-10 | the WSL mirror prose is the bulk of it                    |
| `packages/vue-phaserjs`                                 | 2026-08-10 | composables, store, models, test setup                    |
| `packages/xml2js`                                       | 2026-08-10 | `Parser.ts`                                               |
| repo root — `scripts/`, `.claude/`, root `*.config.ts`  | 2026-08-10 | workflow scripts and their tests                          |

Each pass re-checks only files changed since its unit's date, then bumps it. Greps:

1. `^\s*//.{85,}` over `*.ts`, `*.vue`
2. `\n[ \t]*\n[ \t]*//` multiline (skip `.test.ts`/`.test-d.ts` and the import→body boundary)
3. `/\*` over `*.ts`, `*.vue` (ignore `import.meta.glob`)
4. `<!--` over `*.vue`
5. `(used to|previously|no longer|formerly|the old |the former |now that |replaces the |we now )` over `//`/`<!--` lines — the history-narration ban. Most hits are present-tense domain uses (`the old manifest`, `no longer resolvable`); what fails is a clause naming what the code replaced.

Never swept anywhere: 3-line `//` blocks with every line short, `/** */` JSDoc added since the dates above.

Excluded: `packages/app/configuration/plugins/fixAjv.ts` + test (numbered step list is a deliberate reference) · `packages/app/shared/types/nuxt.d.ts`, `packages/app/app/types/desmos.d.ts`, `packages/configuration/types/global.d.ts`, `packages/vue-phaserjs/auto-imports.d.ts` (vendored/generated) · `packages/app/app/util/math/random/getRandomValues.ts`, `packages/db/src/services/azure/table/getTableNullClause.ts` (source-URL references) · `*/rolldown.config.ts`, `@ts-expect-error` / `oxlint-disable` lines (directives).

Enforceable next: comment length and blank-before-comment, via a custom oxlint plugin — oxlint excludes layout rules by design, so this needs a JS plugin rather than a stock rule. SFC block padding already went to `vue/padding-line-between-blocks`.
