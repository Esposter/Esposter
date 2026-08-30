# App Shell

Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service,
composable and store layers no single feature claims.

| Unit                                                                                                            | Swept | Notes                                                     |
| --------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------- |
| `services/{app,auth,route,router,trpc,notification,google,login}` + `composables/{data,shared}`                 | —     | the two pagination cores are the largest suites here      |
| `services/{azure,cache,file,zod,ajv,jsonSchema,dayjs,compiler,shared,styled,entity,vuetify,codemirror}` + twins | —     | `app/services/compiler` is not `shared/services/compiler` |
| `services/docs`, `composables/docs`, `components/{Docs,content}`                                                | —     |                                                           |
| `store` root files, `store/{user,storage}`, `app/models`, `app/util`, `app/types`                               | —     |                                                           |
| `composables` root files, `composables/{storage,vuetify,file,notification,cache,azure}`                         | —     |                                                           |
| `components/{App,Nuxt,Transition}`, `Fragment.vue`, `App.vue`, `pages`, `layouts`, `plugins`, `middleware`      | —     | `components/index.test.ts` is the auto-import name check  |
