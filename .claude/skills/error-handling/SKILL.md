---
name: error-handling
description: Esposter Error Handling Conventions — neverthrow getResult/getResultAsync (try/catch banned), chaining patterns, finalizers, tRPC backend guards, and Azure Functions logging/retry (context.error, logAndRethrow, fatal vs best-effort, capped dead-letter replay with quarantine). Apply when handling errors or logging in components, composables, stores, server routes, tRPC routers, or Azure Functions handlers.
---

# Error Handling Conventions

**neverthrow** for explicit error handling. No silent swallows — every error is propagated, logged, or shown to the user.

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
- Never leave a `Result`/`ResultAsync` unhandled — enforced by `neverthrow/must-use-result` (eslint, error). Finish every chain with `.match(...)`, `.unwrapOr(...)`, or `._unsafeUnwrap()`.
- `.isOk()` / `.isErr()` are BANNED — branch with `.match(...)` instead so both branches are handled in one place. To rethrow/cleanup on failure, `throw` inside the err handler (works in sync and async handlers alike); to fall back, `.unwrapOr(fallback)`.
- Never `catch {}` (silent swallow). Never `console.warn` — always `.orTee(console.error)`.
- Never `void` a ResultAsync — always `await` (ResultAsync never rejects, so awaiting is safe).
- Never end a fire-and-forget chain with `.orTee(handler)` alone (lint flags it) — use `.match(noop, handler)`.
- No-op ok handler: always `noop`. Never inline `() => undefined` or `() => {}`.

## Patterns

### Sync operation → fallback value

```typescript
return getResult(() => new RegExp(pattern).exec(value)).match(
  (match) => match?.[groupIndex] ?? null,
  () => null,
);
```

### Async operation → alert on failure (composables)

```typescript
await getResultAsync(() => someAsyncOp())
  .andTee((result) => doSomethingWith(result))
  .match(noop, (error) => {
    createAlert(error.message, "error");
  });
```

### Async operation → fallback value (services / routers)

```typescript
return getResultAsync(() => someAsyncOp())
  .orTee(console.error)
  .unwrapOr(defaultValue);
```

Best-effort but still logged: same shape with `.unwrapOr(undefined)`.

### Async operation → boolean success (composables)

```typescript
return getResultAsync(() => auth.save(value)).match(
  () => true,
  (error) => {
    alertStore.createAlert(error.message, "error");
    return false;
  },
);
```

### Discriminated error types

For `instanceof` checks on the error, branch inside the `.match()` err handler (never `.isErr()` + `.error`):

```typescript
await getResultAsync(() => op()).match(
  (value) => {
    doSomethingWith(value);
  },
  (error) => {
    if (error instanceof DOMException) createAlert(error.message, "error");
    else console.error(error);
  },
);
```

**A thrown value you want to `instanceof`-check on the err branch must extend `Error`.** `getResult`/`getResultAsync` route throws through `toAppError`, which passes `instanceof Error` through untouched but wraps anything else in `new Error(String(x), { cause: x })`. So a custom control-flow sentinel thrown to be caught later (e.g. an `ExitSignal` carrying an exit code) must `extends Error` — otherwise the err branch receives a plain `Error` and your `instanceof ExitSignal` silently fails (the original lands on `.cause`).

### Chaining multiple fallible steps

Use `getResultAsync(() => promise).andThen(...)` when different steps need different error handling (`.orElse()` on a specific step) or mid-chain side effects (`.andTee()`).

```typescript
await getResultAsync(() => showSaveFilePicker())
  .andThen(({ blob, writable }) =>
    getResultAsync(() => writable.write(blob)).orElse((error) =>
      getResultAsync(() => writable.abort())
        .orTee(console.error)
        .andThen(() => err(error)),
    ),
  )
  .match(noop, (error) => createAlert(error.message, "error"));
```

### Sync transform after async operation

Use `.map()` (not `.andThen`) when the next step is synchronous and doesn't throw. Never chain a sync call via `.then()` on the raw Promise before `getResultAsync` — errors thrown there bypass `orTee`.

```typescript
// sync parseClipboardRows uses .map(); errors from readText() caught by orTee
getResultAsync(() => window.navigator.clipboard.readText())
  .map((text) => parseClipboardRows(text, dataSource))
  .andTee(createRows)
  .orTee((error) => createAlert(error.message, "error"))
  .unwrapOr(undefined);
```

### Abort / cancel (recover from specific error)

```typescript
await getResultAsync(() => showOpenFilePicker())
  .andThen(...)
  .orElse((error) => {
    if (error.name === "AbortError") return ok(undefined); // user cancelled — not an error
    createAlert(error.message, "error");
    return err(error);
  })
  .unwrapOr(undefined);
```

## tRPC Backend Guards

