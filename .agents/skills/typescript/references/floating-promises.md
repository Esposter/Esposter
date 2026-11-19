# Replacing `void asyncFn()`

Read when a lint error flags a floating promise, or an async function has to be called from a sync slot.

`no-void` is an error across `.ts` and `.vue` because voiding a promise silences `no-floating-promises` by discarding it: rejections go unhandled and the caller cannot await completion. `getSynchronizedFunction` is the one place permitted to use it, being the sanctioned fire-and-forget primitive.

Stop at the first step that applies.

1. **Can the enclosing function be `async`?** Make it `async` and `await`. This covers nearly every case, including Vue template and emit handlers (`@click`, `@submit`) and any callback typed `Promisable<void>` — Vue does not care that a handler returns a promise.
2. **Do you own the callback's type?** Widen it to `Promisable<void>` (`type-fest`) and `await` it at the call site. Never force callers to `void` their async work. Always the `Promisable<T>` alias, never a hand-written `Promise<T> | T` union, for every maybe-async signature.
3. **A third-party slot typed `void` that its runtime awaits** — a plugin hook such as Vitest's `configureVitest`, declared `=> void` though the caller awaits it. Read the library's source in `node_modules` first: the await there is the evidence, and without it this is step 4. Then keep the function `async`, type the object `satisfies` the library's type (an annotation erases the `Promise` for every caller, so a test awaiting the hook trips `await-thenable`), and put one `oxlint-disable-next-line typescript/no-misused-promises, typescript/strict-void-return` on the hook under an `@TODO` for the upstream type. Callers and tests then `await` the hook directly. Never wrap the call in `Promise.resolve(...)` or `.then(...)` to quiet `await-thenable`, and never `getSynchronizedFunction`, which drops the promise the runtime was going to wait on.
4. **A third-party sync slot you genuinely cannot change** (`onScopeDispose`, `addEventListener`, game-engine callbacks) — wrap with `getSynchronizedFunction(asyncFn)` from `@esposter/shared`, imported explicitly. It drops the promise just like `void`, so it is a last resort rather than a shortcut past steps 1 to 3. A service worker's event handler is the exception: it hands the promise to `event.waitUntil(...)`, which keeps the worker alive until it settles.

If none apply — a sync body with no callback slot to widen — restructure so the sync teardown stays sync and the promise is awaited last. Don't `void` it.
