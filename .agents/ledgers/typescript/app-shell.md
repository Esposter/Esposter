# App Shell

| Unit                                                                                   | Swept                  | Notes                                                                                           |
| -------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| `app/store` — the top level                                                            | 2026-10-29 · Haiku 5.5 |                                                                                                 |
| `app/composables/shared`, `data`, `cache`                                              | 2026-10-29 · Haiku 5.5 | the read and mutation primitives every other tree builds on                                     |
| `app/composables` — the one-composable trees and the top level                         | 2026-10-29 · Haiku 5.5 | achievement, dataset, desmos, emailEditor, pageBuilder, notification, phaser, storage           |
| `app/services/shared`                                                                  | 2026-10-29 · Haiku 5.5 |                                                                                                 |
| `app/services/file`, `jsonSchema`                                                      | 2026-10-29 · Haiku 5.5 |                                                                                                 |
| `app/services/cache`, `app`, `trpc`, `zod`, `entity`                                   | 2026-10-29 · Haiku 5.5 |                                                                                                 |
| `app/services` — the one-service trees                                                 | —                      | visual, user, survey, notification, about, styled, router, route, room, login, desmos, compiler |
| `app/util`                                                                             | —                      |                                                                                                 |
| `app/models/resolvers`                                                                 | —                      |                                                                                                 |
| `app/models/shared`, `desmos`                                                          | —                      |                                                                                                 |
| `app/models/cache`, `docs`                                                             | —                      |                                                                                                 |
| `app/models/user`, `math`, `clicker`, `achievement`, `visual`, `sound`, `notification` | —                      |                                                                                                 |
| `app/models` — the one-model trees                                                     | —                      | file, entity, colors, trpc, post, pagination, pageBuilder, db, dataset, dashboard               |
| `app/components/App`                                                                   | —                      |                                                                                                 |
| `app/components` — the rest                                                            | —                      | Anime, Nuxt, Dataset, About, Login, content, Transition and the top level                       |
| `app/pages` — the top level and the rest                                               | —                      | post, user, calls, view, docs                                                                   |
| `app/layouts`                                                                          | —                      |                                                                                                 |
| `app/components/Ui`                                                                    | —                      |                                                                                                 |
| `app/services/ui`, `app/composables/ui`, `app/store/ui`, `app/models/ui`               | —                      |                                                                                                 |