Located in `server/trpc/guards/`. Test once, use everywhere — routers don't repeat null checks.

```typescript
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";

// findFirst → throws TRPCError NOT_FOUND if null
const post = await requireEntity(tx.query.posts.findFirst({ where: ... }), DatabaseEntityType.Post, input.postId);

// insert/update .returning()[0] → throws TRPCError BAD_REQUEST if undefined
const updated = requireMutation(
  (await ctx.db.update(users).set(input).returning())[0],
  Operation.Update,
  DatabaseEntityType.User,
  ctx.getSessionPayload.user.id,
);
```

## Azure Functions (EventGrid handlers): logging & retry

Handlers receive an `InvocationContext`. Log through it — `context.error(...)` / `context.log(...)`, never `console.*`. When a service needs to log, `context` is its **first** parameter (`sendPushNotification`, `sendWebPushNotifications`, `createAndBroadcastMessage`).

Which steps may fail the caller is the repo-wide **persist then notify** standard (`/docs/architecture/persist-then-notify`) — guards and the primary write are fatal, everything after the notify is best-effort. In `packages/app/server` that tail is lint-enforced (the `persist-then-notify` oxlint plugin errors on an unwrapped `await` after an `emit`), so don't re-prescribe it here — this section covers only what the linter can't: a handler adds one mechanic on top — EventGrid delivery is at-least-once, so here a throw is a _retry request_, and the two phases get different loggers.

### Fatal path — rethrow to trigger retry

Top-level handler wrapper. `logAndRethrow` logs then rethrows, so the failure is retried. Use for genuinely retryable steps (input `.parse()`, the persist/create step):

```typescript
return getResultAsync(async () => {
  const input = someSchema.parse(event.data);
  const newMessage = await createAndBroadcastMessage(context, input);
  // ...
}).match(noop, logAndRethrow(context, AzureFunction.ProcessWebhook));
```

### Best-effort path — log through `context`, never rethrow

Rethrowing here asks for a redelivery that reruns the handler from the top, and a message's fresh time-based `rowKey` makes that rerun a **duplicate** rather than an overwrite. Log and swallow — through `context.error`, not `console.error`, so the failure is attached to the invocation:

```typescript
await getResultAsync(() => webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage)).match(
  noop,
  (error) => {
    context.error(`Failed to broadcast message ${newMessage.partitionKey}/${newMessage.rowKey}: `, error);
  },
);
```

Canonical: `createAndBroadcastMessage` (broadcast) and `processWebhookHandler` (push dispatch).

### Past the retries — automatic replay, capped, then quarantined

When retries are exhausted the delivery dead-letters, and recovery from there is automatic and event-triggered, never a script someone remembers to run (`/docs/architecture/no-manual-recovery`). A replay handler:

- **Validates before republishing.** A payload that fails its schema can never succeed — quarantine it immediately instead of spending the attempt budget on it.
- **Carries the attempt count on the event id** (`<eventId>|<attempt>`), the only field republished verbatim into the next dead-letter payload. Anything attached to the stored artifact instead — blob metadata, name, prefix — is lost the moment a failed replay is dead-lettered into a brand-new blob, so that counter restarts at zero every cycle and loops forever (`\docs\infra\eventgrid-dead-letter`).
- **Quarantines past the cap** — move the payload under a prefix the trigger's filter excludes, then `context.error(...)`. Never leave a poison payload where the trigger can pick it up again.

## Finalizers

Both live in `@esposter/shared`. Both run the finalizer regardless of success/failure, then unwrap the original result (throwing on Err). No terminal consumer needed.

Finalizer error handling differs:

- **`withFinalizer`** (sync): finalizer errors are always rethrown.
- **`withFinalizerAsync`** (async/sync mix): finalizer errors rethrown if the original operation succeeded; silently logged via `console.error` if it failed (preserving the original error). Both arguments are plain `() => Promisable<T>`, not `ResultAsync`.

```typescript
// withFinalizer — restoring a global (see ignoreWarn.ts)
return withFinalizer(fn, () => {
  console.warn = warn;
});

// withFinalizerAsync — loading flag pattern
await withFinalizerAsync(
  async () => {
    items.value = await fetchItems();
  },
  () => {
    isPending.value = false;
  },
);
```

For simple loading flags around a `ResultAsync`, set the flag after `await` (ResultAsync resolves to a `Result` instead of rejecting).

## Client Reads/Writes — Don't Hand-Roll the Chain

Most user-facing client reads/writes already have the `getResultAsync` + error-alert chain built in: `useQuery` / `useMutation` (`app/composables/shared/`). Reach for those before writing your own chain around a `$trpc` call — canonical reference and the documented raw-call exceptions: `content/docs/architecture/client-data.md`.
