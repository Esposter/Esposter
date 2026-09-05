# Comments

| Unit                                                    | Swept      | Notes                                                     |
| ------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| `packages/app`                                          | —          | components, composables, stores, services, server, shared |
| `packages/azure-functions`                              | —          |                                                           |
| `packages/azure-mock`                                   | —          | filter/search/container mocks                             |
| `packages/configuration`                                | —          | external lists, `global.d.ts`                             |
| `packages/db`, `packages/db-mock`, `packages/db-schema` | —          | schema + models                                           |
| `packages/infra`                                        | —          | event subscriptions, GitHub rulesets                      |
| `packages/parse-tmx`                                    | —          | `TMXNode.ts`                                              |
| `packages/shared`, `packages/shared-node`               | 2026-09-05 | `takeOne`                                                 |
| `packages/virrun`                                       | —          | the WSL mirror prose is the bulk of it                    |
| `packages/vue-phaserjs`                                 | —          | composables, store, models, test setup                    |
| `packages/xml2js`                                       | —          | `Parser.ts`                                               |
| repo root — `scripts/`, `.agents/`, root `*.config.ts`  | —          | workflow scripts and their tests                          |

Greps, per unit:

1. `^\s*//.{85,}` over `*.ts`, `*.vue`
2. `\n[ \t]*\n[ \t]*//` multiline (skip `.test.ts`/`.test-d.ts` and the import→body boundary)
3. `/\*` over `*.ts`, `*.vue` (ignore `import.meta.glob`)
4. `<!--` over `*.vue`
5. `(used to|previously|no longer|formerly|the old |the former |now that |replaces the |we now )` over `//`/`<!--` lines — the history-narration ban. Most hits are present-tense domain uses (`the old manifest`, `no longer resolvable`); what fails is a clause naming what the code replaced.
6. `^\s*/\*\*` — a doc block. It stays only on an exported API surface, and its content obeys every comment rule: a line restating the declaration's own name, or claiming what `implements` and typecheck already prove, earns nothing.
7. A comment sentence that appears **verbatim in more than one file** — sort the `//` lines of the unit, count duplicates, and read every group of two or more. A rationale worth writing at every call site is a convention, and the owning skill already states it; the copies are what go stale. This is rule "never restate an established pattern" applied to the one shape a per-file read cannot see.
8. `^\s*//\s+[A-Z][a-z]+[A-Z][a-zA-Z]+` and `^\s*//\s+(Pnpm|Oxlint|Eslint|Oxfmt|Ctix|Tsdown|Node_modules|Rolldown|Unconfig|Bwrap|Tinybench|Nuxt\.config)\b` over `*.ts`, `*.vue` — an identifier `eslint(capitalized-comments)` capitalized because a wrap put it first on its line. Read every hit: a PascalCase name (`MiniSearch`, `RouterLink`, a component) is correct as it stands and most hits are that, while a camelCase or all-lowercase one (`useEditor`, `structuredClone`, `node_modules`, `pnpm`) is now a name that does not exist. The fix is to rewrap so the line opens on prose — never to lowercase it, which the rule rejects, and never to run `--fix`, which writes the corruption.

Never swept anywhere: 3-line `//` blocks with every line short.

Excluded: `packages/app/configuration/plugins/fixAjv.ts` + test (numbered step list is a deliberate reference) · `packages/app/shared/types/nuxt.d.ts`, `packages/app/app/types/desmos.d.ts`, `packages/configuration/types/global.d.ts`, `packages/vue-phaserjs/auto-imports.d.ts` (vendored/generated) · `packages/app/app/util/math/random/getRandomValues.ts`, `packages/azure/src/services/table/getTableNullClause.ts` (source-URL references) · `*/tsdown.config.ts`, `@ts-expect-error` / `oxlint-disable` lines (directives) · doc blocks copied verbatim from an upstream type (`azure-mock`'s paging interfaces, the Desmos enums) — they are kept diff-identical to their source, same ground as an unimplemented interface stub.

Enforceable next: comment length and blank-before-comment, via a custom oxlint plugin — oxlint excludes layout rules by design, so this needs a JS plugin rather than a stock rule. SFC block padding already went to `vue/padding-line-between-blocks`. Grep 8 wants the same plugin and is the stronger candidate, because it is the one rule here whose violations another rule's `--fix` actively creates: the plugin knows a wrapped line's opening word and can check it against the identifiers in scope, which a grep can only approximate.
