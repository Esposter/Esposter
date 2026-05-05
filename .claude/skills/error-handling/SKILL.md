# Error Handling Conventions

Esposter uses **neverthrow** for explicit error handling. No silent swallows — every error is either propagated, logged, or shown to the user.

## Core Utility

```typescript
import { getResult, getResultAsync, noop } from "@esposter/shared";
// getResult: sync fn → Result<T, Error>
// getResultAsync: async fn → ResultAsync<T, Error>
// Always use these instead of fromThrowable or ResultAsync.fromPromise directly.
// noop: () => undefined — use as the ok-handler in .match(noop, errorHandler)
```

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

### Best-effort (still log)

```typescript
await getResultAsync(() => bestEffortOp())
  .orTee(console.error)
  .unwrapOr(undefined);
```

Never leave a `Result` or `ResultAsync` unhandled. Finish every chain with `.match(...)`, `.unwrapOr(...)`, or `._unsafeUnwrap()`.
Never use `catch {}` (silent swallow). Never use `console.warn` — always `.orTee(console.error)`.
Never use `void` with ResultAsync — always `await`. Since ResultAsync never rejects, awaiting is always safe.
Never end a fire-and-forget chain with `.orTee(handler)` alone — it returns `ResultAsync` and the lint rule flags it. Use `.match(noop, handler)` instead.
No-op ok handler: always `noop` (from `@esposter/shared`). Never inline `() => undefined` or `() => {}` — `noop` is the canonical form.

Always use `getResult(() => expr)` for sync throwing operations and `getResultAsync(() => asyncExpr)` for async ones. Never call `fromThrowable` or `ResultAsync.fromPromise` directly.

### Discriminated error types

When you need `instanceof` checks on the error, use `.match()` or `.isErr()`:

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

Use `getResultAsync(() => promise).andThen(...)` chains when different steps need different error handling (`.orElse()` on a specific step) or mid-chain side effects (`.andTee()`).

```typescript
// per-step error recovery — use andThen chain
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
// CORRECT — sync parseClipboardRows uses .map(); errors from readText() caught by orTee
getResultAsync(() => window.navigator.clipboard.readText())
  .map((text) => parseClipboardRows(text, dataSource))
  .andTee(createRows)
  .orTee((error) => createAlert(error.message, "error"))
  .unwrapOr(undefined);

// WRONG — .then() runs outside ResultAsync; parseClipboardRows errors bypass orTee
getResultAsync(() => window.navigator.clipboard.readText().then((text) => parseClipboardRows(text, dataSource)));
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

Located in `server/trpc/guards/`. Test once, use everywhere — routers don't need to repeat null checks.

```typescript
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";

// findFirst → throws TRPCError NOT_FOUND if null
const post = await requireEntity(
  tx.query.posts.findFirst({ where: ... }),
  DatabaseEntityType.Post,
  input.postId,
);

// insert/update .returning()[0] → throws TRPCError BAD_REQUEST if undefined
const updated = requireMutation(
  (await ctx.db.update(users).set(input).returning())[0],
  Operation.Update,
  DatabaseEntityType.User,
  ctx.getSessionPayload.user.id,
);
```

## Finalizers

Use `withFinalizer` when cleanup must run for both Ok and Err outcomes. It runs the finalizer, logs finalizer failure, then unwraps the original result — returning `Promise<T>` (throws on Err). No terminal consumer (`.unwrapOr`, `.match`) is needed.

Both arguments are plain `() => Promisable<T>` — not `ResultAsync`.

```typescript
await withFinalizer(async () => {
  await save();
}, onComplete);
```

For simple loading flags around a `ResultAsync`, set the flag after `await`; `ResultAsync` resolves to a `Result` instead of rejecting.

`useInFlight()` handles loading state automatically — prefer it over manual `isLoading` flags.
