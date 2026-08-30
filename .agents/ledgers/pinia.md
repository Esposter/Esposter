# Pinia

Store shape and the rules around a mutation: `storeToRefs`, store-to-store dot-access, `useMutation` keys, CRUD verbs, keyed state, and what belongs in a store at all.

| Unit                                                                                                                     | Swept      | Notes                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/store` root files (`alert`, `cache`, `clipboard`, `colors`, `layout`, `navigationTrail`, `notification`, `storage`) | 2026-08-27 | `navigationTrail.trail` was a writable ref every writer already routed past; `readonly` now says so. The other seven hold — the two plain Maps each state why they are not reactive         |
| `app/store/message/room`, `app/store/message/user`                                                                       | —          | the widest keyed state; `useDataMap` keying and per-key fields                                                                                                                              |
| `app/store/message` — `data`, `pin`, `file`, `input`, `draftsAndSent`, `moderation`, `search`, `ui`                      | —          | optimistic writes and their rollbacks                                                                                                                                                       |
| `app/store/resource`                                                                                                     | —          | blade-scoped state torn down on unmount                                                                                                                                                     |
| `app/store/dungeons`                                                                                                     | —          | class instances in reactive state; the game stores predate most of this                                                                                                                     |
| `app/store/post`, `app/store/user`, `app/store/survey`, `app/store/achievement`                                          | 2026-08-30 | clean — every `useMutation` carries a key, every rollback is scoped to the one row its write touches rather than a list copy, and the three dialog stores are per-service with `""` targets |
| `app/store/dashboard`, `emailEditor`, `flowchartEditor`, `webpageEditor`, `clicker`                                      | 2026-08-30 | store-to-store access is already right across all five; the email editor was missing the load seed every other content store has, fixed as its own commit                                   |

## Exclusions

- Cursor-pagination mechanics — the `pagination` skill's question, over the same files. It has no ledger yet; until it does, a paging finding is raised rather than swept here.
- `provide`/`inject` sites that should be stores are a `vue-components` finding, not one here; this ledger reads stores that already exist.

## Next enforceable

- Destructuring a ref off a store without `storeToRefs` is syntactic and already half-covered by the component dot-access ban — extend that plugin rather than sweeping for it.
- A `useMutation` call with no `key` is decidable from the call site.
- Optimistic rollback correctness needs the whole write path in mind; it stays with the sweep.
