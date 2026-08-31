# Pinia

Store shape and the rules around a mutation: `storeToRefs`, store-to-store dot-access, `useMutation` keys, CRUD verbs, keyed state, and what belongs in a store at all.

| Unit                                                                                                                     | Swept      | Notes                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/store` root files (`alert`, `cache`, `clipboard`, `colors`, `layout`, `navigationTrail`, `notification`, `storage`) | 2026-08-27 | `navigationTrail.trail` was a writable ref every writer already routed past; `readonly` now says so. The other seven hold — the two plain Maps each state why they are not reactive         |
| `app/store/message/room`, `app/store/message/user`                                                                       | 2026-08-31 | four maps were written from outside the store that owns them; the keyed slices themselves are right throughout, every write naming its room                                                 |
| `app/store/message` — `data`, `pin`, `file`, `input`, `draftsAndSent`, `moderation`, `search`, `ui`                      | 2026-08-31 | rollbacks all unwind one row rather than a list copy; the search's pending flag was the one un-keyed field of a keyed slice                                                                 |
| `app/store/resource`                                                                                                     | 2026-08-31 | two store ids did not match their path, which is now `app/store/index.test.ts`'s; the blade teardown takes its id everywhere                                                                |
| `app/store/dungeons`                                                                                                     | 2026-08-31 | clean for this ledger — every Phaser instance is `markRaw`d at the one site it enters state; a dropped scene switch went to `error-handling`                                                |
| `app/store/post`, `app/store/user`, `app/store/survey`, `app/store/achievement`                                          | 2026-08-30 | clean — every `useMutation` carries a key, every rollback is scoped to the one row its write touches rather than a list copy, and the three dialog stores are per-service with `""` targets |
| `app/store/dashboard`, `emailEditor`, `flowchartEditor`, `webpageEditor`, `clicker`                                      | 2026-08-30 | store-to-store access is already right across all five; the email editor was missing the load seed every other content store has, fixed as its own commit                                   |

## Exclusions

- Cursor-pagination mechanics — the `pagination` skill's question, over the same files. It has no ledger yet; until it does, a paging finding is raised rather than swept here.
- `provide`/`inject` sites that should be stores are a `vue-components` finding, not one here; this ledger reads stores that already exist.

## Enforced since

- **A store id that does not match its path** — `app/store/index.test.ts`, written on 2026-08-31 after the
  `app/store/resource` pass found two. It reads every `defineStore` in the tree and compares the id against the
  file's own path, so the rule left the sweep's scope entirely rather than being carried row by row. A third,
  `message/user/settings/voice`, was fixed with them because an enforcer has to pass on the day it lands — that
  row is not thereby swept, only this question is settled for it.

## Next enforceable

- Destructuring a ref off a store without `storeToRefs` is syntactic and already half-covered by the component dot-access ban — extend that plugin rather than sweeping for it.
- A `useMutation` call with no `key` is decidable from the call site.
- Optimistic rollback correctness needs the whole write path in mind; it stays with the sweep.
