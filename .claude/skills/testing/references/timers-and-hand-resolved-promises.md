# Fake timers and hand-resolved promises

Read when a test installs fake timers, asserts a timestamp, exercises throttled or debounced code, or has to hold a call in flight.

## Installing the clock

`vi.useFakeTimers({ now: 0 })` in `beforeEach`, `vi.useRealTimers()` in `afterEach`. One call — never `useFakeTimers()` followed by `setSystemTime(0)`, since `now` pins the clock at install instead of leaving it briefly real. `vi.setSystemTime` only _moves_ time inside a test; `vi.advanceTimersByTime` elapses timers.

**Even a one-test clock is restored in the suite's `afterEach`**, never beside the assertion. A `vi.useRealTimers()` after an `await expect(...)` is skipped the moment that assertion rejects, and every later test inherits a frozen clock. Cleanup is unconditional, like DB rows and global stubs.

## `toFake` is for faking _less_, not more

The default set is wide — `process.hrtime` is in it — so a test that only wants a fixed `createdAt` also freezes the monotonic clock. Anything keyed on a tick then stops advancing: every Azure Table row written to one partition gets an identical `rowKey`, the second write is rejected `409`, and a best-effort writer swallows it, which reads as a production bug in code that is fine.

Name what the test actually asserts on — `vi.useFakeTimers({ now: 0, toFake: ["Date"] })` — whenever the code under test writes a table row or otherwise reads `now()` from `@esposter/shared`.

## A throttled or debounced call wants a bare `vi.useFakeTimers()`

Not `{ now: 0 }`. VueUse's throttle filter compares `Date.now()` against a "last run" starting at `0`, so a clock parked at epoch zero reads the very first call as already inside a window and defers it to the trailing edge — the leading edge never fires and every assertion about the first call fails. Pin the clock only where a test asserts a timestamp.

## Holding a call in flight

**A promise a test resolves by hand is `Promise.withResolvers`, never a `let` closed over by an executor.** Landing a second write beside an in-flight one, closing a dialog mid-read, proving a queue serialises — all need the resolver as a value.

```ts
const { promise, resolve } = Promise.withResolvers<void>();
```

The hand-rolled form declares `let release = noop`, reassigns it from inside `new Promise((resolve) => …)`, and costs a mutable binding, a `noop` that is never the real value, and a type annotation restating what the executor already knows. Destructuring renames at the call site: `{ promise: firstSaveRequested, resolve: signalFirstSave }`.

- It also removes a reason to reach for `mockImplementationOnce`: a mock handing back a promise it does not build is `mockReturnValueOnce(promise)`, which `vitest/prefer-mock-return-shorthand` asks for anyway.
- The `let` stays only where the resolver is genuinely captured from inside a handler the test does not construct — an msw handler that must both signal it was reached and return a body.

## Time offsets

**Never force past or future time with large arbitrary offsets** — `Date.now() + 999_999_999`, `durationMs: 999_999_999` are banned as unstable and unreadable. Against a pinned clock use the minimal offset: `new Date(Date.now() + 1)`, `durationMs: 1` with `lastFooAt: new Date()` for "no time elapsed", `vi.advanceTimersByTime(1)` when time must pass.
