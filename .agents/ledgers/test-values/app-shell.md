# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service,
composable and store layers no single feature claims.

| Unit                                                             | Swept      | Notes                                                     |
| ---------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| `composables/data`                                               | 2026-09-22 | one of the two pagination cores                           |
| `composables/shared`                                             | 2026-09-22 | the other pagination core                                 |
| `services/{app,auth,login,google}`                               | 2026-09-22 |                                                           |
| `services/{route,router,notification}`                           | 2026-09-22 |                                                           |
| `services/trpc`                                                  | 2026-09-22 |                                                           |
| `services/{azure,cache}`                                         | 2026-09-22 |                                                           |
| `services/file`                                                  | 2026-09-22 |                                                           |
| `services/{zod,ajv,jsonSchema}`                                  | 2026-09-22 |                                                           |
| `util/date`, `services/compiler`                                 | 2026-09-22 | `app/services/compiler` is not `shared/services/compiler` |
| `services/shared`                                                | 2026-09-22 |                                                           |
| `services/{styled,entity,vuetify,codemirror}`                    | 2026-09-22 |                                                           |
| `services/docs`, `composables/docs`, `components/{Docs,content}` | 2026-09-22 |                                                           |
| `composables` root files                                         | 2026-09-22 |                                                           |
| `composables/{storage,vuetify,file,notification,cache,azure}`    | 2026-09-22 |                                                           |
| `store` root files, `store/{user,storage}`                       | 2026-09-22 |                                                           |
| `app/models/dungeons`                                            | 2026-09-22 |                                                           |
| `app/models/resource`                                            | 2026-09-22 |                                                           |
| `app/models/message`                                             | 2026-09-22 |                                                           |
| `app/models/{resolvers,shared}`                                  | 2026-09-22 |                                                           |
| `app/models` — its root files and the small folders              | 2026-09-22 |                                                           |
| `app/util`                                                       | 2026-09-22 |                                                           |
| `app/types`                                                      | 2026-09-22 |                                                           |
| `components/{App,Nuxt,Transition}`, `Fragment.vue`, `App.vue`    | 2026-09-22 |                                                           |
| `pages`, `layouts`                                               | 2026-09-22 |                                                           |
| `plugins`, `middleware`                                          | 2026-09-22 |                                                           |
