# Rule Routing

Read once the window is chosen, before reading it: which skills its files make you load.

The conventions a finding cites live in the domain skills, not here — restating them would give this page a second copy to drift. What this page owns is the routing: **read the window's file list first, load only the rows it hits.**

| The window contains                      | Load                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `.vue`, or anything rendering            | `vue`, `vue-component-patterns`, `vue-page-composition`, `ui-library`, `styling`, `responsive`, `ux`     |
| `apps/web/app/store/**`                  | `pinia`                                                                                                  |
| `apps/web/app/composables/**`            | `vue-composable-patterns`, `pagination`                                                                  |
| `apps/web/server/trpc/**`                | `trpc`, `error-handling`                                                                                 |
| a query, a handler, a fan-out, a script  | `runtime-efficiency`                                                                                     |
| `packages/db-schema/**`, a migration     | `drizzle`                                                                                                |
| a Zod schema                             | `zod`                                                                                                    |
| an `@TODO`                               | `todos`                                                                                                  |
| `apps/infra/**`                          | `pulumi-infra`                                                                                           |
| `apps/functions/**`, an Azure Table read | `error-handling`, `azure-table`                                                                          |
| a manifest, `tsdown.config.ts`, tsconfig | `build`, `dependency-updates`                                                                            |
| `.github/**`                             | `github-actions`                                                                                         |
| `*.test.ts`, `*.test-d.ts`, `*.bench.ts` | `testing`, `test-values`, `bench`                                                                        |
| `apps/web/content/docs/**`               | `docs`                                                                                                   |
| `.agents/skills/**`                      | `skill-authoring`                                                                                        |
| `.agents/ledgers/**`                     | `sweeps`                                                                                                 |
| `README.md`                              | `readme-standards`                                                                                       |
| lint or tooling config                   | `oxlint`, `package-scripts`                                                                              |
| any file at all                          | `naming`, `typescript`, `formatting`, `file-organization`, `over-engineering`, `fallacies`, `invariants` |

The last row is the floor, not a default — those seven apply to every file in every window. A row you loaded and found nothing against is a result; say so rather than omitting it.
