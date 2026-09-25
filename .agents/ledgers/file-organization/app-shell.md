# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                        | Swept                 | Notes                                                                                           |
| ----------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| `app/services/resource`                                     | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/services/message`                                      | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/services/dungeons`                                     | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/services/agentConsole`                                 | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/services` — the rest                                   | 2026-09-25 · Opus 5.5 | a file is named for its export, and a second map is a second file                               |
| `app/models` — the rest                                     | 2026-09-25 · Opus 5.5 | the resolver class hierarchies stay models, like the sheet commands                             |
| `app/util`                                                  | 2026-09-25 · Opus 5.5 | a type-only third-party import is the `util/types` escape, not a `services/` move               |
| `app/types`                                                 | 2026-09-25 · Opus 5.5 | ambient `.d.ts` only                                                                            |
| `app/composables/resource`                                  | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/composables/message`                                   | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/composables/dungeons`                                  | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/composables` — the rest                                | 2026-09-25 · Opus 5.5 | sole-consumer subfolders                                                                        |
| `app/store/message`                                         | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/store/dungeons`                                        | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/store/resource`                                        | 2026-09-25 · Opus 5.5 |                                                                                                 |
| `app/store` — the rest                                      | 2026-09-25 · Opus 5.5 | a store's file is named for its domain, so the filename never matches its `use*Store` export    |
| `app/pages`, `app/layouts`, `app/middleware`, `app/plugins` | 2026-09-25 · Opus 5.5 | a route file's name is the router's, and a layout's name is the `NuxtLayout` key                |
| `app/components` — the rest                                 | 2026-09-25 · Opus 5.5 | `App`, `Dashboard`, `RichTextEditor`, `Achievement`, `FlowchartEditor`, the single-file folders |
