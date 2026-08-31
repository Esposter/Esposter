# Error handling

`try`/`catch` is already lint-banned, so this sweep is about the shapes a linter cannot see: what a chain wraps, how it terminates, and who alerts.

| Unit                                                             | Swept      | Notes                                                                                                 |
| ---------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `server/trpc/routers/message`, `server/trpc/routers/room`        | —          | the guard constructors vs a hand-rolled `TRPCError`; `requireEntity`/`requireMutation`                |
| `server/trpc/routers` — `call`, `role`, `userToRoom`, `webhook`  | —          | plus `searchHistory` and `index.ts`                                                                   |
| `server/trpc/routers` — the resource family                      | —          | `resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`, `survey`                             |
| `server/trpc/routers` — the social and editor routers            | —          | `post`, `like`, `block`, `friend`, `friendRequest`, `user`, and the four editors                      |
| `server/trpc/routers` — the rest                                 | —          | `achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage` |
| `server/services/message`                                        | —          | wrapping only what can actually fail                                                                  |
| `server/services` — the rest                                     | —          | `resource`, `room`, `survey`, `blueprint`, `rateLimiter` and the small folders                        |
| `server/composables`                                             | 2026-08-30 | nine client constructors — none wraps a call, so there is nothing to terminate                        |
| `packages/azure-functions`                                       | 2026-08-30 | every handler ends in `logAndRethrow`; every post-persist effect in `.match(noop, …)`                 |
| `app/store/message`                                              | 2026-08-31 | five fire-and-forget callbacks now terminate; the silence they relied on is pinned by a test          |
| `app/store` — the rest                                           | 2026-08-31 | the dungeons dialog gate never opened on a failed message; the rest reports through `useMutation`     |
| `app/composables/message/room`                                   | 2026-08-31 | the pre-join device probes and the call-session read reported nothing                                 |
| `app/composables/message/subscribables`                          | 2026-08-31 | seven `onData` bodies terminate; a dropped event was invisible                                        |
| `app/composables/message` — the rest                             | —          | `message`, `editor`, `emoji`, `draftsAndSent`, `slashCommand`, `moderation`, `user` and the singles   |
| `app/composables/resource/sheet`                                 | —          | the command composables                                                                               |
| `app/composables/resource` — the rest                            | —          | the root files and `list`                                                                             |
| `app/composables` — the rest                                     | —          | `dungeons` is unread; `shared` and the cross-cutting singles were swept ahead of it                   |
| `app/services/resource`, `app/services/message`                  | 2026-08-31 | two suggestion callbacks, a `.match(noop, noop)`, and a wrapper whose only handler rethrew            |
| `app/services` — the rest, `app/util`                            | —          | `dungeons` is most of it                                                                              |
| `app/components/Message`                                         | —          | inline handlers that swallow, and `.orTee(console.error)` vs a bare catch                             |
| `app/components/Resource`, `app/components/Dungeons`             | —          |                                                                                                       |
| `app/components` — the rest                                      | —          |                                                                                                       |
| `packages/db`, `packages/infra`                                  | 2026-08-30 | `db` rolls back then rethrows; `infra` is resource declarations with no error path                    |
| `packages/virrun` — `src/services/exec`                          | —          |                                                                                                       |
| `packages/virrun` — the rest                                     | —          |                                                                                                       |
| `packages/azure`, `packages/azure-mock`, `packages/db-mock`      | 2026-08-30 | every throw is a stub, an unsupported-in-mock, or an Azure wire response                              |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js` | 2026-08-30 | clean — every throw is a named error class, no chain to terminate outside `shared`                    |

Rows were split at their directory boundaries on 2026-08-30, because a unit of 150–740 files is grepped rather
than read and a grep pass that ticks a row records a sweep that never happened. The mechanical half was run
across every row that day and is clean repo-wide: no `try`/`catch`, no `.isOk`/`.isErr`, no `new Error` outside
`toAppError` and `requireAuthData`, and all 234 `getResult` chains terminate. What the remaining rows are for is
the half no grep sees — what a chain wraps, and who alerts.

## Find recipe

```bash
# new Error, which InvalidOperationError replaces outside unimplemented stubs
grep -rn 'new Error(' --include=*.ts --include=*.vue packages/app/app packages/app/server packages/app/shared packages/*/src
```

A chain that never terminates cannot be grepped for. A line-anchored `getResult(Async)?\(` reports all 234 call
sites, and a fixed-size window around one calls the ~40 whose body runs long a finding — the terminator sits
after the closing paren, which is wherever the callback ends. So the scan **matches the bracket** and reads what
follows it, which leaves only the sites that genuinely chain nothing:

```bash
node -e '
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const files = execSync("git ls-files \"packages/*/src/**\" \"packages/app/app/**\" \"packages/app/server/**\" \"packages/app/shared/**\"", { encoding: "utf8", maxBuffer: 1 << 28 })
  .split("
").filter((f) => (f.endsWith(".ts") || f.endsWith(".vue")) && !f.includes(".test."));
const findClose = (text, open) => {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
};
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/getResult(?:Async)?\(/gu)) {
    const close = findClose(text, match.index + match[0].length - 1);
    if (close === -1) continue;
    const after = text.slice(close + 1, close + 40).replace(/\s+/gu, " ");
    if (/^\s*\.(match|orTee|andTee|unwrapOr|mapErr|andThen|map|orElse)/u.test(after)) continue;
    console.log(`${file}:${text.slice(0, match.index).split("
").length}  after: ${after.slice(0, 34)}`);
  }
}'
```

What it still reports is the chain assigned to a named `const` and terminated on a later line — which is the
repo's own preference over nesting the call inside its own terminator, so those are read rather than counted.
On 2026-08-30 that was nine sites, all of them terminated.

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
  Throws are that exemption at scale — they are the bulk of every `new Error` grep and none of them is a finding.
- `azure-mock`'s "not supported by this mock" throws, which are the same exemption worn differently.
- `toAppError` itself, which is the mechanism that wraps an unknown throw into an `Error`.
- The five `console.warn` calls: two report a browser capability in `store/message/room/liveKit.ts`, two are the
  Same rate-limiter bypass note in the tRPC middleware and the Nitro asset route, and one is `ignoreWarn.ts`'s own
  Mechanism. None terminates a `Result`, which is what the `.orTee(console.error)` rule is about. That the
  Rate-limiter pair states its key derivation, its warning and its rationale twice is a `file-organization`
  Finding, raised rather than swept here.
- `requireAuthData`, where the whole point is that the auth api's own sentence reaches the user — the wrapper
  Would prefix it with an operation and an entity name and bury it. The reason is written at the call site.

## Next enforceable

- **`new Error` is a `no-restricted-syntax` candidate and nothing bans it today** — the convention is currently
  Carried by review alone. A selector would need the stub exemption above, which is a message match rather than a
  Shape, so it is worth doing only for `packages/app/**` where no stubs live.
- An unterminated `Result` is the bigger prize: a type-aware rule could flag a `ResultAsync` whose value is
  Discarded, the way `no-floating-promises` does for promises. Nothing checks it today, and the skill says an
  Unterminated chain fails silently — but nothing type-aware runs in either linter here (`oxlint` skill), so this
  Stays with the sweep until that changes.
- `console.warn` and an empty `catch {}` are syntactic and already candidates.
- A **fire-and-forget body that does not terminate** is the widest one left, and the census above finds every
  Candidate site. What no selector can decide is whether the body has anything to terminate, since a body whose
  Whole work is an `executeMutation` with an `onError` is already done — so it stays a read.

## Enforced since

- **Alerting a rejection without asking the error link** — `error-alert/no-raw-error-alert`
  (`scripts/oxlint/errorAlert.ts`) reports `createAlert(<expr>.message, …)`, which is the shape that means a
  Rejection rather than a sentence the caller composed. Ten sites were converted to `createErrorAlert` on
  2026-08-31 and the rule is what stops the eleventh. It is off for `createErrorAlert.ts` and `errorLink.ts`,
  Which are the mechanism, and it cannot see a Vue template's inline handler.
