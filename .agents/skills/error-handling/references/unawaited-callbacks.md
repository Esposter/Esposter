# Callbacks Nothing Awaits

Read when writing an interval tick, a timer, a fire-and-forget hook, or a promise executor that gates a flow.

- **A callback nothing awaits terminates its own `Result` inside its own body.** An interval tick, a timer, a fire-and-forget hook — nothing holds its promise, so a rejection escapes as an unhandled one and nothing retries. Wrap the whole body and terminate it inside (`getResultAsync(async () => …).match(noop, console.error)`), rather than leaving the terminal handler to a caller that does not exist.

- **When that callback is a promise executor, the err handler also resolves the gate.** `new Promise(getSynchronizedFunction(async (resolve) => …))` is how a Phaser animation or a dialog hands its completion back to the flow waiting on it, and the rejection is swallowed twice over — the drain settles it, and the `Promise` constructor never sees a throw from an `async` executor. Terminating alone therefore trades an invisible failure for a permanent hang: the caller keeps awaiting a gate nothing will ever open. So the err branch logs **and** calls `resolve`, and the caller carries on with the animation skipped rather than the turn stalled.
