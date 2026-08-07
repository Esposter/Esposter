# Shaping one Result chain

Read when picking the shape of a single chain — a fallback value, an alert, a mid-chain side effect, an `instanceof` branch on the error, an abort, or a cleanup finalizer. The always-on rules — `try` banned, wrap only what can fail, terminate every chain, `.isOk()`/`.isErr()` banned, `noop` as the ok handler — are in `SKILL.md`.

## Sync operation → fallback value

```typescript
return getResult(() => new RegExp(pattern).exec(value)).match(
  (match) => match?.[groupIndex] ?? null,
  () => null,
);
```

## Async operation → alert on failure (composables)

```typescript
await getResultAsync(() => someAsyncOp())
  .andTee((result) => doSomethingWith(result))
  .match(noop, (error) => {
    createAlert(error.message, "error");
  });
```

## Async operation → fallback value (services / routers)

```typescript
return getResultAsync(() => someAsyncOp())
  .orTee(console.error)
  .unwrapOr(defaultValue);
```

Best-effort but still logged: same shape with `.unwrapOr(undefined)`.

## Async operation → boolean success (composables)

```typescript
return getResultAsync(() => auth.save(value)).match(
  () => true,
  (error) => {
    alertStore.createAlert(error.message, "error");
    return false;
  },
);
```

## Discriminated error types

For `instanceof` checks on the error, branch inside the `.match()` err handler:

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

## Chaining multiple fallible steps

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

## Sync transform after async operation

Use `.map()` (not `.andThen`) when the next step is synchronous and doesn't throw. Never chain a sync call via `.then()` on the raw Promise before `getResultAsync` — errors thrown there bypass `orTee`.

```typescript
// sync parseClipboardRows uses .map(); errors from readText() caught by orTee
getResultAsync(() => window.navigator.clipboard.readText())
  .map((text) => parseClipboardRows(text, dataSource))
  .andTee(createRows)
  .orTee((error) => createAlert(error.message, "error"))
  .unwrapOr(undefined);
```

## Abort / cancel (recover from specific error)

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

## Finalizers

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
