# Products

The app's smaller products — everything under `app/components` that is neither messaging nor the resource explorer. Each row carries a product's components together with the store, composable, service and page files only it uses.

| Unit                                                                                                                  | Swept      | Notes                                                       |
| --------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| `Post` + `store/post`, `composables/post`, `services/post`, `pages/post`                                              | 2026-08-20 |                                                             |
| `Clicker` + `store/clicker`, `composables/clicker`, `services/clicker`, `pages/clicker.vue`                           | 2026-08-20 | `shared/models/clicker` is `shared.md`'s, not in scope here |
| `User`, `Achievement` + `store/achievement`, the `user`/`achievement`/`room` layers, `pages/user`, `achievements.vue` | 2026-08-20 |                                                             |
| `Docs` + `composables/docs`, `services/docs`, `pages/docs`, `pages/[...slug].vue`                                     | 2026-08-20 |                                                             |
| `RichTextEditor` + `composables/codemirror`, `services/codemirror`                                                    | 2026-08-20 |                                                             |
| `Visual`, `Anime`, `About`, `Login`, `Transition` + their composable/service layers and the pages that mount them     | 2026-08-20 |                                                             |
