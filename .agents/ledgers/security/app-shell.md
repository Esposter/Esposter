# App Shell

| Unit                                                                                                            | Swept | Notes |
| --------------------------------------------------------------------------------------------------------------- | ----- | ----- |
| `App/`, `Nuxt/`, `layouts/`, `App.vue`                                                                          | —     |       |
| `pages/` + `middleware/` + `plugins/`                                                                           | —     |       |
| `app/store` and `app/composables` root files                                                                    | —     |       |
| `app/util`, `app/types`                                                                                         | —     |       |
| `app/models` less `dungeons`, `message`, `resource` and `resolvers`                                             | —     |       |
| `app/models/resolvers`                                                                                          | —     |       |
| `services/{app,auth,route,router,trpc,notification}` + `composables/{data,shared}`                              | —     |       |
| `services/{styled,entity,zod,jsonSchema,compiler,shared,cache,file}` + `util/date` + the matching `composables` | —     |       |
| `Ui/`                                                                                                           | —     |       |
| `services/ui` + `composables/ui` + `store/ui`                                                                   | —     |       |

`app/components/Styled` belongs to `shared.md`, not here, and `app/models/{dungeons,message,resource}` to the
ledger of the feature that owns them.
