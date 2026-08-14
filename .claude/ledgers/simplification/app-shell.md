# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                                                                                      | Swept | Notes                                                                     |
| ------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------- |
| `App/`, `Nuxt/`, `Fragment.vue`, `layouts/`, `App.vue`                                                                    | —     |                                                                           |
| `pages/` + `middleware/` + `plugins/`                                                                                     | —     | The pages of swept features too — no ledger row has ever covered `pages/` |
| `app/store` and `app/composables` root files, `app/util`, `app/models`, `app/types`, `rules.config.ts`                    | —     |                                                                           |
| `services/{app,auth,route,router,trpc,notification,google}` + `composables/{data,shared}`                                 | —     |                                                                           |
| `services/{vuetify,styled,entity,zod,ajv,jsonSchema,dayjs,compiler,shared,azure,cache,file}` + the matching `composables` | —     | `app/services/compiler` is not the swept `shared/services/compiler`       |

`app/components/Styled` was swept on 2026-08-11 (`shared.md`) and is not in scope here.
