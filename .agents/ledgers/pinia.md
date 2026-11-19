# Pinia

Store shape and the rules around a mutation: `storeToRefs`, store-to-store dot-access, `useMutation` keys, CRUD verbs, keyed state, and what belongs in a store at all.

| Unit                                                                                                                     | Swept | Notes                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ----- | ---------------------------------------------------------------------- |
| `app/store` root files (`alert`, `cache`, `clipboard`, `colors`, `layout`, `navigationTrail`, `notification`, `storage`) | —     | the two plain Maps here are deliberately not reactive and each says so |
| `app/store/message/room`, `app/store/message/user`                                                                       | —     | the widest keyed state in the app — every write names its room         |
| `app/store/message` — `data`, `pin`, `file`, `input`, `draftsAndSent`, `moderation`, `search`, `ui`                      | —     |                                                                        |
| `app/store/resource`                                                                                                     | —     | blade-scoped state, torn down on unmount                               |
| `app/store/dungeons`                                                                                                     | —     | every Phaser instance is `markRaw`d at the one site it enters state    |
| `app/store/post`, `app/store/user`, `app/store/survey`, `app/store/achievement`                                          | —     | the three dialog stores here are per-service with `""` targets         |
| `app/store/dashboard`, `emailEditor`, `webpageEditor`, `clicker`                                                         | —     | the three content stores share one load-seed shape                     |
| `app/store/ui`                                                                                                           | —     |                                                                        |

## Exclusions

- Cursor-pagination mechanics — the `pagination` ledger's question, over the same files.
- `provide`/`inject` sites that should be stores are a `vue-components` finding, not one here; this ledger reads stores that already exist.
