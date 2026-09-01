---
name: error-handling
description: Esposter Error Handling Conventions — neverthrow getResult/getResultAsync (try/catch and try/finally banned), wrapping only what can actually fail, terminating every chain (.isOk/.isErr banned, never void a ResultAsync, noop as the ok handler, a callback nothing awaits terminating its own Result), .orTee(console.error) over console.warn/catch {}, never new Error (InvalidOperationError, the unimplemented-stub exception, jsonDateParse for JSON with dates), the tRPC backend guards and the getInvalidOperationError/getNotFoundError constructors a router asserts its own rejections with, plus deep dives on who alerts a tRPC rejection (errorLink ownership, createErrorAlert as the caller side of it, background reads, alert coalescing), withFinalizer vs withFinalizerAsync, the worked chain shapes, server guards (requireEntity/requireMutation, TRPCError cause, awaiting a best-effort effect a rollback compensates), and Azure Functions logging/retry with capped dead-letter replay. Apply when handling errors or logging in components, composables, stores, server routes, tRPC routers, or Azure Functions handlers.
---

# Error Handling Conventions

**neverthrow** for explicit error handling. No silent swallows — every error is propagated, logged, or shown to the user.

## Deep dives

- `references/result-chains.md` — when shaping one chain: a fallback value, an alert, a mid-chain side effect, an `instanceof` branch on the error, an abort/cancel, or a cleanup finalizer.
- `references/alerting.md` — when wiring the error path of a tRPC call, or a background read that must not alert.
- `references/finalizers.md` — when a chain has to release something whichever way it resolves.
- `references/server-guards.md` — when a tRPC router or server route guards a nullable DB result, attaches a `cause` to a `TRPCError`, or has a fire-and-forget tail on a path a caller rolls back.
- `references/azure-functions.md` — when writing or changing an Azure Functions handler, its dead-letter replay, or a handler that enumerates its own work from a query.

## try / catch and .then Are BANNED

`try` anywhere (no `try`/`catch`, no `try`/`finally`) and `.then()`/`.catch()`/`.finally()` on a promise are both
`no-restricted-syntax` errors — the rules live in `packages/configuration/eslint/typescriptRules.js` and
`restrictedSyntaxes.js`. Use `getResult`/`getResultAsync` + chain methods; for cleanup use
`withFinalizer`/`withFinalizerAsync`.

Only exception: published package README examples aimed at external consumers may use plain `try`/`finally` — a doc example shouldn't force consumers to install `@esposter/shared`.

**Normalising a callback that may throw synchronously is not one of them** — `Promise.try(fn)` is the primitive
for that, and it trips no ban. Use it wherever a task has to be called through a promise so a synchronous throw
becomes a rejection (`settleAll` hands the result to `allSettled`). When the outcome is a Result, `getResultAsync`
already covers it — it is built on `ResultAsync.fromThrowable`, which awaits the callback inside its own `try` —
so a call site keeps calling `getResultAsync` and never the raw primitive. Never reach back for
`Promise.resolve().then(fn)`, which only earned a disable before those two existed.

**A trailing value map is not one of them either.** Keeping a function non-`async` so its guard throws
synchronously buys nothing when every caller awaits it — the two are indistinguishable there, and the only place
the difference shows is a test, which asserts `rejects` just as happily. Make it `async`, `await` the call and
return the mapped value; never shape production code so a test can assert the throw one way rather than the other.

A disable is one of exactly two shapes, and says which in its reason:

| Shape                                                      | Why nothing else works                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `.finally` deregistering a promise from its own registry   | It must run on both paths and leave the outcome alone; a finalizer rethrows               |
| `.catch` on the promise under test, in that promise's test | The test asserts the primitive's own rejection; a Result wrapper would assert the wrapper |

Anything else converts. The rule is what makes these two visible: before it they were indistinguishable from an
ordinary `.then` someone had not got round to replacing.

## Throwing — never `new Error`

- **Never `new Error(...)`** — throw `new InvalidOperationError(operation, name, message)` from `@esposter/shared`, picking the appropriate `Operation` value (`Operation.Read`/`Create`/`Update`/`Delete`, …). Use the resource name (`file.name`, entity ID) as `name`; fall back to the calling function's name (`deserializeJson.name`) if none better.
- **Exception: the unimplemented interface stub.** `throw new Error("Method not implemented.")` stays where a mock implements a wide vendor interface it only partly needs. No operation is being attempted and there is no resource to name, so every `InvalidOperationError` field would be filler, and nothing catches it — reaching one means a test called a method the mock never meant to serve. It is also what TypeScript's own "implement all members" fix writes, so stubs stay diff-identical to regenerated ones. Don't route them through a shared `getNotImplementedError()` either; the indirection buys nothing at a site whose entire body is the throw.
- **User-supplied JSON** (uploads, external input): Zod `safeParse` and throw `InvalidOperationError` on failure — never bare `JSON.parse` with a cast. Validated endpoint data may use `jsonDateParse` from `@esposter/shared`.
- **JSON containing dates** (localStorage, blobs, any `JSON.stringify` round trip): parse with `jsonDateParse` — its reviver restores ISO strings to `Date`s, so the Zod schema keeps plain `z.date()`. Never `JSON.parse` + `z.coerce.date()`.

