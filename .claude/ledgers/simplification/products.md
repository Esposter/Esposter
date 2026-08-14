# Products

The app's smaller products — everything under `app/components` that is neither messaging nor the resource explorer. Each row carries a product's components together with the store, composable, service and page files only it uses.

| Unit                                                                                                                  | Swept | Notes                                                                 |
| --------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------- |
| `Post` + `store/post`, `composables/post`, `services/post`, `pages/post`                                              | —     |                                                                       |
| `Clicker` + `store/clicker`, `composables/clicker`, `services/clicker`, `pages/clicker.vue`                           | —     | `shared/models/clicker` swept 2026-08-12 — shared models not in scope |
| `User`, `Achievement` + `store/achievement`, the `user`/`achievement`/`room` layers, `pages/user`, `achievements.vue` | —     |                                                                       |
| `Docs` + `composables/docs`, `services/docs`, `pages/docs`, `pages/[...slug].vue`                                     | —     |                                                                       |
| `RichTextEditor` + `composables/codemirror`, `services/codemirror`                                                    | —     |                                                                       |
| `Visual`, `Anime`, `About`, `Login`, `Transition` + their composable/service layers and the pages that mount them     | —     |                                                                       |
