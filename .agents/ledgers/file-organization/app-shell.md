# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                        | Swept      | Notes                                                                                           |
| --------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `app/services`              | 2026-09-22 | a file is named for its export, and a second map is a second file                               |
| `app/models` — the rest     | 2026-09-22 | the resolver class hierarchies stay models, like the sheet commands                             |
| `app/util`                  | 2026-09-22 | a type-only third-party import is the `util/types` escape, not a `services/` move               |
| `app/types`                 | 2026-09-22 | ambient `.d.ts` only                                                                            |
| `app/composables`           | 2026-09-22 | sole-consumer subfolders                                                                        |
| `app/store`                 | 2026-09-22 | a store's file is named for its domain, so the filename never matches its `use*Store` export    |
| `app/components` — the rest | 2026-09-22 | `App`, `Dashboard`, `RichTextEditor`, `Achievement`, `FlowchartEditor`, the single-file folders |