## Core Utility

```typescript
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
- Never `catch {}` (silent swallow). Never `console.warn` — always `.orTee(console.error)`. Two places change that sink, and both because the process writes somewhere more specific than the console: an Azure Functions handler logs through its `InvocationContext` (`context.error`) so the failure is attached to the invocation rather than the process, and `console.*` there is banned outright; `packages/virrun` writes every diagnostic to stderr through its own formatters, so a best-effort branch reports through `writeVirrunDebug` — its stated sink for a silently-degrading decision — rather than a raw `console.error` the CLI's own output contract does not allow.
- **`.match(noop, noop)` is the silent swallow wearing a terminator.** A branch is best-effort because the next run repairs it — a lease that goes unreleased, a temp that stays, a cache that is not written — and that is precisely what makes its failure invisible: nothing is wrong until the repair also stops happening, and by then there is no record of the first one. Best-effort is a reason to keep going, never a reason to say nothing, so the err handler names what was lost and what it costs. The ok handler stays `noop`.
- Never `void` a ResultAsync — always `await` (ResultAsync never rejects, so awaiting is safe).
- Never end a fire-and-forget chain with `.orTee(handler)` alone (lint flags it) — use `.match(noop, handler)`.
- No-op ok handler: always `noop`. Never inline `() => undefined` or `() => {}`.
- **A callback nothing awaits terminates its own `Result` inside its own body.** An interval tick, a timer, a fire-and-forget hook — nothing holds its promise, so a rejection escapes as an unhandled one and nothing retries. Wrap the whole body and terminate it inside (`getResultAsync(async () => …).match(noop, console.error)`), rather than leaving the terminal handler to a caller that does not exist.
- **When that callback is a promise executor, the err handler also resolves the gate.** `new Promise(getSynchronizedFunction(async (resolve) => …))` is how a Phaser animation or a dialog hands its completion back to the flow waiting on it, and the rejection is swallowed twice over — the drain settles it, and the `Promise` constructor never sees a throw from an `async` executor. Terminating alone therefore trades an invisible failure for a permanent hang: the caller keeps awaiting a gate nothing will ever open. So the err branch logs **and** calls `resolve`, and the caller carries on with the animation skipped rather than the turn stalled.

## Who alerts a tRPC rejection — `references/alerting.md`

`errorLink` alerts some rejection codes itself, so a caller that alerts them again stacks two identical toasts on one failure. **Wiring the error path of a tRPC call, or a background read that must not alert at all**, is that page.

## Finalizers — `references/finalizers.md`

`withFinalizer` and `withFinalizerAsync` run cleanup either way and then unwrap, so no terminal consumer is needed. **Releasing something a chain acquired, whichever way it resolves**, is that page.

## tRPC Backend Guards

Located in `server/trpc/guards/`. Test once, use everywhere — routers don't repeat null checks by hand: `requireEntity` turns a `findFirst` that may be `null` into a `TRPCError` `NOT_FOUND`, and `requireMutation` turns a `.returning()[0]` that may be `undefined` into a `BAD_REQUEST`.

**Asserting the rejection yourself uses the same family.** Where no nullable result is being guarded — a validation that fails, a state machine refusing a transition, a caller who may not do this — build the error with `getInvalidOperationError`, `getNotFoundError` or `getForbiddenError` from the same folder, never `new TRPCError({ code, message: new XError(...).message })` by hand. The point is that a rejection reads identically whether a guard produced it or a router asserted it, and that the code paired with each error type is decided once: `getNotFoundError` does not even take a code, because a missing entity is always `NOT_FOUND`, and `getForbiddenError` is always `FORBIDDEN`. A feature whose error is thrown from more than one place wraps this in its own named constructor (`createInvalidBlueprintError`) rather than repeating the arguments.

Signatures, and the rule for attaching a `cause` to a `TRPCError`, are in `references/server-guards.md`.

## Client Reads/Writes — Don't Hand-Roll the Chain

`useQuery` / `useMutation` already carry this chain for client reads/writes — see the `trpc` skill before writing your own around a `$trpc` call.
