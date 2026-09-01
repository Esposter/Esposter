# Finalizers

Read when a chain has to run cleanup whichever way it resolves — choosing between `withFinalizer` and `withFinalizerAsync`, or deciding whether a finalizer is the right shape at all. This page holds the whole rule; `SKILL.md` keeps the chain rules it composes with.

Both live in `@esposter/shared`. Both run the finalizer regardless of success/failure, then unwrap the original result (throwing on Err) — no terminal consumer needed.

- **`withFinalizer`** (sync): finalizer errors are always rethrown.
- **`withFinalizerAsync`** (async/sync mix): finalizer errors rethrown if the original operation succeeded; silently logged via `console.error` if it failed (preserving the original error). Both arguments are plain `() => Promisable<T>`, not `ResultAsync`.
- For simple loading flags around a `ResultAsync`, set the flag after `await` instead — a `ResultAsync` resolves to a `Result` rather than rejecting, so no finalizer is needed.

**A finalizer never wraps a `Result`; a `Result` wraps the finalizer.** Both finalizers throw and neither returns
one, so there is no `.match` on the outside of a `withFinalizerAsync` — nesting it the other way round
(`withFinalizerAsync(() => getResultAsync(…).match(…), finalizer)`) terminates the operation but leaves the
**finalizer's** own rejection escaping, which is the harder one to notice. In a fire-and-forget the outermost
layer therefore has to be `getResultAsync`, because it is the only one of the two that produces something a
`.match` can end:

```typescript
getSynchronizedFunction((argument) =>
  getResultAsync(() => withFinalizerAsync(operation, finalizer)).match(noop, console.error),
);
```

No `async`/`await` is added to reach that shape — `withFinalizerAsync` already returns the promise
`getResultAsync` takes, so writing `async () => await withFinalizerAsync(…)` only trips `require-await`.

**And the shape above is usually not the one you want**, because a terminated chain resolves: the statements
after the `await` run on every path, which is what the finalizer existed to guarantee. So when the finalizer only
resets local state — a flag, an emit, a ref — terminate first and put those lines after the await, and the
finalizer disappears rather than being nested.
