# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service,
composable and store layers no single feature claims.

| Unit                                                                      | Swept | Notes                                                    |
| ------------------------------------------------------------------------- | ----- | -------------------------------------------------------- |
| `composables/data`                                                        | —     | one of the two pagination cores                          |
| `composables/shared`                                                      | —     | the other pagination core                                |
| `services/{app,auth,login,google}`                                        | —     |                                                          |
| `services/{route,router,notification}`                                    | —     |                                                          |
| `services/trpc`                                                           | —     |                                                          |
| `services/{azure,cache}`                                                  | —     |                                                          |
| `services/file`                                                           | —     |                                                          |
| `services/{zod,ajv,jsonSchema}`                                           | —     |                                                          |
| `util/date`                                                               | —     |                                                          |
| `services/shared`                                                         | —     |                                                          |
| `services/{styled,entity,codemirror}`                                     | —     |                                                          |
| `composables` root files                                                  | —     |                                                          |
| `composables/{storage,file,notification,cache,azure}`                     | —     |                                                          |
| `store` root files, `store/{user,storage}`                                | —     |                                                          |
| `app/models/dungeons`                                                     | —     |                                                          |
| `app/models/resource`                                                     | —     |                                                          |
| `app/models/message`                                                      | —     |                                                          |
| `app/models/{resolvers,shared}`                                           | —     |                                                          |
| `app/models` — its root files and the small folders                       | —     |                                                          |
| `app/util`                                                                | —     |                                                          |
| `app/types`                                                               | —     |                                                          |
| `components/{App,Nuxt,Transition}`, `Fragment.vue`, `App.vue`             | —     | `components/index.test.ts` is the auto-import name check |
| `pages`, `layouts`                                                        | —     |                                                          |
| `plugins`, `middleware`                                                   | —     |                                                          |
| `components/Ui`                                                           | —     |                                                          |
| `components/AgentConsole`                                                 | —     |                                                          |
| `services/ui`, `composables/ui`, `store/ui`                               | —     |                                                          |
| `services/agentConsole`, `composables/agentConsole`, `store/agentConsole` | —     |                                                          |
