# Comments

| Unit                                                   | Swept      | Notes                                                    |
| ------------------------------------------------------ | ---------- | -------------------------------------------------------- |
| `packages/app` — `app/components`                      | 2026-09-05 | the densest prose in the app                             |
| `packages/app` — `app/services`, `app/util`            | 2026-09-05 | the separator and alerting rules, restated per call site |
| `packages/app` — `app/composables/message`             | 2026-09-05 | the file, room and subscribable trees                    |
| `packages/app` — the rest of `app/composables`         | 2026-09-05 | the pagination binder and readiness rules, per call site |
| `packages/app` — `app/models`, `app/types`             | 2026-09-05 | the dungeons tree's legacy prose                         |
| `packages/app` — `app/store`                           | 2026-09-05 | the rollback rationale, restated per call site           |
| `packages/app` — `app/pages`, `layouts`, the rest      | 2026-09-05 | plus `middleware`, `plugins`, `assets`                   |
| `packages/app` — `server/trpc`                         | —          |                                                          |
| `packages/app` — the rest of `server`                  | —          | services, routes, plugins                                |
| `packages/app` — `shared`                              | —          |                                                          |
| `packages/app` — `configuration`, `content`            | 2026-09-05 | CSP labels, Nuxt config prose                            |
| `packages/azure-functions` — `handlers`                | 2026-09-05 | the densest prose in the package                         |
| `packages/azure-functions` — `services`, the rest      | 2026-09-05 | plus `functions`, `hooks`, `models`, `index.test.ts`     |
| `packages/azure-mock`                                  | 2026-09-05 | filter/search/container mocks                            |
| `packages/configuration`                               | 2026-09-05 | external lists, `global.d.ts`                            |
| `packages/db-mock`                                     | 2026-09-05 |                                                          |
| `packages/db` — `services/azure`                       | 2026-09-05 | table, container and event-grid helpers                  |
| `packages/db` — `services/message`                     | 2026-09-05 | moderation, threads, mentions                            |
| `packages/db` — the rest of `services`, `models`       | 2026-09-05 | notification, resource, room, storage                    |
| `packages/db-schema` — `models`                        | 2026-09-05 | entity classes, Azure payloads                           |
| `packages/db-schema` — `schema`, `relations`           | 2026-09-05 | tables and their v2 relations                            |
| `packages/db-schema` — `services`, package root        | 2026-09-05 | `schema.test.ts`, `pgTable.ts`                           |
| `packages/infra`                                       | 2026-09-05 | event subscriptions, GitHub rulesets                     |
| `packages/parse-tmx`                                   | 2026-09-05 | `TMXNode.ts`                                             |
| `packages/shared`, `packages/shared-node`              | 2026-09-05 | `takeOne`                                                |
| `packages/virrun` — `models`, package root             | 2026-09-05 |                                                          |
| `packages/virrun` — `services/cli`, `configuration`    | 2026-09-05 | plus `source`, `vfs`, `virrun`                           |
| `packages/virrun` — `services/exec/wsl`                | 2026-09-05 | the mirror prose is the bulk of the package              |
| `packages/virrun` — `services/exec/snapshot`           | 2026-09-05 | layers, leases, overlay capture                          |
| `packages/virrun` — `services/exec/util`               | 2026-09-05 |                                                          |
| `packages/virrun` — the rest of `services/exec`        | 2026-09-05 | bwrap, cache, differential, native, os, store, test, vfs |
| `packages/vue-phaserjs`                                | 2026-09-05 | composables, store, models, test setup                   |
| `packages/xml2js`                                      | 2026-09-05 | `Parser.ts`                                              |
| repo root — `scripts/`, `.agents/`, root `*.config.ts` | 2026-09-05 | workflow scripts and their tests                         |

Greps, per unit:

1. `^\s*//.{85,}` over `*.ts`, `*.vue`
2. `\n[ \t]*\n[ \t]*//` multiline (skip `.test.ts`/`.test-d.ts` and the import→body boundary)
3. `/\*` over `*.ts`, `*.vue` (ignore `import.meta.glob`)
4. `<!--` over `*.vue`
5. `(used to|previously|no longer|formerly|the old |the former |now that |replaces the |we now )` over `//`/`<!--` lines — the history-narration ban. Most hits are present-tense domain uses (`the old manifest`, `no longer resolvable`); what fails is a clause naming what the code replaced.
6. `^\s*/\*\*` — a doc block. It stays only on an exported API surface, and its content obeys every comment rule: a line restating the declaration's own name, or claiming what `implements` and typecheck already prove, earns nothing.
7. A comment sentence that appears **verbatim in more than one file** — sort the `//` lines of the unit, count duplicates, and read every group of two or more. A rationale worth writing at every call site is a convention, and the owning skill already states it; the copies are what go stale. This is rule "never restate an established pattern" applied to the one shape a per-file read cannot see.
8. `^\s*//\s+[A-Z][a-z]+[A-Z][a-zA-Z]+` and `^\s*//\s+(Pnpm|Oxlint|Eslint|Oxfmt|Ctix|Tsdown|Node_modules|Rolldown|Unconfig|Bwrap|Tinybench|Xlsx|Happy-dom|Nuxt\.config)\b` over `*.ts`, `*.vue` — an identifier `eslint(capitalized-comments)` capitalized because a wrap put it first on its line. Read every hit: a PascalCase name (`MiniSearch`, `RouterLink`, a component) is correct as it stands and most hits are that, while a camelCase or all-lowercase one (`useEditor`, `structuredClone`, `node_modules`, `pnpm`) is now a name that does not exist. The fix is to rewrap so the line opens on prose — never to lowercase it, which the rule rejects, and never to run `--fix`, which writes the corruption. The second alternation is a shape the first cannot express: a mangled **acronym** (`Sdk`, `Sas`) has no internal capital for that pattern to anchor on, and reads as a typo rather than as a name that went missing. A common noun a wrap capitalized (`Url`, `Sub-delimiters`) is correct as it stands and is not this. Re-read the joined sentence after every rewrap — the prose put in front of the identifier has to agree with the line above it, and a repeated article or a dropped object is what this fix leaves behind (`formatting`).

Never swept anywhere: 3-line `//` blocks with every line short.

Excluded: `packages/app/configuration/plugins/fixAjv.ts` + test (numbered step list is a deliberate reference) · `packages/app/shared/types/nuxt.d.ts`, `packages/app/app/types/desmos.d.ts`, `packages/configuration/types/global.d.ts`, `packages/vue-phaserjs/auto-imports.d.ts` (vendored/generated) · `packages/app/app/util/math/random/getRandomValues.ts`, `packages/azure/src/services/table/getTableNullClause.ts` (source-URL references) · `*/tsdown.config.ts`, `@ts-expect-error` / `oxlint-disable` lines (directives) · doc blocks copied verbatim from an upstream type (`azure-mock`'s paging interfaces, the Desmos enums) — they are kept diff-identical to their source, same ground as an unimplemented interface stub.

Enforceable next: comment length and blank-before-comment, via a custom oxlint plugin — oxlint excludes layout rules by design, so this needs a JS plugin rather than a stock rule. SFC block padding already went to `vue/padding-line-between-blocks`. Grep 8 wants the same plugin and is the stronger candidate, because it is the one rule here whose violations another rule's `--fix` actively creates: the plugin knows a wrapped line's opening word and can check it against the identifiers in scope, which a grep can only approximate.
