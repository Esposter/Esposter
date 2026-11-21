# Error handling

`try`/`catch` is already lint-banned, so this sweep is about the shapes a linter cannot see: what a chain wraps, how it terminates, and who alerts.

| Unit                                                                                                           | Swept | Notes                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| `server/trpc/routers/message`                                                                                  | —     | the widest best-effort tails in the app, all of them awaited                                                                     |
| `server/trpc/routers/room` — `category`, `createDirectMessageWithFriend`, `directMessage`                      | —     | the first name-ordered chunk of the folder, which is over the unit limit                                                         |
| `server/trpc/routers/room` — `emoji`, `filter`, `index`                                                        | —     | the second name-ordered chunk of the folder                                                                                      |
| `server/trpc/routers` — `call`, `role`, `userToRoom`, `webhook`                                                | —     | a bare `UNAUTHORIZED` here is the sanctioned form                                                                                |
| `server/trpc/routers` — the resource family                                                                    | —     | the two repeated rejections have named constructors over the guards                                                              |
| `server/trpc/routers` — the social and editor routers                                                          | —     | one bare `InvalidOperationError` asserts an unreachable state, so a 500 is what it is                                            |
| `server/trpc/routers` — the rest                                                                               | —     |                                                                                                                                  |
| `server/services/message`                                                                                      | —     |                                                                                                                                  |
| `server/services` — the rest                                                                                   | —     | the `CONFLICT` pair is the documented exception                                                                                  |
| `server/composables`                                                                                           | —     | nine client constructors — none wraps a call, so there is nothing to terminate                                                   |
| `apps/jobs`                                                                                                    | —     | a failure throws as the queue's retry request, or is recorded on the row it owns; every post-persist effect in `.match(noop, …)` |
| `apps/realtime/src/durableObjects` — `CallObject`, `RealtimeObject`                                            | —     | the first name-ordered chunk of the folder, which is over the unit limit                                                         |
| `apps/realtime/src/durableObjects` — `RoomObject`, `TopicObject`                                               | —     | the second name-ordered chunk of the folder                                                                                      |
| `apps/realtime/src/durableObjects` — `UserObject`                                                              | —     | the third name-ordered chunk of the folder                                                                                       |
| `apps/realtime/src/services` — `durableObject`, `realtimeKit`, `room`                                          | —     |                                                                                                                                  |
| `apps/realtime/src/services` — the rest                                                                        | —     |                                                                                                                                  |
| `apps/realtime/src` — `models`, `worker.ts`, `wrangler.test.ts`, and `apps/realtime/types`                     | —     | the realtime app's models, its entry and its wrangler test                                                                       |
| `app/store/message`                                                                                            | —     | the fire-and-forget callbacks here are pinned by a test                                                                          |
| `app/store` — the rest                                                                                         | —     | reports through `useMutation`                                                                                                    |
| `app/composables/message/room`                                                                                 | —     | the pre-join device probes and the call-session read                                                                             |
| `app/composables/message/subscribables`                                                                        | —     | every `onData` body terminates its own chain                                                                                     |
| `app/composables/message` — the rest                                                                           | —     |                                                                                                                                  |
| `app/composables/resource/sheet`                                                                               | —     | the clipboard shortcuts terminate inside the composables they call                                                               |
| `app/composables/resource` — the rest                                                                          | —     | every read goes through `readItems`/`useMutation`                                                                                |
| `app/composables` — the rest                                                                                   | —     |                                                                                                                                  |
| `app/services/resource`, `app/services/message`                                                                | —     |                                                                                                                                  |
| `app/services` — the rest, `app/util`                                                                          | —     | the file pickers report from inside their own composables                                                                        |
| `app/components/Message`                                                                                       | —     |                                                                                                                                  |
| `app/components/Resource`, `app/components/Dungeons`                                                           | —     | `Resource` reaches the server by primitive; the scene lifecycle drops what it returns                                            |
| `app/components` — the rest                                                                                    | —     |                                                                                                                                  |
| `packages/db`, `apps/infra`                                                                                    | —     | `db` rolls back then rethrows; `infra` is resource declarations with no error path                                               |
| `scripts`                                                                                                      | —     | `TypeError`/`RangeError` stay — the ban is on the bare `Error`, not on a precise one                                             |
| `packages/db-mock`                                                                                             | —     | every throw is a stub or an unsupported-in-mock                                                                                  |
| `packages/parse-tmx`, `packages/vue-phaserjs`                                                                  | —     | every throw is a named error class, no chain to terminate outside `shared`                                                       |
| `server/trpc` — `guards`, `procedure`, `plugins`, `middleware`                                                 | —     | a limiter bypass on a local production build is a notice, not an err handler                                                     |
| `server/api`                                                                                                   | —     |                                                                                                                                  |
| `app/pages`, `app/layouts`, `app/plugins`, `app/middleware`                                                    | —     | a push payload any worker can post is parsed and dropped rather than reported                                                    |
| `packages/shared`, `packages/shared-node`                                                                      | —     | the primitives themselves, and the bench reporter that rethrows through them                                                     |
| `packages/keyframe-store`                                                                                      | —     | the store hands back a `ResultAsync` its caller terminates                                                                       |
| `packages/configuration`                                                                                       | —     | builds before `@esposter/shared`, so its throws are bare `Error`s by necessity                                                   |
| `packages/genshin-persona`                                                                                     | —     | no `@esposter/shared` to import: the process boundary terminates, and records first                                              |
| `packages/genshin-engine`, `packages/genshin-world`                                                            | —     |                                                                                                                                  |
| `packages/genshin-text`, `packages/genshin-mods`, `packages/follow-ups`                                        | —     |                                                                                                                                  |
| `packages/pitch-transcription`, `packages/trpc-msw`, `packages/trpc-nuxt-module`                               | —     |                                                                                                                                  |
| `scripts/src/services/genshinParity`, `scripts/src/services/genshinAssets`, `scripts/src/services/genshinText` | —     |                                                                                                                                  |

The mechanical half — no `try`/`catch`, no `.isOk`/`.isErr`, no bare `new Error` outside the sites the
`error-handling` skill exempts, no `console.warn` handed to a handler — is lint (`error-handling/no-bare-error`
and the `no-restricted-syntax` selectors); every `getResult` chain terminated is the scan below. What
the rows are for is the half no grep sees: what a chain wraps, and who alerts.

## Find recipe

A chain that never terminates cannot be grepped for. A line-anchored `getResult(Async)?\(` reports all 234 call
sites, and a fixed-size window around one calls the ~40 whose body runs long a finding — the terminator sits
after the closing paren, which is wherever the callback ends. So the scan **matches the bracket** and reads the
code that follows it, through the syntax tree the `unterminatedResults` scan reads, so a `)` inside a string
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
- Unimplemented stubs, which the skill exempts from the `new Error` ban; none of them is a finding.
- `toAppError` itself, which is the mechanism that wraps an unknown throw into an `Error`.
- The `console.warn` calls: the browser-capability report in `store/message/room/realtime.ts`, the rate-limiter bypass
  note in the tRPC middleware, the Nitro asset route and `consumeAddressRateLimit.ts`, and `ignoreWarn.ts`'s own
  mechanism. None terminates a `Result`, which is what the `.orTee(console.error)` rule is about. That the
  rate-limiter notes state their key derivation, its warning and its rationale twice is a `file-organization`
  finding, raised rather than swept here.
- `requireAuthData`, where the whole point is that the auth api's own sentence reaches the user — the wrapper
  would prefix it with an operation and an entity name and bury it. The reason is written at the call site.
