# Error Handling Conventions

Esposter uses **neverthrow** for explicit error handling. No silent swallows — every error is either propagated, logged, or shown to the user.

## Core Utility

```typescript
import { toAppError } from "@esposter/shared";
// toAppError: (error: unknown) => Error
// Maps unknown catch values to Error — preserves existing Error instances (including DOMException etc.)
```

## Patterns

### Async operation → alert on failure (composables)

```typescript
await ResultAsync.fromPromise(someAsyncOp(), toAppError)
  .tap((result) => doSomethingWith(result))
  .tapErr((error) => createAlert(error.message, "error"));
```

### Async operation → fallback value (services / routers)

```typescript
return ResultAsync.fromPromise(someAsyncOp(), toAppError).tapErr(console.error).unwrapOr(defaultValue);
```

### Async operation → boolean success (composables)

```typescript
return ResultAsync.fromPromise(auth.save(value), toAppError).match(
  () => true,
  (error) => {
    alertStore.createAlert(error.message, "error");
    return false;
  },
);
```

### Best-effort (still log)

```typescript
await ResultAsync.fromPromise(bestEffortOp(), toAppError).tapErr(console.error);
```

Never use `catch {}` (silent swallow). Never use `console.warn` — always `.tapErr(console.error)`.
Never use `void` with ResultAsync — always `await`. Since ResultAsync never rejects, awaiting is always safe.

### Discriminated error types

When you need `instanceof` checks on the error, use `.match()` or `.isErr()`:

```typescript
const result = await ResultAsync.fromPromise(op(), toAppError);
if (result.isErr()) {
  if (result.error instanceof DOMException) createAlert(result.error.message, "error");
  else console.error(result.error);
  return;
}
const value = result.value;
```

### Chaining multiple fallible steps

```typescript
ResultAsync.fromPromise(step1(), toAppError)
  .andThen((a) => ResultAsync.fromPromise(step2(a), toAppError))
  .andThen((b) => ResultAsync.fromPromise(step3(b), toAppError))
  .tapErr((error) => createAlert(error.message, "error"));
```

### Sync transform after async operation

Use `.map()` (not `.andThen`) when the next step is synchronous and doesn't throw. Never chain a sync call via `.then()` on the raw Promise before `fromPromise` — errors thrown there bypass `tapErr`.

```typescript
// CORRECT — sync parseClipboardRows uses .map(); errors from readText() caught by tapErr
ResultAsync.fromPromise(window.navigator.clipboard.readText(), toAppError)
  .map((text) => parseClipboardRows(text, dataSource))
  .tap(createRows)
  .tapErr((error) => createAlert(error.message, "error"));

// WRONG — .then() runs outside ResultAsync; parseClipboardRows errors bypass tapErr
ResultAsync.fromPromise(
  window.navigator.clipboard.readText().then((text) => parseClipboardRows(text, dataSource)),
  toAppError,
);
```

### Abort / cancel (recover from specific error)

```typescript
ResultAsync.fromPromise(showOpenFilePicker(), toAppError)
  .andThen(...)
  .orElse((error) => {
    if (error.name === "AbortError") return ok(undefined); // user cancelled — not an error
    createAlert(error.message, "error");
    return err(error);
  });
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

## What NOT to convert

Keep `try-catch` for:

- **Azure Functions** that must re-throw for platform retry semantics
- **try-finally for `onComplete` callbacks** in pagination composables — `finally` guarantees the callback even when errors are thrown upstream

## try/finally vs neverthrow

`try/finally` is only needed when you have cleanup that must run even on throw (e.g. `writable.abort()` in file export, `isPending = false` in pagination). With neverthrow, since `ResultAsync` always resolves, you can do:

```typescript
isLoading.value = true;
const result = await someResultAsync;
isLoading.value = false; // always runs — ResultAsync never rejects
result.match(onSuccess, onError);
```

`useInFlight()` handles loading state automatically — prefer it over manual `isLoading` flags.
