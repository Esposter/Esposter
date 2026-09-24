# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                         | Swept               | Notes                                                                                           |
| ---------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| `app/services/resource`      | —                   |                                                                                                 |
| `app/services/message`       | —                   |                                                                                                 |
| `app/services/dungeons`      | —                   |                                                                                                 |
| `app/services/agentConsole`  | —                   |                                                                                                 |
| `app/services` — the rest    | —                   | a file is named for its export, and a second map is a second file                               |
| `app/models` — the rest      | 2026-09-22 · Opus 5 | the resolver class hierarchies stay models, like the sheet commands                             |
| `app/util`                   | 2026-09-22 · Opus 5 | a type-only third-party import is the `util/types` escape, not a `services/` move               |
| `app/types`                  | 2026-09-22 · Opus 5 | ambient `.d.ts` only                                                                            |
| `app/composables/resource`   | —                   |                                                                                                 |
| `app/composables/message`    | —                   |                                                                                                 |
| `app/composables/dungeons`   | —                   |                                                                                                 |
| `app/composables` — the rest | —                   | sole-consumer subfolders                                                                        |
| `app/store/message`          | —                   |                                                                                                 |
| `app/store/dungeons`         | —                   |                                                                                                 |
| `app/store/resource`         | —                   |                                                                                                 |
| `app/store` — the rest       | —                   | a store's file is named for its domain, so the filename never matches its `use*Store` export    |
| `app/components` — the rest  | 2026-09-22 · Opus 5 | `App`, `Dashboard`, `RichTextEditor`, `Achievement`, `FlowchartEditor`, the single-file folders |
