# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                                                                                              | Swept      | Notes                                                             |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `App/`, `Nuxt/`, `Fragment.vue`, `layouts/`, `App.vue`                                                                            | 2026-09-12 |                                                                   |
| `pages/` + `middleware/` + `plugins/`                                                                                             | 2026-09-14 | only the pages no other row names — a feature row carries its own |
| `app/store` and `app/composables` root files                                                                                      | 2026-09-14 |                                                                   |
| `app/util`, `app/types`, `rules.config.ts`                                                                                        | 2026-09-14 |                                                                   |
| `app/models` less `dungeons`, `message`, `resource` and `resolvers`                                                               | —          |                                                                   |
| `app/models/resolvers`                                                                                                            | —          | the dungeons input and dashboard visual resolvers both sit here   |
| `services/{app,auth,route,router,trpc,notification,google}` + `composables/{data,shared}`                                         | 2026-08-20 |                                                                   |
| `services/{vuetify,styled,entity,zod,ajv,jsonSchema,compiler,shared,azure,cache,file}` + `util/date` + the matching `composables` | 2026-08-20 | `app/services/compiler` is not `shared/services/compiler`         |

`app/components/Styled` belongs to `shared.md`, not here, and `app/models/{dungeons,message,resource}` to the
ledger of the feature that owns them.
