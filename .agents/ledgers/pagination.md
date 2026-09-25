# Pagination

The three-layer cursor pattern, infinite scroll, the one search-as-you-type stack, bundled ancillary reads, and the offline list cache.

| Unit                                                                                            | Swept                 | Notes |
| ----------------------------------------------------------------------------------------------- | --------------------- | ----- |
| `app/composables/data/pagination`, `app/composables/cache/indexedDb`                            | 2026-09-25 · Opus 5.5 |       |
| `server/services/pagination` and the list reads it serves                                       | 2026-09-25 · Opus 5.5 |       |
| `app/store/message`, `app/composables/message` — messages, pins, search, drafts, moderation     | 2026-09-25 · Opus 5.5 |       |
| `app/store/message/room`, `app/composables/message/room`, `Message/Model/Room`                  | 2026-09-25 · Opus 5.5 |       |
| `app/store/message/user`, `Message/RightSideBar/Search`                                         | 2026-09-25 · Opus 5.5 |       |
| `app/store/post`, `app/composables/post`, `Post`                                                | 2026-09-25 · Opus 5.5 |       |
| `resource`, `notification`, `docs`, `user` pages, `dungeons/world`, emoji — the remaining lists | 2026-09-25 · Opus 5.5 |       |
