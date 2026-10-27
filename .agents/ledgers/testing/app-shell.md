# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service,
composable and store layers no single feature claims.

| Unit                                                                      | Swept                  | Notes                                                    |
| ------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------- |
| `composables/data`                                                        | 2026-10-26             | one of the two pagination cores                          |
| `composables/shared`                                                      | 2026-10-26             | the other pagination core                                |
| `services/{app,auth,login,google}`                                        | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/{route,router,notification}`                                    | 2026-10-26             |                                                          |
| `services/trpc`                                                           | 2026-10-26             |                                                          |
| `services/{azure,cache}`                                                  | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/file`                                                           | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/{zod,ajv,jsonSchema}`                                           | 2026-10-25 · Haiku 5.5 |                                                          |
| `util/date`                                                               | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/shared`                                                         | 2026-10-25 · Haiku 5.5 |                                                          |
| `services/{styled,entity,codemirror}`                                     | 2026-10-25 · Haiku 5.5 |                                                          |
| `composables` root files                                                  | 2026-10-26             |                                                          |
| `composables/{storage,file,notification,cache,azure}`                     | 2026-10-26             |                                                          |
| `store` root files, `store/{user,storage}`                                | 2026-10-26             |                                                          |
| `app/models/dungeons`                                                     | 2026-10-26             |                                                          |
| `app/models/resource`                                                     | 2026-10-26             |                                                          |
| `app/models/message`                                                      | 2026-10-26             |                                                          |
| `app/models/{resolvers,shared}`                                           | 2026-10-26             |                                                          |
| `app/models` — its root files and the small folders                       | 2026-10-26             |                                                          |
| `app/util`                                                                | 2026-10-25 · Haiku 5.5 |                                                          |
| `app/types`                                                               | 2026-10-26             |                                                          |
| `components/{App,Nuxt,Transition}`, `Fragment.vue`, `App.vue`             | 2026-10-26             | `components/index.test.ts` is the auto-import name check |
| `pages`, `layouts`                                                        | 2026-10-26             |                                                          |
| `plugins`, `middleware`                                                   | 2026-10-26             |                                                          |
| `components/Ui`                                                           | 2026-10-25 · Haiku 5.5 |                                                          |
| `components/AgentConsole`                                                 | 2026-10-26             |                                                          |
| `services/ui`, `composables/ui`, `store/ui`                               | 2026-10-26             |                                                          |
| `services/agentConsole`, `composables/agentConsole`, `store/agentConsole` | 2026-10-26             |                                                          |
