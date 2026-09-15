# What the try / .then ban does not cover, and the two disables it allows

Read when a callback may throw synchronously and has to become a rejection, when a guard's throw is being kept synchronous for a test, or when a `.then`/`.catch`/`.finally` looks unavoidable. The ban itself and the README exception are in `SKILL.md`; this page is what is not an exception at all, and the only two shapes a disable may take.

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
