# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                                                                                      | Swept      | Notes                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| `App/`, `Nuxt/`, `Fragment.vue`, `layouts/`, `App.vue`                                                                    | 2026-08-15 | the app menu button dropped its hand-rolled activator chain for `StyledTooltipMenuIconButton`          |
| `pages/` + `middleware/` + `plugins/`                                                                                     | 2026-08-15 | Only the pages no other row names — a feature row carries its own; near-empty, one bare-reference hook |
| `app/store` and `app/composables` root files, `app/util`, `app/models`, `app/types`, `rules.config.ts`                    | —          |                                                                                                        |
| `services/{app,auth,route,router,trpc,notification,google}` + `composables/{data,shared}`                                 | —          |                                                                                                        |
| `services/{vuetify,styled,entity,zod,ajv,jsonSchema,dayjs,compiler,shared,azure,cache,file}` + the matching `composables` | —          | `app/services/compiler` is not the swept `shared/services/compiler`                                    |

`app/components/Styled` was swept on 2026-08-11 (`shared.md`) and is not in scope here.
