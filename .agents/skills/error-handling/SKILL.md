---
name: error-handling
description: Apply when handling errors or logging in components, composables, stores, server routes, tRPC routers, or Azure Functions handlers. Esposter error handling conventions — neverthrow through getResult/getResultAsync with try and .then banned, wrapping only what can fail, terminating every chain with .match and noop as the ok handler, .orTee(console.error) over a swallow, InvalidOperationError over new Error, the tRPC guards (requireEntity, requireMutation) and error constructors, and who alerts a tRPC rejection.
---

# Error Handling Conventions

**neverthrow** for explicit error handling. No silent swallows — every error is propagated, logged, or shown to the user.

## Settled — do not re-propose

- **A rule for an unterminated `Result`** — needs the value's type, and nothing type-aware runs in either linter (`oxlint` skill); `pnpm ai:sweep:unterminated-results` reads the code after the bracket instead, so it stays a scan a sitting runs.
- **A rule for a fire-and-forget body that does not terminate** — whether the body has anything to terminate is a question about what it calls: a body whose whole work is an `executeMutation` with an `onError` is already done.
- **Reaching a template's inline alert from `error-alert/no-raw-error-alert`** — oxlint hands a JS plugin no Vue template.
- **Banning `console.warn` outright** — a notice with its own sentence is allowed; the handler slot is the swallow, and that half is the selector.

## Deep dives

- `references/result-chains.md` — when shaping one chain: a fallback value, an alert, a mid-chain side effect, an `instanceof` branch on the error, an abort/cancel, or a cleanup finalizer.
- `references/alerting.md` — when wiring the error path of a tRPC call, or a background read that must not alert.
- `references/finalizers.md` — when a chain has to release something whichever way it resolves.
- `references/server-guards.md` — when a tRPC router or server route guards a nullable DB result, attaches a `cause` to a `TRPCError`, or has a fire-and-forget tail on a path a caller rolls back.
- `references/ban-exceptions.md` — when a callback must become a rejection, a throw is being kept synchronous for a test, or a `.then`/`.catch`/`.finally` looks unavoidable.
- `references/azure-functions.md` — when writing or changing an Azure Functions handler, its dead-letter replay, or a handler that enumerates its own work from a query.
- `references/throwing.md` — when a code path throws, or a mock stubs a vendor method it never serves.
- `references/json-parsing.md` — when parsing JSON: user input, a stored blob, or a round trip carrying dates.
- `references/error-classes.md` — when writing or deduplicating an error class.
- `references/wrapping.md` — when deciding whether a step gets a `Result`, or whether a chain is terminated.
- `references/logging-sinks.md` — when writing an err handler or a notice: the sink per runtime, and where `console.warn` stays.
- `references/no-shared-import.md` — when handling a rejection in a package that cannot import `@esposter/shared`.
- `references/unawaited-callbacks.md` — when writing a tick, a timer, a fire-and-forget hook or a gating promise executor.

## try / catch and .then Are BANNED

`try` in any form and `.then`/`.catch`/`.finally` are `no-restricted-syntax` errors — `getResult`/`getResultAsync` and a chain, `withFinalizer`/`withFinalizerAsync` for cleanup; the two disable shapes and `Promise.try` are `references/ban-exceptions.md`.

## Throwing — never `new Error`

- **Never `new Error(...)`** — throw `InvalidOperationError(operation, name, message)` (`error-handling/no-bare-error`); the exceptions are `references/throwing.md`.
- **JSON is parsed by a schema or by `jsonDateParse`**, never a bare `JSON.parse` with a cast — which one a path takes is `references/json-parsing.md`.

## Core Utility

```ts
import { getResult, getResultAsync, noop, withFinalizer, withFinalizerAsync } from "@esposter/shared";
// getResult: sync fn → Result<T, Error>
// getResultAsync: async fn → ResultAsync<T, Error>
// noop: () => {} — the ok-handler in .match(noop, errorHandler)
// withFinalizer: sync fn + sync finalizer (e.g. restoring globals)
// withFinalizerAsync: async/sync fn + async/sync finalizer — for all async operations
```

- Always use `getResult(() => expr)` / `getResultAsync(() => asyncExpr)` — neverthrow's `fromThrowable`/`fromPromise` called directly is a `no-restricted-syntax` error. Beside the two helpers themselves, the one site that disables it is `apps/web/configuration/hooks.ts`: the Nuxt configuration loads in `nuxt prepare`, before any workspace package is built, so it cannot import `@esposter/shared` and wraps with neverthrow — and inlines its ok handler for want of `noop` — on its own.
- **Each error class writes `this.name` as a literal**, never `new.target.name`, which the minifier mangles (`references/error-classes.md`).
- **Wrap only what can actually fail** — a pure step is called bare (`references/wrapping.md`).
- **Never leave a `Result` unterminated** — `.match`, `.unwrapOr` or `._unsafeUnwrap()`; nothing enforces it, so it is a review catch (`references/wrapping.md`).
- `.isOk()` / `.isErr()` are BANNED (`no-restricted-syntax`) — branch with `.match(...)` instead so both branches are handled in one place. To rethrow/cleanup on failure, `throw` inside the err handler (works in sync and async handlers alike); to fall back, `.unwrapOr(fallback)`.
- **Never a silent swallow, and never `console.warn` as an err handler** — `.orTee(console.error)`, `context.error` in an Azure Function, `writeVirrunDebug` in virrun (`references/logging-sinks.md`).
- **`.match(noop, noop)` is a silent swallow** — a best-effort err handler names what was lost (`no-restricted-syntax`, `references/logging-sinks.md`).
- Never `void` a ResultAsync — always `await` (ResultAsync never rejects, so awaiting is safe).
- **A package that cannot import `@esposter/shared`** reads a rejection through `Promise.allSettled` and terminates at the process boundary (`references/no-shared-import.md`).
- Never end a fire-and-forget chain with `.orTee(handler)` alone — use `.match(noop, handler)`. Only the async form is caught: a `ResultAsync` is a thenable, so a bare one trips `typescript/no-floating-promises`, while a sync `getResult(...).orTee(...)` statement trips nothing and is a review catch.
- No-op ok handler: always `noop` — an inline `() => {}`, or a `() => undefined` whose match value is discarded, is a `no-restricted-syntax` error. Assigned, `() => undefined` is the value the ok arm produces and stays.
- **A callback nothing awaits terminates its own `Result` inside its own body**, and a promise executor's err handler also resolves its gate (`references/unawaited-callbacks.md`).

## Who alerts a tRPC rejection — `references/alerting.md`

`errorLink` alerts some rejection codes itself, so a caller that alerts them again stacks two identical toasts on one failure. **Wiring the error path of a tRPC call, or a background read that must not alert at all**, is that page.

## Finalizers — `references/finalizers.md`

`withFinalizer` and `withFinalizerAsync` run cleanup either way and then unwrap, so no terminal consumer is needed. **Releasing something a chain acquired, whichever way it resolves**, is that page.

## tRPC Backend Guards

Routers never repeat a null check: `requireEntity` and `requireMutation` from `server/trpc/guards/`, and a rejection asserted with the same family's error constructors (`references/server-guards.md`).

## Client Reads/Writes — Don't Hand-Roll the Chain

`useQuery` / `useMutation` already carry this chain for client reads/writes — see the `trpc` skill before writing your own around a `$trpc` call.
