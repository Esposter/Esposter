# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                                                | Swept | Notes                                                                                           |
| ----------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `app/services/resource`                                                             | —     |                                                                                                 |
| `app/services/message`                                                              | —     |                                                                                                 |
| `app/services/dungeons`                                                             | —     |                                                                                                 |
| `app/services/agentConsole`                                                         | —     |                                                                                                 |
| `app/services` — the rest                                                           | —     | a file is named for its export, and a second map is a second file                               |
| `app/models` — the rest                                                             | —     | the resolver class hierarchies stay models, like the sheet commands                             |
| `app/util`                                                                          | —     | a type-only third-party import is the `util/types` escape, not a `services/` move               |
| `app/types`                                                                         | —     | ambient `.d.ts` only                                                                            |
| `app/composables/resource`                                                          | —     |                                                                                                 |
| `app/composables/message`                                                           | —     |                                                                                                 |
| `app/composables/dungeons`                                                          | —     |                                                                                                 |
| `app/composables` — the rest                                                        | —     | sole-consumer subfolders                                                                        |
| `app/store/message`                                                                 | —     |                                                                                                 |
| `app/store/dungeons`                                                                | —     |                                                                                                 |
| `app/store/resource`                                                                | —     |                                                                                                 |
| `app/store` — the rest                                                              | —     | a store's file is named for its domain, so the filename never matches its `use*Store` export    |
| `app/pages`, `app/layouts`, `app/middleware`, `app/plugins`                         | —     | a route file's name is the router's, and a layout's name is the `NuxtLayout` key                |
| `app/components` — the rest                                                         | —     | `App`, `Dashboard`, `RichTextEditor`, `Achievement`, `FlowchartEditor`, the single-file folders |
| `app/components/Ui`                                                                 | —     |                                                                                                 |
| `app/components/AgentConsole`                                                       | —     |                                                                                                 |
| `app/services/ui`, `app/composables/ui`, `app/store/ui`, `app/models/ui`            | —     |                                                                                                 |
| `app/composables/agentConsole`, `app/store/agentConsole`, `app/models/agentConsole` | —     |                                                                                                 |
