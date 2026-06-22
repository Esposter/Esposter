---
name: error-handling
description: Esposter Error Handling Conventions — neverthrow getResult/getResultAsync (try/catch banned), chaining patterns, finalizers, and tRPC backend guards. Apply when handling errors in components, composables, stores, server routes, or tRPC routers.
---

# Error Handling Conventions

**neverthrow** for explicit error handling. No silent swallows — every error is propagated, logged, or shown to the user.

## try / catch Are BANNED

Never write `try` anywhere (no `try`/`catch`, no `try`/`finally`) in any code — components, composables, stores, server routes, tRPC routers. Use `getResult`/`getResultAsync` + chain methods; for cleanup use `withFinalizer`/`withFinalizerAsync`.

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
- Never leave a `Result`/`ResultAsync` unhandled — finish every chain with `.match(...)`, `.unwrapOr(...)`, or `._unsafeUnwrap()`.
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

For `instanceof` checks on the error, use `.match()` or `.isErr()`:

```typescript
const result = await getResultAsync(() => op());
if (result.isErr()) {
  if (result.error instanceof DOMException) createAlert(result.error.message, "error");
  else console.error(result.error);
  return;
}
const value = result.value;
```

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

For simple loading flags around a `ResultAsync`, set the flag after `await` (ResultAsync resolves to a `Result` instead of rejecting). `useInFlight()` handles loading state automatically — prefer it over manual `isLoading` flags.
