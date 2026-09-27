# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.

| Unit                                                                                                                      | Swept | Notes |
| ------------------------------------------------------------------------------------------------------------------------- | ----- | ----- |
| `App/`, `Nuxt/`, `Fragment.vue`, `layouts/`, `App.vue`                                                                    | —     |       |
| `pages/` + `middleware/` + `plugins/`                                                                                     | —     |       |
| `app/store` and `app/composables` root files                                                                              | —     |       |
| `app/util`, `app/types`                                                                                                   | —     |       |
| `app/models` less `dungeons`, `message`, `resource` and `resolvers`                                                       | —     |       |
| `app/models/resolvers`                                                                                                    | —     |       |
| `services/{app,auth,route,router,trpc,notification,google}` + `composables/{data,shared}`                                 | —     |       |
| `services/{styled,entity,zod,ajv,jsonSchema,compiler,shared,azure,cache,file}` + `util/date` + the matching `composables` | —     |       |
| `Ui/`                                                                                                                     | —     |       |
| `AgentConsole/`                                                                                                           | —     |       |
| `services/ui` + `composables/ui` + `store/ui`                                                                             | —     |       |
| `services/agentConsole` + `composables/agentConsole` + `store/agentConsole`                                               | —     |       |

`app/components/Styled` belongs to `shared.md`, not here, and `app/models/{dungeons,message,resource}` to the
ledger of the feature that owns them.
