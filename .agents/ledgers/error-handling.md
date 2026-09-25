# Error handling

`try`/`catch` is already lint-banned, so this sweep is about the shapes a linter cannot see: what a chain wraps, how it terminates, and who alerts.

| Unit                                                             | Swept                 | Notes                                                                                 |
| ---------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| `server/trpc/routers/message`, `server/trpc/routers/room`        | 2026-09-24 · Opus 5.5 | the widest best-effort tails in the app, all of them awaited                          |
| `server/trpc/routers` — `call`, `role`, `userToRoom`, `webhook`  | 2026-09-24 · Opus 5.5 | a bare `UNAUTHORIZED` here is the sanctioned form                                     |
| `server/trpc/routers` — the resource family                      | 2026-09-24 · Opus 5.5 | the two repeated rejections have named constructors over the guards                   |
| `server/trpc/routers` — the social and editor routers            | 2026-09-24 · Opus 5.5 | one bare `InvalidOperationError` asserts an unreachable state, so a 500 is what it is |
| `server/trpc/routers` — the rest                                 | 2026-09-24 · Opus 5.5 |                                                                                       |
| `server/services/message`                                        | 2026-09-24 · Opus 5.5 |                                                                                       |
| `server/services` — the rest                                     | 2026-09-24 · Opus 5.5 | the `CONFLICT` pair is the documented exception                                       |
| `server/composables`                                             | 2026-09-24 · Opus 5.5 | nine client constructors — none wraps a call, so there is nothing to terminate        |
| `apps/functions`                                                 | 2026-09-25 · Opus 5.5 | every handler ends in `logAndRethrow`; every post-persist effect in `.match(noop, …)` |
| `app/store/message`                                              | 2026-09-25 · Opus 5.5 | the fire-and-forget callbacks here are pinned by a test                               |
| `app/store` — the rest                                           | 2026-09-25 · Opus 5.5 | reports through `useMutation`                                                         |
| `app/composables/message/room`                                   | 2026-09-24 · Opus 5.5 | the pre-join device probes and the call-session read                                  |
| `app/composables/message/subscribables`                          | 2026-09-24 · Opus 5.5 | every `onData` body terminates its own chain                                          |
| `app/composables/message` — the rest                             | 2026-09-24 · Opus 5.5 |                                                                                       |
| `app/composables/resource/sheet`                                 | 2026-09-25 · Opus 5.5 | the clipboard shortcuts terminate inside the composables they call                    |
| `app/composables/resource` — the rest                            | 2026-09-24 · Opus 5.5 | every read goes through `readItems`/`useMutation`                                     |
| `app/composables` — the rest                                     | 2026-09-25 · Opus 5.5 |                                                                                       |
| `app/services/resource`, `app/services/message`                  | 2026-09-25 · Opus 5.5 |                                                                                       |
| `app/services` — the rest, `app/util`                            | 2026-09-25 · Opus 5.5 | the file pickers report from inside their own composables                             |
| `app/components/Message`                                         | 2026-09-25 · Opus 5.5 |                                                                                       |
| `app/components/Resource`, `app/components/Dungeons`             | 2026-09-25 · Opus 5.5 | `Resource` reaches the server by primitive; the scene lifecycle drops what it returns |
| `app/components` — the rest                                      | 2026-09-25 · Opus 5.5 |                                                                                       |
| `packages/db`, `apps/infra`                                      | 2026-09-25 · Opus 5.5 | `db` rolls back then rethrows; `infra` is resource declarations with no error path    |
| `packages/virrun` — `exec/snapshot`                              | 2026-09-25 · Opus 5.5 | a self-healing branch traces rather than alerts                                       |
| `packages/virrun` — `exec/wsl`                                   | 2026-09-25 · Opus 5.5 | the mirror's origin marker is the one swallow another sweep's age arm rests on        |
| `packages/virrun` — `exec/util`                                  | 2026-09-25 · Opus 5.5 | the `unwrapOr` readers answer a missing path with a value                             |
| `packages/virrun` — `exec/cache`, `exec/os`                      | 2026-09-25 · Opus 5.5 | the hash and key chains answer absence with `null` on purpose                         |
| `packages/virrun` — `exec` — the rest                            | 2026-09-25 · Opus 5.5 | `bwrap`, `native`, `store`, `vfs`, `differential`, `test`                             |
| `packages/virrun` — `services/cli`                               | 2026-09-25 · Opus 5.5 | a CLI answers a failure with an exit code and stderr rather than an alert             |
| `packages/virrun` — `src/models`, `services` — the rest          | 2026-09-25 · Opus 5.5 | every chain rethrows or falls back on a value its own comment names                   |
| `scripts`                                                        | 2026-09-25 · Opus 5.5 | `TypeError`/`RangeError` stay — the ban is on the bare `Error`, not on a precise one  |
| `packages/azure`, `packages/azure-mock`, `packages/db-mock`      | 2026-09-25 · Opus 5.5 | every throw is a stub, an unsupported-in-mock, or an Azure wire response              |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js` | 2026-09-25 · Opus 5.5 | every throw is a named error class, no chain to terminate outside `shared`            |
| `server/trpc` — `guards`, `procedure`, `plugins`, `middleware`   | 2026-09-24 · Opus 5.5 | a limiter bypass on a local production build is a notice, not an err handler          |
| `server/api`, `server/routes`                                    | 2026-09-24 · Opus 5.5 |                                                                                       |
| `app/pages`, `app/layouts`, `app/plugins`, `app/middleware`      | 2026-09-25 · Opus 5.5 | a push payload any worker can post is parsed and dropped rather than reported         |
| `packages/shared`, `packages/shared-node`                        | 2026-09-25 · Opus 5.5 | the primitives themselves, and the bench reporter that rethrows through them          |
| `packages/keyframe-store`                                        | 2026-09-25 · Opus 5.5 | the store hands back a `ResultAsync` its caller terminates                            |
| `packages/configuration`                                         | 2026-09-25 · Opus 5.5 | builds before `@esposter/shared`, so its throws are bare `Error`s by necessity        |
| `packages/genshin-persona`                                       | 2026-09-25 · Opus 5.5 | no `@esposter/shared` to import: the process boundary terminates, and records first   |

The mechanical half — no `try`/`catch`, no `.isOk`/`.isErr`, no bare `new Error` outside the sites the
`error-handling` skill exempts, no `console.warn` handed to a handler — is lint (`error-handling/no-bare-error`
and the `no-restricted-syntax` selectors); every `getResult` chain terminated is the scan below. What
the rows are for is the half no grep sees: what a chain wraps, and who alerts.

## Find recipe

A chain that never terminates cannot be grepped for. A line-anchored `getResult(Async)?\(` reports all 234 call
sites, and a fixed-size window around one calls the ~40 whose body runs long a finding — the terminator sits
after the closing paren, which is wherever the callback ends. So the scan **matches the bracket** and reads the
code that follows it, through the same `scanCode` walker the `constantScope` scan uses, so a `)` inside a string
or a comment closes nothing:

```bash
pnpm ai:sweep:unterminated-results
```

Where no terminator follows the call, the code **before** it decides, because whatever the value reaches owns
the terminator instead. A binding is the one shape the file can still answer — the chain is terminated wherever
the name is read, which is the repo's own spelling over nesting a long call inside its own terminator — so the
scan looks the name up. Everywhere else the value leaves the statement, handed to `return`, to a combinator's
callback or to another call's arguments, and the caller terminates it. What is left is a call standing alone as
a statement, which is the silent drop the scan exists for, so a clean run now means something and every hit is
a finding to read.

The **fire-and-forget** half has its own census, because a callback nothing awaits is the one place an
unterminated body is invisible rather than merely unhandled — `getSynchronizedFunction` reports the rejection
nowhere and its drain settles it away, which its own suite pins:

```bash
grep -rn 'getSynchronizedFunction(' apps/web/app apps/web/shared apps/web/server --include=*.ts --include=*.vue
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
