---
name: error-handling
description: Apply when handling errors or logging in components, composables, stores, server routes, tRPC routers, or Azure Functions handlers. Esposter error handling conventions — neverthrow through getResult/getResultAsync with try and .then banned, wrapping only what can fail, terminating every chain with .match and noop as the ok handler, .orTee(console.error) over a swallow, InvalidOperationError over new Error, the tRPC guards (requireEntity, requireMutation) and error constructors, and who alerts a tRPC rejection.
---

# Error Handling Conventions

**neverthrow** for explicit error handling. No silent swallows — every error is propagated, logged, or shown to the user.

## Deep dives

- `references/result-chains.md` — when shaping one chain: a fallback value, an alert, a mid-chain side effect, an `instanceof` branch on the error, an abort/cancel, or a cleanup finalizer.
- `references/alerting.md` — when wiring the error path of a tRPC call, or a background read that must not alert.
- `references/finalizers.md` — when a chain has to release something whichever way it resolves.
- `references/server-guards.md` — when a tRPC router or server route guards a nullable DB result, attaches a `cause` to a `TRPCError`, or has a fire-and-forget tail on a path a caller rolls back.
- `references/ban-exceptions.md` — when a callback must become a rejection, a throw is being kept synchronous for a test, or a `.then`/`.catch`/`.finally` looks unavoidable.
- `references/azure-functions.md` — when writing or changing an Azure Functions handler, its dead-letter replay, or a handler that enumerates its own work from a query.

## try / catch and .then Are BANNED

`try` anywhere (no `try`/`catch`, no `try`/`finally`) and `.then()`/`.catch()`/`.finally()` on a promise are both
`no-restricted-syntax` errors — the rules live in `packages/configuration/eslint/typescriptRules.js` and
`restrictedSyntaxes.js`. Use `getResult`/`getResultAsync` + chain methods; for cleanup use
`withFinalizer`/`withFinalizerAsync`.

Only exception: published package README examples aimed at external consumers may use plain `try`/`finally` — a doc example shouldn't force consumers to install `@esposter/shared`.

`Promise.try(fn)` normalises a synchronously throwing callback and trips no ban, and a guard is never kept non-`async` so a test can assert its throw one way rather than the other. A disable is one of exactly two shapes — a `.finally` deregistering a promise from its own registry, a `.catch` on the promise under test in that promise's own test — and says which in its reason (`references/ban-exceptions.md`).

## Throwing — never `new Error`

