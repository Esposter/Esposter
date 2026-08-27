# Error handling

`try`/`catch` is already lint-banned, so this sweep is about the shapes a linter cannot see: what a chain wraps, how it terminates, and who alerts.

| Unit                                                             | Swept | Notes                                                                                  |
| ---------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------- |
| `server/trpc/routers`                                            | —     | the guard constructors vs a hand-rolled `TRPCError`; `requireEntity`/`requireMutation` |
| `server/services`, `server/composables`                          | —     | wrapping only what can actually fail                                                   |
| `packages/azure-functions`                                       | —     | logging and retry, and the capped dead-letter replay                                   |
| `app/store`                                                      | —     | who alerts a rejection — `errorLink` ownership, background reads, coalescing           |
| `app/composables`                                                | —     | a callback nothing awaits terminating its own `Result`                                 |
| `app/services`, `app/util`                                       | —     | `withFinalizer` vs `withFinalizerAsync`                                                |
| `app/components`                                                 | —     | inline handlers that swallow, and `.orTee(console.error)` vs a bare catch              |
| `packages/db`, `packages/virrun`, `packages/infra`               | —     |                                                                                        |
| `packages/azure`, `packages/azure-mock`, `packages/db-mock`      | —     | mocks may model a rejection the real client throws — check against the wire            |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js` | —     | published packages; `try` is allowed in their README examples only                     |

## Find recipe

```bash
# A chain that never terminates — no .match, no .orTee, not returned. `Async?` would make the `c` optional
# And miss every synchronous chain, so the group is the whole word
grep -rnE 'getResult(Async)?\(' --include=*.ts --include=*.vue packages/app/app packages/app/server packages/app/shared packages/*/src
# new Error, which InvalidOperationError replaces outside unimplemented stubs
grep -rn 'new Error(' --include=*.ts --include=*.vue packages/app/app packages/app/server packages/app/shared packages/*/src
```

## Exclusions

- `.isOk()` / `.isErr()` call sites are a lint finding, not a sweep finding — they fail on the line that writes them.
- Unimplemented stubs, which the skill exempts from the `new Error` ban.

## Next enforceable

- An unterminated `Result` is the big one: a type-aware rule could flag a `ResultAsync` whose value is discarded, the way `no-floating-promises` does for promises. Nothing checks it today, and the skill says an unterminated chain fails silently.
- `console.warn` and empty `catch {}` are syntactic and already candidates for `no-restricted-syntax`.
