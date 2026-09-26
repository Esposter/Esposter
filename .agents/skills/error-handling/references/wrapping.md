# What to Wrap

Read when deciding whether a step gets a `Result` at all, or when a chain may be left unterminated. The one-line rules are in `SKILL.md`; this page is their full statement.

- **Wrap only what can actually fail.** A `Result` around a local array/map write, a pure computation, or any body with no I/O and no throwing call in it reads as though that step has a failure mode, so the next reader hunts for one — and it downgrades a genuine programming error into a logged line. Call it bare. The tell that a wrapper is unjustified is its test: if the only way to exercise the err branch is a spy that forces a throw into a function that cannot throw, the wrapper is the thing under test, not the behaviour, and both should go.

- Never leave a `Result`/`ResultAsync` unhandled — finish every chain with `.match(...)`, `.unwrapOr(...)`, or `._unsafeUnwrap()`. **Nothing enforces this**: `neverthrow/must-use-result` needs type-aware parsing, which cost roughly a third of total rule time. An unterminated chain is silent rather than absent — `getResultAsync` starts the work immediately, so the call runs and only the outcome vanishes: the failure lands in a `Result` nobody reads, and never being a rejected promise, it is not an unhandled rejection either. The symptom is a step that appears to have succeeded, which is why this is a review catch and not a lint one.
