# Comments

| Unit                              | Swept      | Notes                                                     |
| --------------------------------- | ---------- | --------------------------------------------------------- |
| `packages/app`                    | 2026-06-14 | components, composables, stores, services, server, shared |
| `packages/vue-phaserjs`           | 2026-06-14 | composables, store, models, test setup                    |
| `packages/azure-mock`             | 2026-06-14 | filter/search/container mocks                             |
| `packages/db-schema`              | 2026-06-14 | schema + models                                           |
| `packages/db`, `packages/db-mock` | 2026-06-14 | already tight                                             |
| `packages/shared`                 | 2026-06-14 | `takeOne`                                                 |
| `packages/configuration`          | 2026-06-14 | external lists, `global.d.ts`                             |
| `packages/xml2js`                 | 2026-06-14 | `Parser.ts`                                               |
| `packages/parse-tmx`              | 2026-06-14 | `TMXNode.ts`                                              |
| `packages/azure-functions`        | 2026-06-14 | ts-directive comments only                                |

Each pass re-checks only files changed since its unit's date, then bumps it. Greps:

1. `^\s*//.{85,}` over `*.ts`, `*.vue`
2. `\n[ \t]*\n[ \t]*//` multiline (skip `.test.ts`/`.test-d.ts` and the import→body boundary)
3. `/\*` over `*.ts`, `*.vue` (ignore `import.meta.glob`)
4. `<!--` over `*.vue`

Never swept anywhere: 3-line `//` blocks with every line short, `/** */` JSDoc added since the dates above.

Excluded: `app/configuration/plugins/fixAjv.ts` + test (numbered step list is a deliberate reference) · `app/shared/types/nuxt.d.ts`, `app/app/types/desmos.d.ts`, `configuration/types/global.d.ts` (vendored) · `app/util/math/random/getRandomValues.ts`, `db/src/services/azure/table/getTableNullClause.ts` (source-URL references) · `*/rolldown.config.ts`, `@ts-expect-error` / `oxlint-disable` lines (directives).

Enforceable next: comment length and blank-before-comment, via a custom oxlint plugin.
