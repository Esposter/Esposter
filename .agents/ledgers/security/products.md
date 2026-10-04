# Products

The app's smaller products — everything under `app/components` that is neither messaging nor the resource explorer. Each row carries a product's components together with the store, composable, service and page files only it uses.

| Unit                                                                                                                  | Swept                 | Notes |
| --------------------------------------------------------------------------------------------------------------------- | --------------------- | ----- |
| `Post` + `store/post`, `composables/post`, `services/post`, `pages/post`                                              | 2026-09-27 · Opus 5.5 |       |
| `Clicker` + `store/clicker`, `composables/clicker`, `services/clicker`, `pages/clicker.vue`                           | 2026-10-05 · Opus 5.5 |       |
| `User`, `Achievement` + `store/achievement`, the `user`/`achievement`/`room` layers, `pages/user`, `achievements.vue` | 2026-10-05 · Opus 5.5 |       |
| `Docs` + `composables/docs`, `services/docs`, `pages/docs`, `error.vue`                                               | 2026-10-05 · Opus 5.5 |       |
| `RichTextEditor` + `composables/codemirror`, `services/codemirror`                                                    | 2026-10-05 · Opus 5.5 |       |
| `Visual`, `Anime`, `About`, `Login`, `Transition` + their composable/service layers and the pages that mount them     | 2026-09-27 · Opus 5.5 |       |
