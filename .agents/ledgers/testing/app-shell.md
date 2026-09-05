# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service,
composable and store layers no single feature claims.

| Unit                                                             | Swept      | Notes                                                     |
| ---------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| `composables/data`                                               | 2026-09-05 | one of the two pagination cores                           |
| `composables/shared`                                             | 2026-09-05 | the other pagination core                                 |
| `services/{app,auth,login,google}`                               | 2026-09-05 |                                                           |
| `services/{route,router,notification}`                           | 2026-09-05 |                                                           |
| `services/trpc`                                                  | 2026-09-05 |                                                           |
| `services/{azure,cache}`                                         | 2026-09-05 |                                                           |
| `services/file`                                                  | 2026-09-05 |                                                           |
| `services/{zod,ajv,jsonSchema}`                                  | 2026-09-05 |                                                           |
| `util/date`, `services/compiler`                                 | 2026-09-05 | `app/services/compiler` is not `shared/services/compiler` |
| `services/shared` and its twins                                  | 2026-09-05 |                                                           |
| `services/{styled,entity,vuetify,codemirror}`                    | 2026-09-05 |                                                           |
| `services/docs`, `composables/docs`, `components/{Docs,content}` | 2026-09-05 |                                                           |
| `composables` root files                                         | 2026-09-05 |                                                           |
| `composables/{storage,vuetify,file,notification,cache,azure}`    | 2026-09-05 |                                                           |
| `store` root files, `store/{user,storage}`                       | 2026-09-05 |                                                           |
| `app/models/dungeons`                                            | 2026-09-05 |                                                           |
| `app/models/resource`                                            | 2026-09-05 |                                                           |
| `app/models/message`                                             | 2026-09-05 |                                                           |
| `app/models/{resolvers,shared}`                                  | 2026-09-05 |                                                           |
| `app/models` — its root files and the small folders              | 2026-09-05 |                                                           |
| `app/util`                                                       | 2026-09-05 |                                                           |
| `app/types`                                                      | 2026-09-05 |                                                           |
| `components/{App,Nuxt,Transition}`, `Fragment.vue`, `App.vue`    | 2026-09-05 | `components/index.test.ts` is the auto-import name check  |
| `pages`, `layouts`                                               | 2026-09-05 |                                                           |
| `plugins`, `middleware`                                          | 2026-09-05 |                                                           |
