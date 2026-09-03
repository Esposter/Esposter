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
| [testing](testing/)                       | `testing` skill                                        | one tree of suites          | one file per area |
| [trpc](trpc.md)                           | `trpc` skill                                           | one router tree             | dated per tree    |
| [ux](ux.md)                               | `ux` skill                                             | one product area            | dated per area    |
| [vue-components](vue-components.md)       | `vue-page-composition` + `vue` skills                  | one component tree          | dated per tree    |

Still unledgered, and known to be: `pagination`, `typescript` (mostly enforced already), `invariants`,
`runtime-efficiency`, and the product skills (`esbabbler`, `routing`, `slash-commands`, `tiptap`, `vjsf`,
`grapesjs`, `azure-table`, `string-utils`) — each too small for a sitting today, so a finding against one is
raised rather than swept.
