# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                                                | Swept                  | Notes                                                                                           |
| ----------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| `app/services/resource` — the files at its root                                     | 2026-10-26             |                                                                                                 |
| `app/services/resource/activity`                                                    | 2026-10-26             |                                                                                                 |
| `app/services/resource/blueprint`                                                   | 2026-10-26             |                                                                                                 |
| `app/services/resource/list`                                                        | 2026-10-26             |                                                                                                 |
| `app/services/resource/note`                                                        | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/services/resource/program`                                                     | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/services/resource/search`                                                      | 2026-10-26             |                                                                                                 |
| `app/services/resource/sheet`                                                       | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/services/resource/survey`                                                      | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/services/resource/tag`                                                         | 2026-10-26             |                                                                                                 |
| `app/services/resource/todoList`                                                    | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/services/message`                                                              | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/services/dungeons`                                                             | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/services/agentConsole`                                                         | 2026-10-26             |                                                                                                 |
| `app/services` — the rest                                                           | 2026-10-26             | a file is named for its export, and a second map is a second file                               |
| `app/models` — the rest                                                             | 2026-10-26             | the resolver class hierarchies stay models, like the sheet commands                             |
| `app/util`                                                                          | 2026-10-25 · Haiku 5.5 | a type-only third-party import is the `util/types` escape, not a `services/` move               |
| `app/types`                                                                         | 2026-10-26             | ambient `.d.ts` only                                                                            |
| `app/composables/resource`                                                          | 2026-10-26             |                                                                                                 |
| `app/composables/message`                                                           | 2026-10-26             |                                                                                                 |
| `app/composables/dungeons`                                                          | 2026-10-26             |                                                                                                 |
| `app/composables` — the rest                                                        | 2026-10-26             | sole-consumer subfolders                                                                        |
| `app/store/message`                                                                 | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/store/dungeons`                                                                | 2026-10-25 · Haiku 5.5 |                                                                                                 |
| `app/store/resource`                                                                | 2026-10-26             |                                                                                                 |
| `app/store` — the rest                                                              | 2026-10-26             | a store's file is named for its domain, so the filename never matches its `use*Store` export    |
| `app/pages`, `app/layouts`, `app/middleware`, `app/plugins`                         | 2026-10-26             | a route file's name is the router's, and a layout's name is the `NuxtLayout` key                |
| `app/components` — the rest                                                         | 2026-10-26             | `App`, `Dashboard`, `RichTextEditor`, `Achievement`, `FlowchartEditor`, the single-file folders |
| `app/components/Ui`                                                                 | 2026-10-26             |                                                                                                 |
| `app/components/AgentConsole`                                                       | 2026-10-26             |                                                                                                 |
| `app/services/ui`                                                                   | 2026-10-29 · Haiku 5.5 |                                                                                                 |
| `app/composables/ui`                                                                | 2026-10-29 · Haiku 5.5 |                                                                                                 |
| `app/store/ui`                                                                      | 2026-10-29 · Haiku 5.5 |                                                                                                 |
| `app/models/ui`                                                                     | 2026-10-29 · Haiku 5.5 |                                                                                                 |
| `app/composables/agentConsole`, `app/store/agentConsole`, `app/models/agentConsole` | 2026-10-26             |                                                                                                 |
