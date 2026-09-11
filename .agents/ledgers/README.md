# Ledgers

Progress state for sweeps in flight. What a sweep is and how one is run: the `sweeps` skill.

`Scope` is the sweep's domain as git pathspecs — where its convention applies, which is not the same as where it
has rows yet. It is what the standing-resume command takes; why it is written this way, and what holds it honest,
are the `sweeps` skill's `references/standing-resume.md`.

| Ledger                                                | Rules                                                  | Unit                        | Scope                                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| [bench](bench.md)                                     | `bench` skill                                          | one package that benches    | `*.bench.ts`                                                                                         |
| [browser-boundary](browser-boundary.md)               | `/docs/architecture/browser-execution`                 | one `app/` tree             | `apps/web/app`                                                                                       |
| [comments](comments.md)                               | `formatting` skill                                     | one package                 | `apps` `packages` `scripts` `.agents` `*.config.ts`                                                  |
| [docs](docs.md)                                       | `docs` + `readme-standards` + `skill-authoring` skills | one docs area or skill tree | `apps/web/content/docs` `.agents/skills` `*README.md` `AGENTS.md` `CONTRIBUTING.md` `SCORE.md`       |
| [embedded-recipes](embedded-recipes.md)               | `skill-authoring` skill                                | one markdown tree           | `.agents` `apps/web/content/docs` `*.md`                                                             |
| [error-handling](error-handling.md)                   | `error-handling` skill                                 | one tree                    | `apps` `packages` `scripts`                                                                          |
| [file-organization](file-organization.md)             | `file-organization` skill                              | one package or tree         | `apps` `packages` `scripts`                                                                          |
| [naming](naming.md)                                   | `naming` skill                                         | one tree                    | `apps` `packages` `scripts`                                                                          |
| [pinia](pinia.md)                                     | `pinia` skill                                          | one store tree              | `apps/web/app/store`                                                                                 |
| [quality](quality/)                                   | `code-review` skill — quality lane                     | one area                    | `.`                                                                                                  |
| [schemas](schemas.md)                                 | `zod` + `drizzle` skills                               | one schema tree             | `packages/db-schema` `packages/db` `packages/db-mock` `apps/web/shared/models` `apps/web/app/models` |
| [styling](styling.md)                                 | `styling` + `unocss` + `vuetify` + `responsive` skills | one component tree          | `apps/web/app/components` `apps/web/app/pages` `apps/web/app/layouts` `apps/web/app/assets`          |
| [testing](testing/)                                   | `testing` skill                                        | one tree of suites          | `*.test.ts` `*.test-d.ts` `*.bench.ts`                                                               |
| [trpc](trpc.md)                                       | `trpc` skill                                           | one router tree             | `apps/web/server/trpc`                                                                               |
| [typescript](typescript.md)                           | `typescript` skill                                     | one tree                    | `apps` `packages` `scripts`                                                                          |
| [ux](ux.md)                                           | `ux` skill                                             | one product area            | `apps/web/app/components` `apps/web/app/pages`                                                       |
| [vue-components](vue-components.md)                   | `vue-page-composition` + `vue` skills                  | one component tree          | `apps/web/app/components` `apps/web/app/pages` `apps/web/app/layouts`                                |
| [vue-composable-patterns](vue-composable-patterns.md) | `vue-composable-patterns` skill                        | one composable tree         | `apps/web/app/composables` `apps/web/app/store`                                                      |

Three scopes are deliberately not a directory list. The quality lane reads any code, so narrowing it
would only hide the areas nobody has looked at; `testing` is scoped by filename because a suite sits beside
whatever it tests rather than in a tree of its own — as does `bench`, which reads the same files for a different
question: `testing` asks whether the file is a well-formed suite, `bench` whether the measurement is honest.

Still unledgered, and known to be: `pagination`, `invariants`, `runtime-efficiency`, and the product skills
(`esbabbler`, `routing`, `slash-commands`, `tiptap`, `vjsf`, `grapesjs`, `azure-table`, `string-utils`) — each
too small for a sitting today, so a finding against one is raised rather than swept.
