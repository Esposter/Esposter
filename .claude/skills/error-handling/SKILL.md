---
name: error-handling
description: Esposter Error Handling Conventions — neverthrow getResult/getResultAsync (try/catch and try/finally banned), wrapping only what can actually fail, terminating every chain (.isOk/.isErr banned, never void a ResultAsync, noop as the ok handler, a callback nothing awaits terminating its own Result), .orTee(console.error) over console.warn/catch {}, who alerts a tRPC rejection (errorLink ownership, getIsAlertedByErrorLink, background reads, alert coalescing), withFinalizer vs withFinalizerAsync, the tRPC backend guards, plus deep dives on the worked chain shapes, server guards (requireEntity/requireMutation, TRPCError cause, awaiting a best-effort effect a rollback compensates), and Azure Functions logging/retry with capped dead-letter replay. Apply when handling errors or logging in components, composables, stores, server routes, tRPC routers, or Azure Functions handlers.
---

# Error Handling Conventions

**neverthrow** for explicit error handling. No silent swallows — every error is propagated, logged, or shown to the user.

## Deep dives

- `references/result-chains.md` — when shaping one chain: a fallback value, an alert, a mid-chain side effect, an `instanceof` branch on the error, an abort/cancel, or a cleanup finalizer.
- `references/server-guards.md` — when a tRPC router or server route guards a nullable DB result, attaches a `cause` to a `TRPCError`, or has a fire-and-forget tail on a path a caller rolls back.
- `references/azure-functions.md` — when writing or changing an Azure Functions handler, its dead-letter replay, or a handler that enumerates its own work from a query.

## try / catch Are BANNED

Never write `try` anywhere (no `try`/`catch`, no `try`/`finally`) in any code — components, composables, stores, server routes, tRPC routers. Use `getResult`/`getResultAsync` + chain methods; for cleanup use `withFinalizer`/`withFinalizerAsync`.

Only exception: published package README examples aimed at external consumers may use plain `try`/`finally` — a doc example shouldn't force consumers to install `@esposter/shared`.

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
- **Wrap only what can actually fail.** A `Result` around a local array/map write, a pure computation, or any body with no I/O and no throwing call in it reads as though that step has a failure mode, so the next reader hunts for one — and it downgrades a genuine programming error into a logged line. Call it bare. The tell that a wrapper is unjustified is its test: if the only way to exercise the err branch is a spy that forces a throw into a function that cannot throw, the wrapper is the thing under test, not the behaviour, and both should go.
- Never leave a `Result`/`ResultAsync` unhandled — finish every chain with `.match(...)`, `.unwrapOr(...)`, or `._unsafeUnwrap()`. **Nothing enforces this**: `neverthrow/must-use-result` was dropped because it needs `parserOptions.projectService`, and type-aware parsing cost roughly a third of total rule time. An unterminated chain is silent — `getResultAsync` starts the work immediately (`Promise.resolve().then(fn)`), so the call **does** run; what vanishes is the outcome. A failure is captured into the `Result` nobody reads, and because it never becomes a rejected promise it is not an unhandled rejection either, so nothing logs it. The symptom is a step that appears to have succeeded, not a step that never happened — so it is on review to catch, not lint.
- `.isOk()` / `.isErr()` are BANNED — branch with `.match(...)` instead so both branches are handled in one place. To rethrow/cleanup on failure, `throw` inside the err handler (works in sync and async handlers alike); to fall back, `.unwrapOr(fallback)`.
- Never `catch {}` (silent swallow). Never `console.warn` — always `.orTee(console.error)`. An Azure Functions handler is the one place that sink changes: it logs through its `InvocationContext` (`context.error`) so the failure is attached to the invocation rather than the process, and `console.*` there is banned outright.
- Never `void` a ResultAsync — always `await` (ResultAsync never rejects, so awaiting is safe).
- Never end a fire-and-forget chain with `.orTee(handler)` alone (lint flags it) — use `.match(noop, handler)`.
- No-op ok handler: always `noop`. Never inline `() => undefined` or `() => {}`.
- **A callback nothing awaits terminates its own `Result` inside its own body.** An interval tick, a timer, a fire-and-forget hook — nothing holds its promise, so a rejection escapes as an unhandled one and nothing retries. Wrap the whole body and terminate it inside (`getResultAsync(async () => …).match(noop, console.error)`), rather than leaving the terminal handler to a caller that does not exist.

## Who Alerts a tRPC Rejection

`errorLink` owns `BAD_REQUEST`, `TOO_MANY_REQUESTS` and `UNPROCESSABLE_CONTENT` — it alerts them itself, so a caller catching the same rejection asks `getIsAlertedByErrorLink(error)` first and stays the owner only of what it alone can see (a blob PUT, a local guard). Alerting again puts two identical toasts on screen for one failure.

```typescript
if (!getIsAlertedByErrorLink(error)) createAlert(error.message, "error");
```

- **That ownership is unconditional, and must stay that way.** The predicate is read off the error code alone, so any operation the link quietly declines to alert is an operation _nobody_ alerts — silence on both sides. `op.context.isBackground` therefore suppresses only the **login redirect**, never the alert: a background read failing is still a failure the user's own action caused, while a background `FORBIDDEN` (an hourly sweep hitting a room the user was just removed from) must never move them.
- **The redirect reads the session rather than inferring one from the code**, and only once the session request has **settled** — `authClient.useSession()` outside a component returns `data: null` while pending, and redirecting on that logs an authenticated user out of the first page load that happens to reject. It reads it inside an `effectScope` the link stops: better-auth's `useStore` registers its unsubscribe through `onScopeDispose`, so a bare call in the link's promise leaves a listener on the module-singleton session atom per rejection.
- **One cause, one toast — the alert store coalesces, so nothing upstream has to.** A single rejection cause routinely rejects several operations at once (an attachment batch's file and thumbnail reads, every chunk of a paged sweep), and each arrives at `createAlert` separately. An identical alert (same text, same severity) still on screen has its dismissal refreshed instead of a second copy stacked behind it. So the fix for duplicate toasts is never to silence one of the operations — that trades a duplicate for the silence-on-both-sides failure above.

## Finalizers

Both live in `@esposter/shared`. Both run the finalizer regardless of success/failure, then unwrap the original result (throwing on Err) — no terminal consumer needed.

- **`withFinalizer`** (sync): finalizer errors are always rethrown.
- **`withFinalizerAsync`** (async/sync mix): finalizer errors rethrown if the original operation succeeded; silently logged via `console.error` if it failed (preserving the original error). Both arguments are plain `() => Promisable<T>`, not `ResultAsync`.
- For simple loading flags around a `ResultAsync`, set the flag after `await` instead — a `ResultAsync` resolves to a `Result` rather than rejecting, so no finalizer is needed.

## tRPC Backend Guards

Located in `server/trpc/guards/`. Test once, use everywhere — routers don't repeat null checks by hand: `requireEntity` turns a `findFirst` that may be `null` into a `TRPCError` `NOT_FOUND`, and `requireMutation` turns a `.returning()[0]` that may be `undefined` into a `BAD_REQUEST`. Signatures, and the rule for attaching a `cause` to a `TRPCError`, are in `references/server-guards.md`.

## Client Reads/Writes — Don't Hand-Roll the Chain

`useQuery` / `useMutation` already carry this chain for client reads/writes — see the `trpc` skill before writing your own around a `$trpc` call.