- **Never `new Error(...)`** (`error-handling/no-bare-error` lints it, off only where the mechanism cannot use itself: `packages/azure-mock`'s stubs, `packages/configuration` — which builds before `@esposter/shared` — `toAppError`, every `*.test.ts` and `*.bench.ts`, and `requireAuthData`'s one inline disable) — throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`, picking the appropriate `Operation` value (`Operation.Read`/`Create`/`Update`/`Delete`, …). Use the resource name (`file.name`, entity ID) as `name`; fall back to the calling function's name (`deserializeJson.name`) if none better.
- **Exception: the unimplemented interface stub.** `throw new Error("Method not implemented.")` stays where a mock implements a wide vendor interface it only partly needs. No operation is being attempted and there is no resource to name, so every `InvalidOperationError` field would be filler, and nothing catches it — reaching one means a test called a method the mock never meant to serve. It is also what TypeScript's own "implement all members" fix writes, so stubs stay diff-identical to regenerated ones. Don't route them through a shared `getNotImplementedFoo` helper either; the indirection buys nothing at a site whose entire body is the throw.
- **User-supplied JSON** (uploads, external input): Zod `safeParse` and throw `InvalidOperationError` on failure — never bare `JSON.parse` with a cast. Validated endpoint data may use `jsonDateParse` from `@esposter/shared`.
- **JSON containing dates** (localStorage, blobs, any `JSON.stringify` round trip): parse with `jsonDateParse` — its reviver restores ISO strings to `Date`s, so the Zod schema keeps plain `z.date()`.
- **Unless a schema validates the payload, in which case `JSON.parse` + `z.coerce.date()` is the correct pair.** A reviver guesses a date from a string's shape, so it cannot be pointed at content holding user-authored strings: a Sheet cell is typed `boolean | null | number | string`, and an ISO datetime typed into one would be revived into a `Date` its own schema then rejects — failing the whole resource read over one cell. A schema, by contrast, knows exactly which fields are dates. Which parse a path takes is decided in `apps/web/content/docs/architecture/serialization.md`, not per call site.

## Core Utility

```ts
import { getResult, getResultAsync, noop, withFinalizer, withFinalizerAsync } from "@esposter/shared";
// getResult: sync fn → Result<T, Error>
// getResultAsync: async fn → ResultAsync<T, Error>
// noop: () => {} — the ok-handler in .match(noop, errorHandler)
// withFinalizer: sync fn + sync finalizer (e.g. restoring globals)
// withFinalizerAsync: async/sync fn + async/sync finalizer — for all async operations
```

- Always use `getResult(() => expr)` / `getResultAsync(() => asyncExpr)`. Never call `fromThrowable` or `ResultAsync.fromPromise` directly.
- **Each error class writes `this.name = "ItsOwnName"` as a literal, and that repetition stays.** A base doing `this.name = new.target.name` would read as the obvious dedupe, but class names are mangled by the minifier, so every client-side error would report a one-letter name. The classes are matched with `instanceof` — the name is only ever displayed — which is exactly why a degraded one would go unnoticed. Each class still needs its own constructor to build its message, so the base saves one line and costs that.
- **Wrap only what can actually fail.** A `Result` around a local array/map write, a pure computation, or any body with no I/O and no throwing call in it reads as though that step has a failure mode, so the next reader hunts for one — and it downgrades a genuine programming error into a logged line. Call it bare. The tell that a wrapper is unjustified is its test: if the only way to exercise the err branch is a spy that forces a throw into a function that cannot throw, the wrapper is the thing under test, not the behaviour, and both should go.
- Never leave a `Result`/`ResultAsync` unhandled — finish every chain with `.match(...)`, `.unwrapOr(...)`, or `._unsafeUnwrap()`. **Nothing enforces this**: `neverthrow/must-use-result` needs type-aware parsing, which cost roughly a third of total rule time. An unterminated chain is silent rather than absent — `getResultAsync` starts the work immediately, so the call runs and only the outcome vanishes: the failure lands in a `Result` nobody reads, and never being a rejected promise, it is not an unhandled rejection either. The symptom is a step that appears to have succeeded, which is why this is a review catch and not a lint one.
- `.isOk()` / `.isErr()` are BANNED — branch with `.match(...)` instead so both branches are handled in one place. To rethrow/cleanup on failure, `throw` inside the err handler (works in sync and async handlers alike); to fall back, `.unwrapOr(fallback)`.
- Never `catch {}` (silent swallow). Never `console.warn` — always `.orTee(console.error)`; `console.warn` handed to any handler slot is a `no-restricted-syntax` error. Two places change that sink, and both because the process writes somewhere more specific than the console: an Azure Functions handler logs through its `InvocationContext` (`context.error`) so the failure is attached to the invocation rather than the process, and `console.*` there is banned outright; `packages/virrun` writes every diagnostic to stderr through its own formatters, so a best-effort branch reports through `writeVirrunDebug` — its stated sink for a silently-degrading decision — rather than a raw `console.error` the CLI's own output contract does not allow. **The ban is on `console.warn` as an
  err handler** — a failure downgraded to a warning is a failure nobody reads. A notice that no chain produced keeps
  it: a browser without autoplay or background processors, an anonymous request on a local production build with no
  address to key a limiter on — each is an expected degradation on a path that has not failed, and `console.error`
  there would report an error where there is none.
- **`.match(noop, noop)` is the silent swallow wearing a terminator.** A branch is best-effort because the next run repairs it — a lease that goes unreleased, a temp that stays, a cache that is not written — and that is precisely what makes its failure invisible: nothing is wrong until the repair also stops happening, and by then there is no record of the first one. Best-effort is a reason to keep going, never a reason to say nothing, so the err handler names what was lost and what it costs. The ok handler stays `noop`.
- Never `void` a ResultAsync — always `await` (ResultAsync never rejects, so awaiting is safe).
- Never end a fire-and-forget chain with `.orTee(handler)` alone — use `.match(noop, handler)`. Only the async form is caught: a `ResultAsync` is a thenable, so a bare one trips `typescript/no-floating-promises`, while a sync `getResult(...).orTee(...)` statement trips nothing and is a review catch.
- No-op ok handler: always `noop`. Never inline `() => undefined` or `() => {}`.
- **A callback nothing awaits terminates its own `Result` inside its own body.** An interval tick, a timer, a fire-and-forget hook — nothing holds its promise, so a rejection escapes as an unhandled one and nothing retries. Wrap the whole body and terminate it inside (`getResultAsync(async () => …).match(noop, console.error)`), rather than leaving the terminal handler to a caller that does not exist.
- **When that callback is a promise executor, the err handler also resolves the gate.** `new Promise(getSynchronizedFunction(async (resolve) => …))` is how a Phaser animation or a dialog hands its completion back to the flow waiting on it, and the rejection is swallowed twice over — the drain settles it, and the `Promise` constructor never sees a throw from an `async` executor. Terminating alone therefore trades an invisible failure for a permanent hang: the caller keeps awaiting a gate nothing will ever open. So the err branch logs **and** calls `resolve`, and the caller carries on with the animation skipped rather than the turn stalled.

## Who alerts a tRPC rejection — `references/alerting.md`

`errorLink` alerts some rejection codes itself, so a caller that alerts them again stacks two identical toasts on one failure. **Wiring the error path of a tRPC call, or a background read that must not alert at all**, is that page.

## Finalizers — `references/finalizers.md`

`withFinalizer` and `withFinalizerAsync` run cleanup either way and then unwrap, so no terminal consumer is needed. **Releasing something a chain acquired, whichever way it resolves**, is that page.

## tRPC Backend Guards

Located in `server/trpc/guards/`. Test once, use everywhere — routers don't repeat null checks by hand: `requireEntity` turns a `findFirst` that may be `null` into a `TRPCError` `NOT_FOUND`, and `requireMutation` turns a `.returning()[0]` that may be `undefined` into a `BAD_REQUEST`.

**Asserting the rejection yourself uses the same family** — `getInvalidOperationError`, `getNotFoundError` or `getForbiddenError` from `server/trpc/guards/`, never a `TRPCError` assembled by hand (`references/server-guards.md`).

Signatures, and the rule for attaching a `cause` to a `TRPCError`, are in `references/server-guards.md`.

## Client Reads/Writes — Don't Hand-Roll the Chain

`useQuery` / `useMutation` already carry this chain for client reads/writes — see the `trpc` skill before writing your own around a `$trpc` call.
