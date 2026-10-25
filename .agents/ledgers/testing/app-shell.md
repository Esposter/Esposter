# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service,
composable and store layers no single feature claims.

| Unit                                                                      | Swept                  | Notes                                                    |
| ------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------- |
| `composables/data`                                                        | —                      | one of the two pagination cores                          |
| `composables/shared`                                                      | —                      | the other pagination core                                |
| `services/{app,auth,login,google}`                                        | —                      |                                                          |
| `services/{route,router,notification}`                                    | —                      |                                                          |
| `services/trpc`                                                           | —                      |                                                          |
| `services/{azure,cache}`                                                  | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/file`                                                           | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/{zod,ajv,jsonSchema}`                                           | 2026-10-25 · Haiku 5.5 |                                                          |
| `util/date`                                                               | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/shared`                                                         | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/{styled,entity,codemirror}`                                     | 2026-10-25 · Haiku 5.5 |                                                          |
| `composables` root files                                                  | —                      |                                                          |
| `composables/{storage,file,notification,cache,azure}`                     | —                      |                                                          |
| `store` root files, `store/{user,storage}`                                | —                      |                                                          |
| `app/models/dungeons`                                                     | —                      |                                                          |
| `app/models/resource`                                                     | —                      |                                                          |
| `app/models/message`                                                      | —                      |                                                          |
| `app/models/{resolvers,shared}`                                           | —                      |                                                          |
| `app/models` — its root files and the small folders                       | —                      |                                                          |
| `app/util`                                                                | 2026-10-25 · Haiku 5.5 |                                                          |
| `app/types`                                                               | —                      |                                                          |
| `components/{App,Nuxt,Transition}`, `Fragment.vue`, `App.vue`             | —                      | `components/index.test.ts` is the auto-import name check |
| `pages`, `layouts`                                                        | —                      |                                                          |
| `plugins`, `middleware`                                                   | —                      |                                                          |
| `components/Ui`                                                           | 2026-10-25 · Haiku 5.5 |                                                          |
| `components/AgentConsole`                                                 | —                      |                                                          |
| `services/ui`, `composables/ui`, `store/ui`                               | —                      |                                                          |
| `services/agentConsole`, `composables/agentConsole`, `store/agentConsole` | —                      |                                                          |
