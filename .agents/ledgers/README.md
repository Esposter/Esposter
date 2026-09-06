# Ledgers

Progress state for sweeps in flight. What a sweep is and how one is run: the `sweeps` skill.

`Scope` is the sweep's domain as git pathspecs — where its convention applies, which is not the same as where it
has rows yet. It is what the standing-resume command takes; why it is written this way, and what holds it honest,
are the `sweeps` skill's `references/standing-resume.md`.

| Ledger                                    | Rules                                                  | Unit                        | Scope                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [browser-boundary](browser-boundary.md)   | `/docs/architecture/browser-execution`                 | one `app/` tree             | `packages/app/app`                                                                                           |
| [comments](comments.md)                   | `formatting` skill                                     | one package                 | `packages` `scripts`                                                                                         |
| [docs](docs.md)                           | `docs` + `readme-standards` + `skill-authoring` skills | one docs area or skill tree | `packages/app/content/docs` `.agents/skills` `*README.md` `AGENTS.md` `CONTRIBUTING.md` `SCORE.md`           |
| [error-handling](error-handling.md)       | `error-handling` skill                                 | one tree                    | `packages` `scripts`                                                                                         |
| [file-organization](file-organization.md) | `file-organization` skill                              | one package or tree         | `packages` `scripts`                                                                                         |
| [naming](naming.md)                       | `naming` skill                                         | one tree                    | `packages` `scripts`                                                                                         |
| [pinia](pinia.md)                         | `pinia` skill                                          | one store tree              | `packages/app/app/store`                                                                                     |
| [quality](quality/)                       | `code-review` skill — quality lane                     | one area                    | `.`                                                                                                          |
| [schemas](schemas.md)                     | `zod` + `drizzle` skills                               | one schema tree             | `packages/db-schema` `packages/db` `packages/db-mock` `packages/app/shared/models` `packages/app/app/models` |
| [styling](styling.md)                     | `styling` + `unocss` + `vuetify` + `responsive` skills | one component tree          | `packages/app/app/components` `packages/app/app/pages` `packages/app/app/layouts` `packages/app/app/assets`  |
| [testing](testing/)                       | `testing` skill                                        | one tree of suites          | `*.test.ts` `*.test-d.ts` `*.bench.ts`                                                                       |
| [trpc](trpc.md)                           | `trpc` skill                                           | one router tree             | `packages/app/server/trpc`                                                                                   |
| [ux](ux.md)                               | `ux` skill                                             | one product area            | `packages/app/app/components` `packages/app/app/pages`                                                       |
| [vue-components](vue-components.md)       | `vue-page-composition` + `vue` skills                  | one component tree          | `packages/app/app/components` `packages/app/app/pages` `packages/app/app/layouts`                            |

Two scopes are deliberately the whole tree rather than a list. The quality lane reads any code, so narrowing it
would only hide the areas nobody has looked at; `testing` is scoped by filename because a suite sits beside
whatever it tests rather than in a tree of its own.

Still unledgered, and known to be: `pagination`, `typescript` (mostly enforced already), `invariants`,
`runtime-efficiency`, and the product skills (`esbabbler`, `routing`, `slash-commands`, `tiptap`, `vjsf`,
`grapesjs`, `azure-table`, `string-utils`) — each too small for a sitting today, so a finding against one is
raised rather than swept.
