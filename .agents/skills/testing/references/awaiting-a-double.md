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

**The held call signals its arrival, and the next call waits for it.** Over tRPC the client batches every call
issued in one tick into a single request, and a batch answers only once every call in it has settled — so a
second call issued beside a held one joins its batch and waits for the release it was meant to precede, and the
test hangs. Production never issues the two in one tick, so the test issues them apart: the held resolver
resolves a second promise as it is reached, and the test awaits that before the next call.

```ts
const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
const { promise: isReadReached, resolve: onReadReached } = Promise.withResolvers<void>();
trpcMsw.resource.readResource.query(async ({ input }) => {
  if (input.id === resourceId) {
    onReadReached();
    await readGate;
  }
  return createResource(input.id);
});
const pendingRead = readResource();
await isReadReached;
await readResource();
releaseRead();
await pendingRead;
```

## Awaiting a call's effect: the effect, never a flush

A test reading what a tRPC call caused awaits the effect itself — the mocked function it calls resolving a
promise, the ref it writes changing under a `watch` — never `flushPromises()` or a tick count. The transport
decides how many turns a call takes: a batch dispatches a macrotask after the call, and a flush that happened to
outlast an unbatched request no longer outlasts a batched one. A flush count encodes today's scheduling; the
effect is what the test means. Where the effect is local to a component and nothing outside it can await it, the
resolver resolves a promise as the call reaches it and the test awaits that, then flushes once — the flush then
covers only the answer's way back, which is the same for every transport, rather than a dispatch it cannot
predict.

**A `fetch failed` from a call issued after the test ended is a symptom, not the failure.** A test that fails
early leaves its batch to dispatch after `afterAll` has closed msw, so the call reaches the network through the
native `fetch` and fails there — read the first failure in the file, not the rejected call beside it.
