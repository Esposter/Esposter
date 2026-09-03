# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                                                                                              | Swept      | Notes                                                             |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `App/`, `Nuxt/`, `Fragment.vue`, `layouts/`, `App.vue`                                                                            | 2026-08-20 |                                                                   |
| `pages/` + `middleware/` + `plugins/`                                                                                             | 2026-08-20 | only the pages no other row names — a feature row carries its own |
| `app/store` and `app/composables` root files, `app/util`, `app/models`, `app/types`, `rules.config.ts`                            | 2026-08-20 |                                                                   |
| `services/{app,auth,route,router,trpc,notification,google}` + `composables/{data,shared}`                                         | 2026-08-20 |                                                                   |
| `services/{vuetify,styled,entity,zod,ajv,jsonSchema,compiler,shared,azure,cache,file}` + `util/date` + the matching `composables` | 2026-08-20 | `app/services/compiler` is not `shared/services/compiler`         |

`app/components/Styled` belongs to `shared.md`, not here.
