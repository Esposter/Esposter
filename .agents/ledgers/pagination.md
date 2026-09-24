# Pagination

The three-layer cursor pattern, infinite scroll, the one search-as-you-type stack, bundled ancillary reads, and the offline list cache.

| Unit                                                                                            | Swept | Notes |
| ----------------------------------------------------------------------------------------------- | ----- | ----- |
| `app/composables/data/pagination`, `app/composables/cache/indexedDb`                            | —     |       |
| `server/services/pagination` and the list reads it serves                                       | —     |       |
| `app/store/message`, `app/composables/message` — messages, pins, search, drafts, moderation     | —     |       |
| `app/store/message/room`, `app/composables/message/room`, `Message/Model/Room`                  | —     |       |
| `app/store/message/user`, `Message/RightSideBar/Search`                                         | —     |       |
| `app/store/post`, `app/composables/post`, `Post`                                                | —     |       |
| `resource`, `notification`, `docs`, `user` pages, `dungeons/world`, emoji — the remaining lists | —     |       |
