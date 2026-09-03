# Pinia

Store shape and the rules around a mutation: `storeToRefs`, store-to-store dot-access, `useMutation` keys, CRUD verbs, keyed state, and what belongs in a store at all.

| Unit                                                                                                                     | Swept      | Notes                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------- |
| `app/store` root files (`alert`, `cache`, `clipboard`, `colors`, `layout`, `navigationTrail`, `notification`, `storage`) | 2026-08-27 | the two plain Maps here are deliberately not reactive and each says so |
| `app/store/message/room`, `app/store/message/user`                                                                       | 2026-08-31 | the widest keyed state in the app — every write names its room         |
| `app/store/message` — `data`, `pin`, `file`, `input`, `draftsAndSent`, `moderation`, `search`, `ui`                      | 2026-08-31 |                                                                        |
| `app/store/resource`                                                                                                     | 2026-08-31 | blade-scoped state, torn down on unmount                               |
| `app/store/dungeons`                                                                                                     | 2026-08-31 | every Phaser instance is `markRaw`d at the one site it enters state    |
| `app/store/post`, `app/store/user`, `app/store/survey`, `app/store/achievement`                                          | 2026-08-30 | the three dialog stores here are per-service with `""` targets         |
| `app/store/dashboard`, `emailEditor`, `flowchartEditor`, `webpageEditor`, `clicker`                                      | 2026-08-30 | the four content stores share one load-seed shape                      |

## Exclusions

- Cursor-pagination mechanics — the `pagination` skill's question, over the same files. It has no ledger yet; until it does, a paging finding is raised rather than swept here.
- `provide`/`inject` sites that should be stores are a `vue-components` finding, not one here; this ledger reads stores that already exist.

## Next enforceable

- Destructuring a ref off a store without `storeToRefs` is syntactic and already half-covered by the component dot-access ban — extend that plugin rather than sweeping for it.
- A `useMutation` call with no `key` is decidable from the call site.
- Optimistic rollback correctness needs the whole write path in mind; it stays with the sweep.
