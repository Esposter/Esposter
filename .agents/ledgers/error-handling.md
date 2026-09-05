# Error handling

`try`/`catch` is already lint-banned, so this sweep is about the shapes a linter cannot see: what a chain wraps, how it terminates, and who alerts.

| Unit                                                             | Swept      | Notes                                                                                 |
| ---------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `server/trpc/routers/message`, `server/trpc/routers/room`        | 2026-08-31 | the widest best-effort tails in the app, all of them awaited                          |
| `server/trpc/routers` — `call`, `role`, `userToRoom`, `webhook`  | 2026-08-31 | a bare `UNAUTHORIZED` here is the sanctioned form                                     |
| `server/trpc/routers` — the resource family                      | 2026-08-31 | the two repeated rejections have named constructors over the guards                   |
| `server/trpc/routers` — the social and editor routers            | 2026-08-31 | one bare `InvalidOperationError` asserts an unreachable state, so a 500 is what it is |
| `server/trpc/routers` — the rest                                 | 2026-08-31 |                                                                                       |
| `server/services/message`                                        | 2026-08-31 |                                                                                       |
| `server/services` — the rest                                     | 2026-08-31 | the `CONFLICT` pair is the documented exception                                       |
| `server/composables`                                             | 2026-08-30 | nine client constructors — none wraps a call, so there is nothing to terminate        |
| `packages/azure-functions`                                       | 2026-08-30 | every handler ends in `logAndRethrow`; every post-persist effect in `.match(noop, …)` |
| `app/store/message`                                              | 2026-08-31 | the fire-and-forget callbacks here are pinned by a test                               |
| `app/store` — the rest                                           | 2026-08-31 | reports through `useMutation`                                                         |
| `app/composables/message/room`                                   | 2026-08-31 | the pre-join device probes and the call-session read                                  |
| `app/composables/message/subscribables`                          | 2026-08-31 | every `onData` body terminates its own chain                                          |
| `app/composables/message` — the rest                             | 2026-08-31 |                                                                                       |
| `app/composables/resource/sheet`                                 | 2026-08-31 | the clipboard shortcuts terminate inside the composables they call                    |
| `app/composables/resource` — the rest                            | 2026-08-31 | every read goes through `readItems`/`useMutation`                                     |
| `app/composables` — the rest                                     | 2026-08-31 |                                                                                       |
| `app/services/resource`, `app/services/message`                  | 2026-08-31 |                                                                                       |
| `app/services` — the rest, `app/util`                            | 2026-08-31 | the file pickers report from inside their own composables                             |
| `app/components/Message`                                         | 2026-08-31 |                                                                                       |
| `app/components/Resource`, `app/components/Dungeons`             | 2026-08-31 | `Resource` reaches the server by primitive; the scene lifecycle drops what it returns |
| `app/components` — the rest                                      | 2026-08-31 |                                                                                       |
| `packages/db`, `packages/infra`                                  | 2026-08-30 | `db` rolls back then rethrows; `infra` is resource declarations with no error path    |
| `packages/virrun` — `exec/snapshot`                              | 2026-08-31 | a self-healing branch traces rather than alerts                                       |
| `packages/virrun` — `exec/wsl`                                   | 2026-08-31 | the mirror's origin marker is the one swallow another sweep's age arm rests on        |
| `packages/virrun` — `exec/util`                                  | 2026-08-31 | the `unwrapOr` readers answer a missing path with a value                             |
| `packages/virrun` — `exec/cache`, `exec/os`                      | 2026-08-31 | the hash and key chains answer absence with `null` on purpose                         |
| `packages/virrun` — `exec` — the rest                            | 2026-08-31 | `bwrap`, `native`, `store`, `vfs`, `differential`, `test`                             |
| `packages/virrun` — `services/cli`                               | 2026-08-31 | a CLI answers a failure with an exit code and stderr rather than an alert             |
| `packages/virrun` — `src/models`, `services` — the rest          | 2026-08-31 | every chain rethrows or falls back on a value its own comment names                   |
| `packages/azure`, `packages/azure-mock`, `packages/db-mock`      | 2026-08-30 | every throw is a stub, an unsupported-in-mock, or an Azure wire response              |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js` | 2026-08-30 | every throw is a named error class, no chain to terminate outside `shared`            |

The mechanical half — no `try`/`catch`, no `.isOk`/`.isErr`, no `new Error` outside `toAppError` and
`requireAuthData`, every `getResult` chain terminated — is clean repo-wide and grepped by the recipe below. What
the rows are for is the half no grep sees: what a chain wraps, and who alerts.

## Find recipe

```bash
# new Error, which InvalidOperationError replaces outside unimplemented stubs
grep -rn 'new Error(' --include=*.ts --include=*.vue packages/app/app packages/app/server packages/app/shared packages/*/src
```

A chain that never terminates cannot be grepped for. A line-anchored `getResult(Async)?\(` reports all 234 call
sites, and a fixed-size window around one calls the ~40 whose body runs long a finding — the terminator sits
after the closing paren, which is wherever the callback ends. So the scan **matches the bracket** and reads the
code that follows it, through the same `scanCode` walker the `constantScope` scan uses, so a `)` inside a string
or a comment closes nothing:

```bash
pnpm sweep:unterminated-results
```

What it still reports is the chain assigned to a named `const` and terminated on a later line — which is the
repo's own preference over nesting the call inside its own terminator, so those are read rather than counted.

The **fire-and-forget** half has its own census, because a callback nothing awaits is the one place an
unterminated body is invisible rather than merely unhandled — `getSynchronizedFunction` reports the rejection
nowhere and its drain settles it away, which its own suite pins:

```bash
grep -rn 'getSynchronizedFunction(' packages/app/app packages/app/shared packages/app/server --include=*.ts --include=*.vue
```

Every hit's callback body has to terminate its own chain. That is a per-site read, not a count: a body whose
whole work is already inside an `executeMutation` with an `onError` is terminated, and one whose awaits are all
local writes has nothing to terminate.

## Exclusions

- `.isOk()` / `.isErr()` call sites are a lint finding, not a sweep finding — they fail on the line that writes them.
- Unimplemented stubs, which the skill exempts from the `new Error` ban. `azure-mock`'s `Method not implemented.`
  throws are that exemption at scale — they are the bulk of every `new Error` grep and none of them is a finding.
- `azure-mock`'s "not supported by this mock" throws, which are the same exemption worn differently.
- `toAppError` itself, which is the mechanism that wraps an unknown throw into an `Error`.
- The five `console.warn` calls: two report a browser capability in `store/message/room/liveKit.ts`, two are the
  same rate-limiter bypass note in the tRPC middleware and the Nitro asset route, and one is `ignoreWarn.ts`'s own
  mechanism. None terminates a `Result`, which is what the `.orTee(console.error)` rule is about. That the
  rate-limiter pair states its key derivation, its warning and its rationale twice is a `file-organization`
  finding, raised rather than swept here.
- `requireAuthData`, where the whole point is that the auth api's own sentence reaches the user — the wrapper
  would prefix it with an operation and an entity name and bury it. The reason is written at the call site.

## Next enforceable

- **`new Error` is a `no-restricted-syntax` candidate and nothing bans it today** — the convention is currently
  carried by review alone. A selector would need the stub exemption above, which is a message match rather than a
  shape, so it is worth doing only for `packages/app/**` where no stubs live.
- An unterminated `Result` is the bigger prize: a type-aware rule could flag a `ResultAsync` whose value is
  discarded, the way `no-floating-promises` does for promises. Nothing checks it today, and the skill says an
  unterminated chain fails silently — but nothing type-aware runs in either linter here (`oxlint` skill), so this
  stays with the sweep until that changes.
- `console.warn` and an empty `catch {}` are syntactic and already candidates.
- A **fire-and-forget body that does not terminate** is the widest one left, and the census above finds every
  candidate site. What no selector can decide is whether the body has anything to terminate, since a body whose
  whole work is an `executeMutation` with an `onError` is already done — so it stays a read.
- **A Vue template's inline handler** is outside `error-alert/no-raw-error-alert`'s reach, so an alert written
  there is still the sweep's to find.
