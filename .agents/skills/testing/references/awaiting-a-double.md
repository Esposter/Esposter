# Proving a Caller Awaits Its Double

Read when a test proves a caller awaits its side effect, or two overlapping writes must settle in a fixed order.

## Gate the double, drain one boundary

An ordering contract ("the caller does not return until its side effect is durable") is untestable by observing the side effect afterwards — every assertion that reads it `await`s something first, handing the fire-and-forget chain the turns it needed, so the test passes against the bug. Make the dependency block instead: stub the client so the write returns a promise the test resolves by hand, start the call without awaiting it, drain past one timer boundary (`await new Promise((resolve) => { setTimeout(resolve); })`), and assert the caller has **not** settled; then release and await it. A single one-shot boundary flushes every pending microtask and re-checks nothing, so it is not polling. Verify the test fails against the un-awaited version before keeping it.

**Under fake timers that boundary is `await vi.advanceTimersByTimeAsync(0)`, never a bare `setTimeout` promise** — the clock is frozen, so the `setTimeout` above never fires and the test hangs to its timeout instead of failing on the contract. The sync `vi.advanceTimersByTime` is no substitute either: it fires the timer without ever yielding, so the continuations behind it have not run when the assertion reads, and the awaiting caller looks exactly like the un-awaiting one again. Microtask drains (`flushPromises()`, `waitForSynchronizedFunctions()`) are unaffected — Vitest fakes timers and `Date`, not the microtask queue.

## Two overlapping writes: hold the rejection until the success has settled

A test proving a rollback restores only its own row needs the failing write to unwind against a list the
successful one has **already** shortened. Issued together, the rejection can land first and roll back against a
list nothing has shortened yet — which passes against the whole-list rollback the test exists to rule out. Gate
the failing handler on a promise the successful one resolves, so the order is the test's rather than the
scheduler's.
